import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import sdk from "microsoft-cognitiveservices-speech-sdk";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { text, lang } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    if (lang === "sr-RS") {
      const speechConfig = sdk.SpeechConfig.fromSubscription(
        process.env.AZURE_SPEECH_KEY!,
        process.env.AZURE_SPEECH_REGION!
      );

      speechConfig.speechSynthesisLanguage = "sr-RS";
      speechConfig.speechSynthesisVoiceName = "Nicholas";
      const synthesizer = new sdk.SpeechSynthesizer(speechConfig, null);

      const audioBuffer: Buffer = await new Promise((resolve, reject) => {
        synthesizer.speakTextAsync(
          text,
          (res) => {
            synthesizer.close();
            resolve(Buffer.from(res.audioData));
          },
          (err) => {
            synthesizer.close();
            reject(err);
          }
        );
      });

      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(audioBuffer);
          controller.close();
        },
      });

      return new NextResponse(stream, {
        status: 200,
        headers: {
          "Content-Type": "audio/mpeg",
        },
      });
    }

    // 2. Turkish + English → OpenAI TTS
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