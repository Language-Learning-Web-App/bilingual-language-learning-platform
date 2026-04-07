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
  lang: "tr-TR" | "en-US" = "tr-TR",
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
      body: JSON.stringify({ text, lang }),
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
      utterance.lang = lang;
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

const vocabulary = [
  { turkish: "Havalimanı", english: "Airport" },
  { turkish: "Bilet", english: "Ticket" },
  { turkish: "Pasaport", english: "Passport" },
  { turkish: "Bavul", english: "Suitcase" },
  { turkish: "El bagajı", english: "Hand luggage" },
  { turkish: "Kapı", english: "Gate" },
  { turkish: "Uçuş", english: "Flight" },
  { turkish: "Kalkış", english: "Departure" },
  { turkish: "Varış", english: "Arrival" },
  { turkish: "Gecikme", english: "Delay" },
];

const keySentences = [
  { turkish: "Uçuşum saat kaçta?", english: "What time is my flight?" },
  { turkish: "Bu benim pasaportum.", english: "This is my passport." },
  { turkish: "Kapı nerede?", english: "Where is the gate?" },
  { turkish: "Bavulumu teslim etmek istiyorum.", english: "I want to check my suitcase." },
  { turkish: "Uçuş gecikti mi?", english: "Is the flight delayed?" },
  { turkish: "Uçağa ne zaman bineceğiz?", english: "When will we board the plane?" },
];

const dialogue = [
  { speaker: "Staff", text: "Merhaba, pasaportunuz lütfen.", english: "Hello, your passport please." },
  { speaker: "You", text: "Merhaba, buyurun.", english: "Hello, here you go." },
  { speaker: "Staff", text: "Biletiniz var mı?", english: "Do you have your ticket?" },
  { speaker: "You", text: "Evet, işte biletim.", english: "Yes, here is my ticket." },
  { speaker: "Staff", text: "Bavulunuz var mı?", english: "Do you have a suitcase?" },
  { speaker: "You", text: "Evet, bir bavulum ve bir el bagajım var.", english: "Yes, I have one suitcase and one hand luggage." },
  { speaker: "Staff", text: "Teşekkür ederim. Kapı numarası 12.", english: "Thank you. Gate number 12." },
  { speaker: "You", text: "Teşekkür ederim. Kapı nerede?", english: "Thank you. Where is the gate?" },
  { speaker: "Staff", text: "Düz gidin ve sağa dönün.", english: "Go straight and turn right." },
  { speaker: "You", text: "Tamam, teşekkürler!", english: "Okay, thanks!" },
];

const listeningQuestions = [
  {
    prompt: "Pasaportunuz lütfen.",
    promptEnglish: "Your passport please.",
    options: [
      { text: "Buyurun.", english: "Here you go." },
      { text: "Kapı nerede?", english: "Where is the gate?" },
      { text: "Teşekkürler.", english: "Thanks." },
    ],
    correct: 0,
  },
  {
    prompt: "Biletiniz var mı?",
    promptEnglish: "Do you have your ticket?",
    options: [
      { text: "Bavulumu teslim etmek istiyorum.", english: "I want to check my suitcase." },
      { text: "Evet, işte biletim.", english: "Yes, here is my ticket." },
      { text: "Merhaba.", english: "Hello." },
    ],
    correct: 1,
  },
  {
    prompt: "Kapı nerede?",
    promptEnglish: "Where is the gate?",
    options: [
      { text: "Teşekkür ederim.", english: "Thank you." },
      { text: "Evet, bir bavulum var.", english: "Yes, I have a suitcase." },
      { text: "Düz gidin ve sağa dönün.", english: "Go straight and turn right." },
    ],
    correct: 2,
  },
  {
    prompt: "Bavulunuz var mı?",
    promptEnglish: "Do you have a suitcase?",
    options: [
      { text: "Evet, bir bavulum ve bir el bagajım var.", english: "Yes, I have one suitcase and one hand luggage." },
      { text: "İstanbul'a uçuyorum.", english: "I am flying to Istanbul." },
      { text: "Biletim yok.", english: "I don't have a ticket." },
    ],
    correct: 0,
  },
  {
    prompt: "Uçuşum saat kaçta?",
    promptEnglish: "What time is my flight?",
    options: [
      { text: "Kapı numarası 12.", english: "Gate number 12." },
      { text: "Saat üçte.", english: "At three o'clock." },
      { text: "Havalimanı çok büyük.", english: "The airport is very big." },
    ],
    correct: 1,
  },
];

const quizQuestions = [
  {
    question: "What does \"Havalimanı\" mean?",
    options: ["Hotel", "Airport", "Train Station", "Bus Stop"],
    correct: 1,
    turkish: "Havalimanı",
  },
  {
    question: "How do you say \"passport\" in Turkish?",
    options: ["Bilet", "Bavul", "Pasaport", "Kapı"],
    correct: 2,
    turkish: "Pasaport",
  },
  {
    question: "What does \"Uçuş gecikti mi?\" mean?",
    options: [
      "Where is my flight?",
      "Is the flight delayed?",
      "When does the flight leave?",
      "Is this my gate?",
    ],
    correct: 1,
    turkish: "Uçuş gecikti mi?",
  },
  {
    question: "How do you say \"suitcase\" in Turkish?",
    options: ["El bagajı", "Kapı", "Bavul", "Bilet"],
    correct: 2,
    turkish: "Bavul",
  },
  {
    question: "What is the correct response to \"Pasaportunuz lütfen\"?",
    options: [
      "Teşekkürler",
      "Tamam",
      "Buyurun",
      "Güle güle",
    ],
    correct: 2,
    turkish: "Buyurun",
  },
];

const PASSING_PERCENT = 80;
const QUIZ_ATTEMPTS_KEY = "bllp-turkish-lesson-1-attempts";
const LISTENING_ATTEMPTS_KEY = "bllp-turkish-lesson-1-listening-attempts";

interface QuizAttempt {
  score: number;
  total: number;
  passed: boolean;
  date: string;
}

function loadAttempts(): QuizAttempt[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(QUIZ_ATTEMPTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadListeningCompletedDate(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(LISTENING_ATTEMPTS_KEY);
  } catch {
    return null;
  }
}

const STORAGE_KEY = "bllp-turkish-lesson-1";

const sectionLabels = [
  "Vocabulary",
  "Key Sentences",
  "Mini Dialogue",
  "Listening Practice",
  "Speaking Practice",
  "Quiz",
];

function loadProgress(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
}

const aiPrompts = [
  {
    ai: "Merhaba. Nereye uçuyorsunuz?",
    aiEnglish: "Hello. Where are you flying to?",
    expected: "İstanbul'a uçuyorum.",
    expectedEnglish: "I am flying to Istanbul.",
  },
  {
    ai: "Pasaportunuz lütfen.",
    aiEnglish: "Your passport please.",
    expected: "Buyurun, işte pasaportum.",
    expectedEnglish: "Here you go, here is my passport.",
  },
  {
    ai: "Bavulunuz kaç kilo?",
    aiEnglish: "How many kilos is your suitcase?",
    expected: "Yirmi kilo.",
    expectedEnglish: "Twenty kilos.",
  },
];

function SpeakingPracticeSection({ onNext }: { onNext: () => void }) {
  const [messages, setMessages] = useState<
    { role: "ai" | "you"; text: string; english?: string }[]
  >([
    {
      role: "ai",
      text: aiPrompts[0].ai,
      english: aiPrompts[0].aiEnglish,
    },
  ]);
  const [promptIndex, setPromptIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Try Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "tr-TR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setListening(true);
    setTranscript("");

    recognition.onresult = (event: any) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
      setListening(false);

      const current = aiPrompts[promptIndex];
      const userMsg: { role: "ai" | "you"; text: string; english?: string } = {
        role: "you",
        text: result,
      };

      if (result.toLowerCase().replace(/[.!?]/g, "") === current.expected.toLowerCase().replace(/[.!?]/g, "")) {
        userMsg.english = current.expectedEnglish;
      }

      const nextIndex = promptIndex + 1;
      const newMessages = [...messages, userMsg];

      if (nextIndex < aiPrompts.length) {
        newMessages.push({
          role: "ai",
          text: aiPrompts[nextIndex].ai,
          english: aiPrompts[nextIndex].aiEnglish,
        });
        setPromptIndex(nextIndex);
      }

      setMessages(newMessages);
      setShowHint(false);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  };

  const allDone =
    promptIndex >= aiPrompts.length - 1 &&
    messages.filter((m) => m.role === "you").length >= aiPrompts.length;

  return (
    <motion.section
      key="speaking"
      variants={fadeUp}
      initial="hidden"
      animate="show"
      exit="hidden"
    >
      <div className="flex items-center gap-2 mb-4">
        <Mic className="h-5 w-5 text-rose-500" />
        <h2 className="text-lg font-semibold">Speaking Practice – AI Roleplay</h2>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="p-5 space-y-4 max-h-[400px] overflow-y-auto">
          {messages.map((msg, i) => (
            <div key={i}>
              <p
                className={`text-[10px] font-semibold uppercase tracking-wide mb-1 ${
                  msg.role === "you"
                    ? "text-right text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {msg.role === "ai" ? "AI Tutor" : "You"}
              </p>
              <div
                className={`flex ${msg.role === "you" ? "justify-end" : ""}`}
              >
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${
                    msg.role === "ai"
                      ? "bg-muted text-foreground"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
              {msg.english && (
                <p
                  className={`mt-1 text-xs text-muted-foreground/70 italic ${
                    msg.role === "you" ? "text-right pr-1" : "pl-1"
                  }`}
                >
                  {msg.english}
                </p>
              )}
            </div>
          ))}
        </div>

        {!allDone && (
          <div className="border-t p-4 text-center">
            {showHint && (
              <p className="text-xs text-muted-foreground mb-3">
                Hint:{" "}
                <span className="font-medium">
                  {aiPrompts[promptIndex].expected}
                </span>
                <span className="text-muted-foreground/60 ml-1">
                  ({aiPrompts[promptIndex].expectedEnglish})
                </span>
              </p>
            )}

            {transcript && (
              <p className="text-xs text-muted-foreground mb-3">
                Heard: &ldquo;{transcript}&rdquo;
              </p>
            )}

            <button
              onClick={startListening}
              disabled={listening}
              className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full transition-all ${
                listening
                  ? "bg-red-500 text-white animate-pulse scale-110"
                  : "bg-primary/10 text-primary hover:bg-primary/20 hover:scale-105"
              }`}
            >
              <Mic className="h-7 w-7" />
            </button>
            <p className="mt-3 text-sm text-muted-foreground">
              {listening
                ? "Listening... speak now"
                : "Tap the microphone and speak in Turkish"}
            </p>

            <button
              onClick={() => setShowHint(true)}
              className="mt-3 text-xs text-primary hover:underline"
            >
              Need a hint?
            </button>
          </div>
        )}

        {allDone && (
          <div className="border-t p-4 text-center">
            <p className="text-sm font-medium text-emerald-600 mb-2">
              Great job! You completed all the speaking prompts.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={onNext}>
          Continue to Quiz <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </motion.section>
  );
}

export default function TurkishLesson1Page() {
  const [mounted, setMounted] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [highestReached, setHighestReached] = useState(0);
  const [reviewMode, setReviewMode] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(
    Array(quizQuestions.length).fill(null)
  );
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizPaused, setQuizPaused] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [listeningStarted, setListeningStarted] = useState(false);
  const [listeningStep, setListeningStep] = useState(0);
  const [listeningSelected, setListeningSelected] = useState<number | null>(null);
  const [listeningLocked, setListeningLocked] = useState(false);
  const [listeningDone, setListeningDone] = useState(false);
  const [listeningScore, setListeningScore] = useState(0);
  const [listeningRevealed, setListeningRevealed] = useState<Set<number>>(new Set());
  const [listeningCompletedDate, setListeningCompletedDate] = useState<string | null>(null);

  useEffect(() => {
    const saved = loadProgress();
    const completed = saved >= sectionLabels.length;
    setHighestReached(saved);
    setCurrentSection(completed ? 0 : saved);
    setReviewMode(completed);
    setAttempts(loadAttempts());
    setMounted(true);
  }, []);

  const started = true;

  useEffect(() => {
    if (!mounted) return;
    if (!reviewMode && currentSection > highestReached) {
      setHighestReached(currentSection);
      localStorage.setItem(STORAGE_KEY, String(currentSection));
    }
  }, [currentSection, highestReached, reviewMode, mounted]);

  if (!mounted) return null;

  const jumpToSection = (index: number) => {
    setCurrentSection(index);
    setQuizSubmitted(false);
    setQuizStarted(false);
    setQuizPaused(false);
    setShowCancelConfirm(false);
    setQuizAnswers(Array(quizQuestions.length).fill(null));
    setListeningStarted(false);
    setListeningStep(0);
    setListeningSelected(null);
    setListeningLocked(false);
    setListeningDone(false);
    setListeningScore(0);
    setListeningRevealed(new Set());
    setListeningCompletedDate(loadListeningCompletedDate());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSpeak = (id: string, text: string, lang: "tr-TR" | "en-US" = "tr-TR") => {
    if (playingId === id) {
      if (currentAudio) { currentAudio.pause(); currentAudio = null; }
      setPlayingId(null);
      return;
    }
    setPlayingId(id);
    speak(text, lang, () => setPlayingId(null));
  };

  const handleNext = () => {
    const next = currentSection + 1;
    setCurrentSection(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const score = quizAnswers.filter(
    (a, i) => a === quizQuestions[i].correct
  ).length;

  const progressPercent = Math.round(
    ((Math.max(highestReached, currentSection) + (quizSubmitted ? 1 : 0)) / sectionLabels.length) * 100
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/courses/turkish"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Turkish
        </Link>

        <div className="flex items-center gap-4 mt-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-500">
            <Plane className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">
              Lesson 1 — At the Airport
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Focus: Check-in, boarding, baggage
            </p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {started && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>{sectionLabels[Math.min(currentSection, sectionLabels.length - 1)]}</span>
            <span>{reviewMode ? "Completed — Review Mode" : `${progressPercent}% complete`}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {sectionLabels.map((label, i) => {
              const completed =
                i < highestReached ||
                (i === sectionLabels.length - 1 && quizSubmitted);
              const active = i === currentSection;
              const clickable = reviewMode || i <= highestReached;

              return (
                <button
                  key={label}
                  onClick={() => clickable && jumpToSection(i)}
                  disabled={!clickable}
                  className={`flex items-center gap-1 text-[10px] transition-colors ${
                    clickable ? "cursor-pointer hover:text-primary" : "cursor-default"
                  } ${
                    completed
                      ? "text-primary"
                      : active
                      ? "text-foreground font-medium"
                      : "text-muted-foreground/50"
                  }`}
                >
                  {(reviewMode || completed) ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : null}
                  <span className="hidden sm:inline">{label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Sections */}
      <AnimatePresence mode="wait">
        {/* Section 0: Vocabulary */}
        {started && currentSection === 0 && (
          <motion.section
            key="vocab"
            variants={fadeUp}
            initial="hidden"
            animate="show"
            exit="hidden"
          >
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-5 w-5 text-emerald-500" />
              <h2 className="text-lg font-semibold">Vocabulary</h2>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {vocabulary.map((word) => {
                const id = `vocab-${word.turkish}`;
                const isPlaying = playingId === id;
                return (
                  <div
                    key={word.turkish}
                    className="relative overflow-hidden rounded-lg border bg-card px-4 py-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <div>
                        <span className="font-semibold text-foreground">{word.turkish}</span>
                        <span className="ml-2 text-sm text-muted-foreground">– {word.english}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSpeak(id, `${word.turkish}. ${word.english}`, "tr-TR")}
                        className={`shrink-0 rounded-full p-1.5 transition-colors ${
                          isPlaying
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                        }`}
                        title={`Listen: ${word.turkish}`}
                      >
                        <Volume2 className="h-4 w-4" />
                      </button>
                    </div>
                    {isPlaying && (
                      <div className="absolute bottom-0 left-0 w-full h-1 overflow-hidden">
                        <div
                          className="h-full w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent"
                          style={{ animation: "progress-sweep 1.2s ease-in-out infinite" }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={handleNext}>
                Continue <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </motion.section>
        )}

        {/* Section 1: Key Sentences */}
        {started && currentSection === 1 && (
          <motion.section
            key="sentences"
            variants={fadeUp}
            initial="hidden"
            animate="show"
            exit="hidden"
          >
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg font-semibold">Key Sentences</h2>
            </div>
            <div className="space-y-3">
              {keySentences.map((s) => {
                const id = `sentence-${s.turkish}`;
                const isPlaying = playingId === id;
                return (
                  <div
                    key={s.turkish}
                    className="relative overflow-hidden rounded-lg border bg-card px-4 py-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3 relative z-10">
                      <div>
                        <p className="font-medium text-foreground">{s.turkish}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{s.english}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSpeak(id, `${s.turkish}. ${s.english}`, "tr-TR")}
                        className={`shrink-0 mt-0.5 rounded-full p-1.5 transition-colors ${
                          isPlaying
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                        }`}
                        title={`Listen: ${s.turkish}`}
                      >
                        <Volume2 className="h-4 w-4" />
                      </button>
                    </div>
                    {isPlaying && (
                      <div className="absolute bottom-0 left-0 w-full h-1 overflow-hidden">
                        <div
                          className="h-full w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent"
                          style={{ animation: "progress-sweep 1.2s ease-in-out infinite" }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={handleNext}>
                Continue <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </motion.section>
        )}

        {/* Section 2: Mini Dialogue */}
        {started && currentSection === 2 && (
          <motion.section
            key="dialogue"
            variants={fadeUp}
            initial="hidden"
            animate="show"
            exit="hidden"
          >
            <h2 className="text-lg font-semibold mb-4">Mini Dialogue – Beginner Level</h2>
            <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
              {dialogue.map((line, i) => {
                const dlgId = `dialogue-${i}`;
                const isPlaying = playingId === dlgId;
                const isYou = line.speaker === "You";
                return (
                  <div key={i}>
                    <p className={`text-[10px] font-semibold uppercase tracking-wide mb-1 ${
                      isYou ? "text-right text-primary" : "text-muted-foreground"
                    }`}>
                      {line.speaker}
                    </p>
                    <div className={`flex ${isYou ? "justify-end" : ""}`}>
                      <div
                        className={`relative overflow-hidden max-w-[80%] rounded-xl px-4 py-2.5 text-sm cursor-pointer ${
                          line.speaker === "Staff"
                            ? "bg-muted text-foreground"
                            : "bg-primary text-primary-foreground"
                        }`}
                        onClick={() => handleSpeak(dlgId, line.text, "tr-TR")}
                      >
                        <div className="flex items-center gap-2 relative z-10">
                          <span>{line.text}</span>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleSpeak(dlgId, line.text, "tr-TR"); }}
                            className={`shrink-0 rounded-full p-1 transition-colors ${
                              isPlaying
                                ? isYou ? "text-primary-foreground/90 bg-white/20" : "text-primary bg-primary/10"
                                : isYou ? "text-primary-foreground/60 hover:text-primary-foreground/90" : "text-muted-foreground hover:text-primary"
                            }`}
                          >
                            <Volume2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        {isPlaying && (
                          <div className="absolute bottom-0 left-0 w-full h-1 overflow-hidden">
                            <div
                              className={`h-full w-full bg-gradient-to-r from-transparent to-transparent ${
                                isYou ? "via-white/70" : "via-primary/40"
                              }`}
                              style={{ animation: "progress-sweep 1.2s ease-in-out infinite" }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <p
                      className={`mt-1 text-xs text-muted-foreground/70 italic ${
                        isYou ? "text-right pr-1" : "pl-1"
                      }`}
                    >
                      {line.english}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={handleNext}>
                Continue <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </motion.section>
        )}

        {/* Section 3: Listening Practice */}
        {started && currentSection === 3 && (
          <motion.section
            key="listening"
            variants={fadeUp}
            initial="hidden"
            animate="show"
            exit="hidden"
          >
            <div className="flex items-center gap-2 mb-4">
              <Headphones className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-semibold">Listening Practice</h2>
            </div>

            {!listeningStarted && !listeningDone && (
              <div className="rounded-xl border bg-card p-8 shadow-sm text-center">
                <Headphones className="h-14 w-14 mx-auto mb-4 text-amber-500" />
                <h3 className="font-display text-2xl font-bold mb-2">
                  {listeningCompletedDate ? "Practice Again?" : "Ready to Practice Listening?"}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {listeningQuestions.length} questions &middot; Listen and pick the correct response
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  You can keep trying each question until you get it right.
                </p>
                {listeningCompletedDate && (
                  <p className="text-xs text-muted-foreground mb-6">
                    Last completed: {listeningCompletedDate}
                  </p>
                )}
                <Button
                  size="lg"
                  onClick={() => {
                    setListeningStarted(true);
                    setListeningStep(0);
                    setListeningSelected(null);
                    setListeningLocked(false);
                    setListeningScore(0);
                    setListeningRevealed(new Set());
                  }}
                >
                  {listeningCompletedDate ? "Restart Practice" : "Start Practice"}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            )}

            {listeningStarted && !listeningDone ? (() => {
              const q = listeningQuestions[listeningStep];
              const promptId = `listen-prompt-${listeningStep}`;
              const isPromptPlaying = playingId === promptId;

              return (
                <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Question {listeningStep + 1} of {listeningQuestions.length}
                    </p>
                  </div>

                  <div className="w-full bg-muted rounded-full h-1.5 mb-1">
                    <div
                      className="h-1.5 rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${((listeningStep) / listeningQuestions.length) * 100}%` }}
                    />
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Listen and respond with the correct phrase:
                  </p>

                  <div
                    className="relative overflow-hidden rounded-lg bg-muted px-4 py-3 cursor-pointer hover:bg-muted/80 transition-colors"
                    onClick={() => handleSpeak(promptId, q.prompt, "tr-TR")}
                  >
                    <div className="flex items-center gap-3 relative z-10">
                      <button
                        type="button"
                        className={`shrink-0 rounded-full p-2 transition-colors ${
                          isPromptPlaying
                            ? "text-primary bg-primary/10"
                            : "text-primary hover:bg-primary/10"
                        }`}
                      >
                        <Volume2 className="h-5 w-5" />
                      </button>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          &ldquo;{q.prompt}&rdquo;
                        </p>
                        <p className="text-xs text-muted-foreground/70 italic mt-0.5">
                          {q.promptEnglish}
                        </p>
                      </div>
                    </div>
                    {isPromptPlaying && (
                      <div className="absolute bottom-0 left-0 w-full h-1 overflow-hidden">
                        <div
                          className="h-full w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent"
                          style={{ animation: "progress-sweep 1.2s ease-in-out infinite" }}
                        />
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground">Your response:</p>

                  <div className="space-y-2">
                    {q.options.map((opt, oi) => {
                      const optId = `listen-opt-${listeningStep}-${oi}`;
                      const isOptPlaying = playingId === optId;
                      const isCorrect = oi === q.correct;
                      const isSelected = listeningSelected === oi;
                      const wasWrong = isSelected && !isCorrect && !listeningLocked;
                      const isRevealed = listeningRevealed.has(oi);

                      let btnClass =
                        "w-full text-left rounded-lg border px-4 py-3 text-sm font-medium transition-all duration-300 relative overflow-hidden";

                      if (listeningLocked && isCorrect) {
                        btnClass += " border-emerald-400 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-300";
                      } else if (wasWrong) {
                        btnClass += " border-red-300 bg-red-50 text-red-600 animate-[shake_0.4s_ease-in-out]";
                      } else if (listeningLocked) {
                        btnClass += " border-muted bg-muted/30 text-muted-foreground opacity-60";
                      } else {
                        btnClass +=
                          " border-border bg-card text-foreground hover:border-primary/40 hover:bg-primary/5 cursor-pointer active:scale-[0.98]";
                      }

                      return (
                        <div key={oi} className="relative">
                          <button
                            type="button"
                            disabled={listeningLocked}
                            className={btnClass}
                            onClick={() => {
                              if (listeningLocked) return;
                              setListeningSelected(oi);
                              setListeningRevealed((prev) => new Set(prev).add(oi));
                              handleSpeak(optId, opt.text, "tr-TR");
                              if (isCorrect) {
                                setListeningLocked(true);
                                setListeningScore((s) => s + 1);
                              } else {
                                setTimeout(() => setListeningSelected(null), 3000);
                              }
                            }}
                          >
                            <div className="flex flex-col gap-0.5 relative z-10 pr-8">
                              <span>&ldquo;{opt.text}&rdquo;</span>
                              {isRevealed && (
                                <span className="text-xs text-muted-foreground/70 italic">
                                  {opt.english}
                                </span>
                              )}
                            </div>
                            {listeningLocked && isCorrect && (
                              <span className="absolute right-10 top-1/2 -translate-y-1/2 text-emerald-500 text-lg">
                                ✓
                              </span>
                            )}
                            {wasWrong && (
                              <span className="absolute right-10 top-1/2 -translate-y-1/2 text-red-400 text-lg">
                                ✗
                              </span>
                            )}
                            {isOptPlaying && (
                              <div className="absolute bottom-0 left-0 w-full h-0.5 overflow-hidden">
                                <div
                                  className="h-full w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent"
                                  style={{ animation: "progress-sweep 1.2s ease-in-out infinite" }}
                                />
                              </div>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setListeningRevealed((prev) => new Set(prev).add(oi));
                              handleSpeak(optId, opt.text, "tr-TR");
                            }}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 shrink-0 rounded-full p-1.5 transition-colors ${
                              isOptPlaying
                                ? "text-primary bg-primary/10"
                                : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                            }`}
                          >
                            <Volume2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {listeningSelected !== null && !listeningLocked && (
                    <p className="text-sm font-medium text-red-500 text-center animate-pulse">
                      Not quite right — try again!
                    </p>
                  )}

                  {listeningLocked && (
                    <div className="space-y-2 pt-2">
                      <p className="text-sm font-medium text-emerald-600 text-center">
                        Correct! Well done.
                      </p>
                      <div className="flex justify-end">
                        <Button
                          onClick={() => {
                            const next = listeningStep + 1;
                            if (next >= listeningQuestions.length) {
                              const completedDate = new Date().toLocaleString();
                              localStorage.setItem(LISTENING_ATTEMPTS_KEY, completedDate);
                              setListeningCompletedDate(completedDate);
                              setListeningDone(true);
                            } else {
                              setListeningStep(next);
                              setListeningSelected(null);
                              setListeningLocked(false);
                              setListeningRevealed(new Set());
                            }
                          }}
                        >
                          {listeningStep + 1 < listeningQuestions.length ? "Next Question" : "See Results"}{" "}
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })() : null}

            {listeningDone && (
              <div className="rounded-xl border bg-card p-6 shadow-sm text-center space-y-4">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto">
                  <Headphones className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold">Listening Practice Complete!</h3>
                <p className="text-sm text-muted-foreground">
                  Great job! You completed all the listening exercises.
                </p>

                {listeningCompletedDate && (
                  <p className="text-xs text-muted-foreground">
                    Last completed: {listeningCompletedDate}
                  </p>
                )}

                <div className="flex justify-center gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setListeningStep(0);
                      setListeningSelected(null);
                      setListeningLocked(false);
                      setListeningDone(false);
                      setListeningScore(0);
                      setListeningRevealed(new Set());
                    }}
                  >
                    Try Again
                  </Button>
                  <Button onClick={handleNext}>
                    Continue <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </motion.section>
        )}

        {/* Section 4: Speaking Practice */}
        {started && currentSection === 4 && (
          <SpeakingPracticeSection onNext={handleNext} />
        )}

        {/* Section 5: Quiz */}
        {started && currentSection === 5 && (
          <motion.section
            key="quiz"
            variants={fadeUp}
            initial="hidden"
            animate="show"
            exit="hidden"
          >
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-semibold">Lesson Quiz</h2>
            </div>

            {/* Quiz Intro Screen */}
            {!quizStarted && !quizSubmitted && (
              <motion.div variants={fadeUp} initial="hidden" animate="show">
                <div className="rounded-xl border bg-card p-8 shadow-sm text-center">
                  <Trophy className="h-14 w-14 mx-auto mb-4 text-amber-500" />

                  {quizPaused ? (
                    <>
                      <h3 className="font-display text-2xl font-bold mb-2">
                        Quiz Paused
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Your progress has been saved.
                      </p>
                      <p className="text-sm text-muted-foreground mb-8">
                        {quizAnswers.filter((a) => a !== null).length} of {quizQuestions.length} questions answered so far.
                      </p>
                    </>
                  ) : attempts.length === 0 ? (
                    <>
                      <h3 className="font-display text-2xl font-bold mb-2">
                        Ready to Test Your Knowledge?
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {quizQuestions.length} questions &middot; {PASSING_PERCENT}% required to pass
                      </p>
                      <p className="text-sm text-muted-foreground mb-8">
                        Answer questions about vocabulary, phrases, and dialogues from this lesson.
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="font-display text-2xl font-bold mb-2">
                        Retake the Quiz?
                      </h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        {quizQuestions.length} questions &middot; {PASSING_PERCENT}% required to pass
                      </p>
                    </>
                  )}

                  {attempts.length > 0 && (
                    <div className="text-left max-w-md mx-auto mb-8">
                      <h4 className="text-sm font-semibold mb-2">
                        Previous Attempts ({attempts.length})
                      </h4>
                      <div className="space-y-1.5">
                        {attempts.map((a, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between rounded-lg border px-3 py-2 text-xs"
                          >
                            <span className="text-muted-foreground">
                              Attempt {attempts.length - i}
                            </span>
                            <span className="font-medium">
                              {a.score}/{a.total}
                            </span>
                            <span
                              className={`font-semibold ${
                                a.passed ? "text-emerald-600" : "text-red-500"
                              }`}
                            >
                              {a.passed ? "Passed" : "Failed"}
                            </span>
                            <span className="text-muted-foreground/60">
                              {a.date}
                            </span>
                          </div>
                        ))}
                      </div>

                      {(() => {
                        const last = attempts[0];
                        const pct = Math.round((last.score / last.total) * 100);
                        return (
                          <div className={`mt-3 rounded-lg px-4 py-3 text-sm ${
                            last.passed
                              ? "bg-emerald-50 border border-emerald-200"
                              : "bg-red-50 border border-red-200"
                          }`}>
                            <p className="font-medium">
                              Last attempt: {last.score}/{last.total} ({pct}%){" "}
                              <span className={last.passed ? "text-emerald-600" : "text-red-500"}>
                                {last.passed ? "Passed" : "Failed"}
                              </span>
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  <div className="flex gap-3 justify-center">
                    {quizPaused && (
                      <Button
                        size="lg"
                        onClick={() => {
                          setQuizPaused(false);
                          setQuizStarted(true);
                        }}
                      >
                        Resume Quiz
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="lg"
                      variant={quizPaused ? "outline" : "default"}
                      onClick={() => {
                        setQuizAnswers(Array(quizQuestions.length).fill(null));
                        setQuizPaused(false);
                        setQuizStarted(true);
                      }}
                    >
                      {quizPaused
                        ? "Start Over"
                        : attempts.length === 0
                        ? "Start Quiz"
                        : "Retake Quiz"}
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Quiz Questions */}
            {quizStarted && !quizSubmitted && (
              <>
                <div className="space-y-5">
                  {quizQuestions.map((q, qi) => {
                    const isEnglishOptions = q.question.toLowerCase().startsWith("what does") || q.question.toLowerCase().startsWith("what is");
                    const qId = `quiz-q-${qi}`;
                    const isQPlaying = playingId === qId;
                    return (
                    <div key={qi} className="relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-2 mb-3 relative z-10">
                        <p className="font-medium text-foreground">
                          {qi + 1}. {q.question}
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSpeak(qId, q.question, "en-US");
                          }}
                          className={`shrink-0 mt-0.5 rounded-full p-1.5 transition-colors ${
                            isQPlaying
                              ? "text-primary bg-primary/10"
                              : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                          }`}
                          title="Listen to question"
                        >
                          <Volume2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2 relative z-10">
                        {q.options.map((opt, oi) => {
                          const oId = `quiz-q-${qi}-o-${oi}`;
                          const isOPlaying = playingId === oId;
                          return (
                          <button
                            key={oi}
                            onClick={() => {
                              const next = [...quizAnswers];
                              next[qi] = oi;
                              setQuizAnswers(next);
                            }}
                            className={`group relative overflow-hidden flex items-center justify-between rounded-lg border px-4 py-2.5 text-sm text-left transition-all ${
                              quizAnswers[qi] === oi
                                ? "border-primary bg-primary/10 text-primary font-medium"
                                : "bg-card text-foreground hover:border-primary/30 hover:bg-muted"
                            }`}
                          >
                            <span>{opt}</span>
                            <span
                              role="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSpeak(oId, opt, isEnglishOptions ? "en-US" : "tr-TR");
                              }}
                              className={`shrink-0 ml-2 rounded-full p-1 transition-colors ${
                                isOPlaying
                                  ? "text-primary bg-primary/10 opacity-100"
                                  : "text-muted-foreground/50 hover:text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100"
                              }`}
                              title={`Listen: ${opt}`}
                            >
                              <Volume2 className="h-3.5 w-3.5" />
                            </span>
                            {isOPlaying && (
                              <div className="absolute bottom-0 left-0 w-full h-0.5 overflow-hidden">
                                <div
                                  className="h-full w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent"
                                  style={{ animation: "progress-sweep 1.2s ease-in-out infinite" }}
                                />
                              </div>
                            )}
                          </button>
                          );
                        })}
                      </div>
                      {isQPlaying && (
                        <div className="absolute bottom-0 left-0 w-full h-1 overflow-hidden">
                          <div
                            className="h-full w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent"
                            style={{ animation: "progress-sweep 1.2s ease-in-out infinite" }}
                          />
                        </div>
                      )}
                    </div>
                    );
                  })}
                </div>
                {/* Cancel Confirmation */}
                {showCancelConfirm && (
                  <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-center">
                    <p className="text-sm font-medium text-red-700 mb-3">
                      Are you sure you want to cancel? All your answers will be lost.
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowCancelConfirm(false)}
                      >
                        Keep Going
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setQuizAnswers(Array(quizQuestions.length).fill(null));
                          setQuizStarted(false);
                          setQuizPaused(false);
                          setShowCancelConfirm(false);
                        }}
                      >
                        Yes, Cancel Quiz
                      </Button>
                    </div>
                  </div>
                )}

                <div className="mt-6 flex justify-between">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setQuizPaused(true);
                        setQuizStarted(false);
                        setShowCancelConfirm(false);
                      }}
                    >
                      Pause Quiz
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                      onClick={() => setShowCancelConfirm(true)}
                    >
                      Cancel Quiz
                    </Button>
                  </div>
                  <Button
                    onClick={() => {
                      const s = quizAnswers.filter(
                        (a, i) => a === quizQuestions[i].correct
                      ).length;
                      const passed =
                        (s / quizQuestions.length) * 100 >= PASSING_PERCENT;
                      const attempt: QuizAttempt = {
                        score: s,
                        total: quizQuestions.length,
                        passed,
                        date: new Date().toLocaleString(),
                      };
                      const updated = [attempt, ...attempts];
                      setAttempts(updated);
                      localStorage.setItem(
                        QUIZ_ATTEMPTS_KEY,
                        JSON.stringify(updated)
                      );
                      setQuizSubmitted(true);
                      if (passed) {
                        localStorage.setItem(
                          STORAGE_KEY,
                          String(sectionLabels.length)
                        );
                      }
                    }}
                    disabled={quizAnswers.some((a) => a === null)}
                  >
                    Submit Quiz
                  </Button>
                </div>
              </>
            )}

            {/* Quiz Results */}
            {quizSubmitted && (
              <motion.div variants={fadeUp} initial="hidden" animate="show">
                <div className="rounded-xl border bg-card p-8 shadow-sm text-center">
                  {(() => {
                    const passed =
                      (score / quizQuestions.length) * 100 >= PASSING_PERCENT;
                    return (
                      <>
                        <Trophy
                          className={`h-14 w-14 mx-auto mb-4 ${
                            passed ? "text-amber-500" : "text-muted-foreground"
                          }`}
                        />
                        <h3 className="font-display text-2xl font-bold mb-2">
                          {score === quizQuestions.length
                            ? "Perfect Score!"
                            : passed
                            ? "You Passed!"
                            : "Not Quite — Try Again"}
                        </h3>
                        <p className="text-3xl font-bold text-primary mb-1">
                          {score}/{quizQuestions.length}
                        </p>
                        <p className="text-sm text-muted-foreground mb-1">
                          correct answers
                        </p>
                        <p
                          className={`text-sm font-semibold mb-6 ${
                            passed ? "text-emerald-600" : "text-red-500"
                          }`}
                        >
                          {Math.round(
                            (score / quizQuestions.length) * 100
                          )}
                          % {passed ? "Passed" : `${PASSING_PERCENT}% required to pass`}
                        </p>
                      </>
                    );
                  })()}

                  <div className="space-y-3 text-left max-w-md mx-auto mb-6">
                    {quizQuestions.map((q, qi) => (
                      <div
                        key={qi}
                        className={`rounded-lg px-4 py-2.5 text-sm ${
                          quizAnswers[qi] === q.correct
                            ? "bg-emerald-50 border border-emerald-200"
                            : "bg-red-50 border border-red-200"
                        }`}
                      >
                        <p className="font-medium">
                          {quizAnswers[qi] === q.correct ? (
                            <CheckCircle2 className="inline h-4 w-4 text-emerald-500 mr-1.5" />
                          ) : (
                            <span className="text-red-500 mr-1.5">✗</span>
                          )}
                          {q.question}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {quizAnswers[qi] === q.correct
                            ? `Turkish: ${q.turkish}`
                            : `Correct: ${q.options[q.correct]} — Turkish: ${q.turkish}`}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Attempt History */}
                  {attempts.length > 0 && (
                    <div className="text-left max-w-md mx-auto mb-6">
                      <h4 className="text-sm font-semibold mb-2">
                        Attempt History ({attempts.length})
                      </h4>
                      <div className="space-y-1.5">
                        {attempts.map((a, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between rounded-lg border px-3 py-2 text-xs"
                          >
                            <span className="text-muted-foreground">
                              Attempt {attempts.length - i}
                            </span>
                            <span className="font-medium">
                              {a.score}/{a.total}
                            </span>
                            <span
                              className={`font-semibold ${
                                a.passed ? "text-emerald-600" : "text-red-500"
                              }`}
                            >
                              {a.passed ? "Passed" : "Failed"}
                            </span>
                            <span className="text-muted-foreground/60">
                              {a.date}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 justify-center">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setQuizAnswers(Array(quizQuestions.length).fill(null));
                        setQuizSubmitted(false);
                        setQuizStarted(false);
                        setQuizPaused(false);
                      }}
                    >
                      Retry Quiz
                    </Button>
                    <Link href="/dashboard/courses/turkish">
                      <Button>Back to Lessons</Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
