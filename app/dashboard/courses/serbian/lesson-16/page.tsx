"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Plane,
  Volume2,
  Mic,
  BookOpen,
  MessageCircle,
  Headphones,
  CheckCircle2,
  ChevronRight,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";


const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

let currentAudio: HTMLAudioElement | null = null;
let onSpeakEnd: (() => void) | null = null;
let currentAbort: AbortController | null = null;

async function speak(
  text: string,
  onEnd?: () => void
): Promise<void> {
  if (typeof window === "undefined") return;

  if (currentAbort) {
    currentAbort.abort();
    currentAbort = null;
  }
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if (onSpeakEnd) {
    onSpeakEnd();
    onSpeakEnd = null;
  }
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }

  onSpeakEnd = onEnd || null;
  const abort = new AbortController();
  currentAbort = abort;

  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal: abort.signal,
    });

    if (abort.signal.aborted) return;
    if (!res.ok) throw new Error("TTS request failed");

    const blob = await res.blob();
    if (abort.signal.aborted) return;

    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    currentAudio = audio;

    audio.onended = () => {
      URL.revokeObjectURL(url);
      currentAudio = null;
      if (onSpeakEnd) {
        onSpeakEnd();
        onSpeakEnd = null;
      }
    };
    await audio.play();
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return;
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.onend = () => {
        if (onSpeakEnd) {
          onSpeakEnd();
          onSpeakEnd = null;
        }
      };
      window.speechSynthesis.speak(utterance);
    }
  }
}

// ---------------- DATA ----------------

const letters = [
  ["А", "A"], ["Б", "B"], ["В", "V"], ["Г", "G"], ["Д", "D"],
  ["Ђ", "Đ"], ["Е", "E"], ["Ж", "ZH"], ["З", "Z"], ["И", "I"],
  ["Ј", "J"], ["К", "K"], ["Л", "L"], ["Љ", "LJ"], ["М", "M"],
  ["Н", "N"], ["Њ", "NJ"], ["О", "O"], ["П", "P"], ["Р", "R"],
  ["С", "S"], ["Т", "T"], ["Ћ", "Ć"], ["У", "U"], ["Ф", "F"],
  ["Х", "H"], ["Ц", "C"], ["Ч", "Č"], ["Џ", "DŽ"], ["Ш", "Š"],
];

const readingPractice = [
  { cyrillic: "РЕСТОРАН", meaning: "Restaurant" },
  { cyrillic: "ХРАНА", meaning: "Food" },
  { cyrillic: "ВОДА", meaning: "Water" },
  { cyrillic: "ХВАЛА", meaning: "Thank you" },
  { cyrillic: "ЈЕЛОВНИК", meaning: "Menu" },
];

const translationPractice = [
  { latin: "voda", answer: "ВОДА" },
  { latin: "hrana", answer: "ХРАНА" },
  { latin: "hvala", answer: "ХВАЛА" },
  { latin: "restoran", answer: "РЕСТОРАН" },
];

const sentencePractice = [
  { latin: "Dobro jutro", cyrillic: "Добро јутро" },
  { latin: "Gde je restoran?", cyrillic: "Где је ресторан?" },
  { latin: "Želim vodu", cyrillic: "Желим воду" },
];

const quiz = [
  {
    question: "What letter is this: Љ ?",
    options: ["LJ", "NJ", "DJ", "J"],
    correct: 0,
  },
  {
    question: "What is 'VODA' in Cyrillic?",
    options: ["вода", "водa", "вoда", "воода"],
    correct: 0,
  },
  {
    question: "Which is correct for 'HRANA'?",
    options: ["храна", "рана", "храно", "хранаa"],
    correct: 0,
  },
];

// ---------------- PAGE ----------------

export default function Lesson16Page() {
  const [answers, setAnswers] = useState<string[]>(
    Array(translationPractice.length).fill("")
  );

  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(
    Array(quiz.length).fill(null)
  );

  return (
    <div className="max-w-4xl mx-auto space-y-12">

      {/* HEADER */}
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <h1 className="text-3xl font-bold">Lesson 16: Cyrillic Alphabet</h1>
        <p className="text-muted-foreground mt-2">
          Learn reading, writing, and pronunciation of Serbian Cyrillic
        </p>
      </motion.div>

      {/* ALPHABET */}
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <h2 className="text-xl font-semibold mb-3">Alphabet</h2>

        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {letters.map(([cyr, lat], i) => (
            <div key={i} className="p-3 border rounded-lg bg-card flex justify-between">
              <span className="text-xl font-bold">{cyr}</span>

              <Button size="sm" variant="ghost" onClick={() => speak(cyr)}>
                <Volume2 className="h-4 w-4" />
              </Button>

              <span className="text-xs text-muted-foreground">{lat}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* READING */}
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <h2 className="text-xl font-semibold mb-3">Read & Understand</h2>

        <div className="space-y-3">
          {readingPractice.map((item, i) => (
            <div key={i} className="flex justify-between border p-3 rounded-lg bg-card">
              <div>
                <p className="font-bold text-lg">{item.cyrillic}</p>
                <p className="text-sm text-muted-foreground">{item.meaning}</p>
              </div>

              <Button size="sm" onClick={() => speak(item.cyrillic)}>
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* TRANSLATION */}
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <h2 className="text-xl font-semibold mb-3">Translate to Cyrillic</h2>

        <div className="space-y-3">
          {translationPractice.map((item, i) => (
            <div key={i} className="border p-3 rounded-lg bg-card">
              <p className="font-medium mb-2">{item.latin}</p>

              <input
                value={answers[i]}
                onChange={(e) => {
                  const copy = [...answers];
                  copy[i] = e.target.value;
                  setAnswers(copy);
                }}
                className="w-full border p-2 rounded"
                placeholder="Type Cyrillic..."
              />
            </div>
          ))}
        </div>
      </motion.div>

      {/* SENTENCES */}
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <h2 className="text-xl font-semibold mb-3">Sentence Practice</h2>

        <div className="space-y-3">
          {sentencePractice.map((item, i) => (
            <div key={i} className="flex justify-between border p-3 rounded-lg bg-card">
              <div>
                <p className="text-sm text-muted-foreground">{item.latin}</p>
                <p className="font-bold">{item.cyrillic}</p>
              </div>

              <Button size="sm" onClick={() => speak(item.cyrillic)}>
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* QUIZ */}
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <h2 className="text-xl font-semibold mb-3">Quiz</h2>

        <div className="space-y-6">
          {quiz.map((q, i) => (
            <div key={i} className="border p-4 rounded-lg bg-card">
              <p className="font-medium mb-3">{q.question}</p>

              <div className="space-y-2">
                {q.options.map((opt, idx) => {
                  const selected = quizAnswers[i] === idx;
                  const isCorrect = idx === q.correct;
                  const isWrong = selected && idx !== q.correct;

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        const copy = [...quizAnswers];
                        copy[i] = idx;
                        setQuizAnswers(copy);
                      }}
                      className={`block w-full text-left border p-2 rounded transition ${
                        selected && isCorrect
                          ? "bg-green-200 border-green-500"
                          : selected && isWrong
                          ? "bg-red-200 border-red-500"
                          : "hover:bg-muted"
                      }`}
                    >
                      {opt}

                      {selected && isCorrect && (
                        <p className="text-green-600 text-xs mt-1">Correct!</p>
                      )}

                      {selected && isWrong && (
                        <p className="text-red-600 text-xs mt-1">Incorrect</p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

    </div>
  );
}