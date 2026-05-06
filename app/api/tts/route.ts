import { NextRequest, NextResponse } from "next/server";

const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel

const VOICE_BY_LANG: Record<string, string> = {
  "tr-TR": "i1TucDpQnxpmWAx4aUAX", // Sayed
  "sr-Latn-RS": "4qzzOCHeXnGE5uxuQEWA", // Iva
  "ru-RU": "JKtNvDNrWu33P1xzttP2", // Ivan
  "es-ES": "6Gr4AVmTax1pMJO0lHRK", // Catalina
  "fr-FR": "odOFTFZU3DvAZ3EV3KHi", // Lucas
  "de-DE": "wcqN36SUOZ0EhToc2OIu", // Daniel
  "ja-JP": "17ljzcHzSunXNkdixIEa", // Hirokoji
  "it-IT": "zFA34HbdHBvF8WhlSusK", // Nora
  "pt-BR": "ejarTsrf33xoVlH9hMuy", // Luis
  "hi-IN": "1qEiC6qsybMkmnNdVMbK", // Monika Sogam (native Hindi)
  "ar-SA": "albaa6OioIhKtKdCEkQw",
  "en-US": DEFAULT_VOICE_ID,
};

const OPENAI_TTS_VOICE_BY_LANG: Record<string, string> = {
  "fa-IR": "nova",
};

async function speakWithOpenAI(text: string, voice: string) {
  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "tts-1",
      voice,
      input: text,
      response_format: "mp3",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI TTS: ${errorText}`);
  }

  const audioBuffer = Buffer.from(await response.arrayBuffer());
  return new NextResponse(audioBuffer, {
    status: 200,
    headers: { "Content-Type": "audio/mpeg" },
  });
}

async function speakWithElevenLabs(text: string, voiceId: string) {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVENLABS_API_KEY!,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.6,
          similarity_boost: 0.8,
          speed: 0.75,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ElevenLabs TTS: ${errorText}`);
  }

  const audioBuffer = Buffer.from(await response.arrayBuffer());
  return new NextResponse(audioBuffer, {
    status: 200,
    headers: { "Content-Type": "audio/mpeg" },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { text, lang } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "text is required" },
        { status: 400 }
      );
    }

    if (typeof lang === "string" && OPENAI_TTS_VOICE_BY_LANG[lang]) {
      return await speakWithOpenAI(text, OPENAI_TTS_VOICE_BY_LANG[lang]);
    }

    const voiceId =
      (typeof lang === "string" && VOICE_BY_LANG[lang]) || DEFAULT_VOICE_ID;
    return await speakWithElevenLabs(text, voiceId);
  } catch (error: unknown) {
    console.error("TTS error:", error);
    const message = error instanceof Error ? error.message : "TTS failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
