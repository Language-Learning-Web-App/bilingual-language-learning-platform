import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { text, lang } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    const isTurkish = lang === "tr-TR";

    const instructions = isTurkish
      ? "Speak clearly in Turkish with a natural, friendly tone. Pronounce each word carefully for a language learner. Moderate pace."
      : "Speak clearly in English with a natural, friendly tone. Moderate pace.";

    const mp3 = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "shimmer",
      input: text,
      instructions,
      response_format: "mp3",
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "TTS generation failed";
    console.error("TTS error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
