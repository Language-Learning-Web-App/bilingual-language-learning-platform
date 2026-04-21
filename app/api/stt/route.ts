import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const OPENAI_WHISPER_ENDPOINT =
  "https://api.openai.com/v1/audio/transcriptions";
const ELEVENLABS_STT_ENDPOINT =
  "https://api.elevenlabs.io/v1/speech-to-text";

const ELEVENLABS_LANGUAGES = new Set(["fa", "ar"]);
const MIN_AUDIO_BYTES = 8000;

const HALLUCINATION_PATTERNS: RegExp[] = [
  /^امتحان\s*کنید\.?$/,
  /^زیرنویس\s*فارسی/,
  /^ترجمه\s*(و\s*)?زیرنویس/,
  /^با\s*عرض\s*پوزش\.?$/,
  /^مطمئنا\.?$/,
  /^ممنون(?:م)?\.?$/,
  /^تشکر\.?$/,
  /^شکرا(?:\s*لك)?\.?$/,
  /^ترجم(?:ة|ه)\s*نور(?:ا|الدين)/,
  /^subtitles\s*by/i,
  /^thanks\s*for\s*watching/i,
];

function looksLikeHallucination(text: string): boolean {
  const cleaned = text.replace(/[\s\u200c]+/g, " ").trim();
  if (!cleaned) return true;
  return HALLUCINATION_PATTERNS.some((re) => re.test(cleaned));
}

function normalizeLanguage(raw: string | null): string | null {
  if (!raw) return null;
  const base = raw.toLowerCase().split(/[-_]/)[0];
  if (base === "tr" || base === "fa" || base === "ar" || base === "en") {
    return base;
  }
  return null;
}

type ProviderResult =
  | { ok: true; text: string }
  | { ok: false; status: number; detail: string };

async function transcribeWithElevenLabs(
  file: Blob,
  filename: string,
  language: string | null,
  modelId: "scribe_v2" | "scribe_v1" = "scribe_v2"
): Promise<ProviderResult> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      status: 500,
      detail: "Missing ELEVENLABS_API_KEY on server",
    };
  }

  const form = new FormData();
  form.append("file", file, filename);
  form.append("model_id", modelId);
  if (language) form.append("language_code", language);

  const response = await fetch(ELEVENLABS_STT_ENDPOINT, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      Accept: "application/json",
    },
    body: form,
  });

  if (!response.ok) {
    const detail = await response.text();
    return { ok: false, status: response.status, detail };
  }

  const data = (await response.json()) as { text?: string };
  return { ok: true, text: (data.text ?? "").trim() };
}

async function transcribeWithWhisper(
  file: Blob,
  filename: string,
  language: string | null
): Promise<ProviderResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      status: 500,
      detail: "Missing OPENAI_API_KEY on server",
    };
  }

  const form = new FormData();
  form.append("file", file, filename);
  form.append("model", "whisper-1");
  if (language) form.append("language", language);
  form.append("response_format", "json");
  form.append("temperature", "0");

  const response = await fetch(OPENAI_WHISPER_ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });

  if (!response.ok) {
    const detail = await response.text();
    return { ok: false, status: response.status, detail };
  }

  const data = (await response.json()) as { text?: string };
  return { ok: true, text: (data.text ?? "").trim() };
}

export async function POST(req: NextRequest) {
  try {
    const incoming = await req.formData();
    const file = incoming.get("audio");
    const langValue = incoming.get("language");
    const language = normalizeLanguage(
      typeof langValue === "string" ? langValue : null
    );

    if (!(file instanceof Blob)) {
      return NextResponse.json(
        { error: "Missing audio blob in 'audio' field" },
        { status: 400 }
      );
    }

    const filename = (file as File).name || "speech.webm";
    const audioBytes = file.size;

    console.log("[stt] request", {
      language,
      filename,
      audioBytes,
      mimeType: file.type,
    });

    if (audioBytes < MIN_AUDIO_BYTES) {
      return NextResponse.json(
        {
          error: "AUDIO_TOO_SHORT",
          detail:
            "The recorded audio is empty or too short. Please hold the microphone longer and speak clearly.",
          audioBytes,
        },
        { status: 400 }
      );
    }

    const useElevenLabs = language != null && ELEVENLABS_LANGUAGES.has(language);

    let primary: ProviderResult;
    let primaryProvider: "elevenlabs" | "openai";

    if (useElevenLabs) {
      primaryProvider = "elevenlabs";
      primary = await transcribeWithElevenLabs(
        file,
        filename,
        language,
        "scribe_v2"
      );
      if (!primary.ok) {
        console.log("[stt] scribe_v2 failed, trying scribe_v1", {
          status: primary.status,
          detail: primary.detail?.slice(0, 200),
        });
        primary = await transcribeWithElevenLabs(
          file,
          filename,
          language,
          "scribe_v1"
        );
      }
    } else {
      primaryProvider = "openai";
      primary = await transcribeWithWhisper(file, filename, language);
    }

    if (primary.ok && primary.text && !looksLikeHallucination(primary.text)) {
      console.log("[stt] success", {
        provider: primaryProvider,
        textPreview: primary.text.slice(0, 120),
      });
      return NextResponse.json({
        text: primary.text,
        provider: primaryProvider,
        audioBytes,
      });
    }

    if (primary.ok && primary.text) {
      console.log("[stt] primary produced hallucination, trying fallback", {
        provider: primaryProvider,
        textPreview: primary.text.slice(0, 120),
      });
    }

    const otherProvider: "elevenlabs" | "openai" =
      primaryProvider === "elevenlabs" ? "openai" : "elevenlabs";
    const fallback: ProviderResult = useElevenLabs
      ? await transcribeWithWhisper(file, filename, language)
      : await transcribeWithElevenLabs(file, filename, language, "scribe_v2");

    if (
      fallback.ok &&
      fallback.text &&
      !looksLikeHallucination(fallback.text)
    ) {
      console.log("[stt] fallback success", {
        provider: otherProvider,
        textPreview: fallback.text.slice(0, 120),
      });
      return NextResponse.json({
        text: fallback.text,
        provider: otherProvider,
        fallback: true,
        audioBytes,
      });
    }

    console.log("[stt] both providers returned empty or errored", {
      primary:
        "detail" in primary ? primary.detail?.slice(0, 200) : "empty_text",
      fallback:
        "detail" in fallback ? fallback.detail?.slice(0, 200) : "empty_text",
    });

    return NextResponse.json(
      {
        error: "EMPTY_TRANSCRIPT",
        detail:
          "No speech detected in the recording. Please try again and speak clearly.",
        audioBytes,
      },
      { status: 422 }
    );
  } catch (error) {
    console.log("[stt] exception", String(error));
    return NextResponse.json(
      { error: "STT failed", detail: String(error) },
      { status: 500 }
    );
  }
}
