import { NextRequest, NextResponse } from "next/server";

const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel

const VOICE_BY_LANG: Record<string, string> = {
  "tr-TR": "ErXwobaYiN019PkySvjV", // Antoni
  "fa-IR": "pNInz6obpgDQGcFmaJgB", // Adam
  "sr-Latn-RS": "AZnzlk1XvdvUeBnXmlld", // Domi
  "ru-RU": "onwK4e9ZLuTAKqWW03F9", // Daniel
  "es-ES": "EXAVITQu4vr4xnSDxMaL", // Bella
  "fr-FR": "IKne3meq5aSn9XLyUdCD", // Charlie
  "de-DE": "ErXwobaYiN019PkySvjV", // Antoni
  "ja-JP": "AZnzlk1XvdvUeBnXmlld", // Domi
  "en-US": DEFAULT_VOICE_ID,
};

export async function POST(req: NextRequest) {
  try {
    const { text, lang } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "text is required" },
        { status: 400 }
      );
    }

    const voiceId =
      (typeof lang === "string" && VOICE_BY_LANG[lang]) || DEFAULT_VOICE_ID;

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
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error: unknown) {
    console.error("ElevenLabs TTS error:", error);
    const message = error instanceof Error ? error.message : "TTS failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
