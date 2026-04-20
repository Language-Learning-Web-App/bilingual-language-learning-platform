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

    // Choose voice (optional logic)
    const voice =
      lang === "tr-TR"
        ? "shimmer"
        : "alloy";

    const response = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice,
      input: text,
      response_format: "mp3",
    });

    const buffer = Buffer.from(await response.arrayBuffer());

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
      },
    });

  } catch (error: any) {
    console.error("TTS error:", error);
    return NextResponse.json(
      { error: error.message || "TTS failed" },
      { status: 500 }
    );
  }
}