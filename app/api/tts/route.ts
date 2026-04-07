import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { text, lang } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    // 1. Serbian → open‑source XTTS v2 TTS server
    if (lang === "sr-RS") {
      const ttsResponse = await fetch("http://localhost:5000/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!ttsResponse.ok) {
        throw new Error("XTTS TTS server error");
      }

      const audioBuffer = Buffer.from(await ttsResponse.arrayBuffer());

      return new NextResponse(audioBuffer, {
        status: 200,
        headers: {
          "Content-Type": "audio/wav",
        },
      });
    }

    // 2. Non‑Serbian → example Groq text processing (no TTS here)
    const completion = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [
        {
          role: "system",
          content: "Rewrite this text naturally and clearly.",
        },
        {
          role: "user",
          content: text,
        },
      ],
    });

    const rewritten = completion.choices[0].message.content ?? text;

    // You can later send `rewritten` to some other TTS provider if you want.
    return NextResponse.json({ text: rewritten });
  } catch (error: any) {
    console.error("TTS error:", error);
    return NextResponse.json(
      { error: error.message || "TTS failed" },
      { status: 500 }
    );
  }
}
