"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
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
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

let currentAudio: HTMLAudioElement | null = null;
let onSpeakEnd: (() => void) | null = null;
let currentAbort: AbortController | null = null;

async function speak(
  text: string,
  lang: "fa-IR" | "en-US" = "fa-IR",
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
  { persian: "فرودگاه", english: "Airport" },
  { persian: "بلیت", english: "Ticket" },
  { persian: "گذرنامه", english: "Passport" },
  { persian: "چمدان", english: "Suitcase" },
  { persian: "بار دستی", english: "Hand luggage" },
  { persian: "گیت", english: "Gate" },
  { persian: "پرواز", english: "Flight" },
  { persian: "تاخیر", english: "Delay" },
];

const keySentences = [
  {
    persian: "پرواز من ساعت چند است؟",
    english: "What time is my flight?",
    answerPersian: "پرواز شما ساعت سه است.",
    answerEnglish: "Your flight is at three o'clock.",
  },
  {
    persian: "این گذرنامه من است.",
    english: "This is my passport.",
    answerPersian: "ممنون، گذرنامه شما معتبر است.",
    answerEnglish: "Thank you, your passport is valid.",
  },
  {
    persian: "گیت کجاست؟",
    english: "Where is the gate?",
    answerPersian: "گیت ۱۲ است، مستقیم بروید و به راست بپیچید.",
    answerEnglish: "Gate 12, go straight and turn right.",
  },
  {
    persian: "می‌خواهم چمدانم را تحویل بدهم.",
    english: "I want to check my suitcase.",
    answerPersian: "حتما، لطفا چمدان را روی ترازو بگذارید.",
    answerEnglish: "Sure, please put your suitcase on the scale.",
  },
  {
    persian: "پرواز تاخیر دارد؟",
    english: "Is the flight delayed?",
    answerPersian: "بله، حدود سی دقیقه تاخیر دارد.",
    answerEnglish: "Yes, it is delayed about thirty minutes.",
  },
  {
    persian: "چه زمانی سوار هواپیما می‌شویم؟",
    english: "When will we board the plane?",
    answerPersian: "سوار شدن تا پانزده دقیقه دیگر شروع می‌شود.",
    answerEnglish: "Boarding starts in about fifteen minutes.",
  },
];

const dialogue = [
  { speaker: "Staff", text: "سلام، گذرنامه لطفا.", english: "Hello, your passport please." },
  { speaker: "You", text: "سلام، بفرمایید.", english: "Hello, here you go." },
  { speaker: "Staff", text: "بلیت دارید؟", english: "Do you have a ticket?" },
  { speaker: "You", text: "بله، این بلیت من است.", english: "Yes, this is my ticket." },
  { speaker: "Staff", text: "چمدان دارید؟", english: "Do you have a suitcase?" },
  { speaker: "You", text: "بله، یک چمدان دارم.", english: "Yes, I have one suitcase." },
];

const listeningQuestions = [
  {
    prompt: "گذرنامه لطفا.",
    promptEnglish: "Passport please.",
    options: [
      { text: "بفرمایید.", english: "Here you go." },
      { text: "گیت کجاست؟", english: "Where is the gate?" },
      { text: "ممنون.", english: "Thanks." },
    ],
    correct: 0,
  },
  {
    prompt: "بلیت دارید؟",
    promptEnglish: "Do you have a ticket?",
    options: [
      { text: "بله، این بلیت من است.", english: "Yes, this is my ticket." },
      { text: "چمدان من سنگین است.", english: "My suitcase is heavy." },
      { text: "گیت شماره دوازده.", english: "Gate number twelve." },
    ],
    correct: 0,
  },
  {
    prompt: "گیت کجاست؟",
    promptEnglish: "Where is the gate?",
    options: [
      { text: "پرواز تاخیر دارد.", english: "The flight is delayed." },
      { text: "مستقیم بروید و راست بپیچید.", english: "Go straight and turn right." },
      { text: "این گذرنامه من است.", english: "This is my passport." },
    ],
    correct: 1,
  },
];

const aiPrompts = [
  {
    ai: "سلام. به کجا پرواز می‌کنید؟",
    aiEnglish: "Hello. Where are you flying to?",
    expected: "من به تهران پرواز می‌کنم.",
    expectedEnglish: "I am flying to Tehran.",
  },
  {
    ai: "گذرنامه لطفا.",
    aiEnglish: "Passport please.",
    expected: "بفرمایید، این گذرنامه من است.",
    expectedEnglish: "Here you go, this is my passport.",
  },
  {
    ai: "چمدان دارید؟",
    aiEnglish: "Do you have a suitcase?",
    expected: "بله، یک چمدان دارم.",
    expectedEnglish: "Yes, I have one suitcase.",
  },
];

const quizQuestions = [
  {
    question: "What does \"فرودگاه\" mean?",
    options: ["Airport", "Hotel", "Hospital", "Train station"],
    correct: 0,
  },
  {
    question: "What does \"گذرنامه\" mean?",
    options: ["Ticket", "Passport", "Gate", "Suitcase"],
    correct: 1,
  },
  {
    question: "How do you say \"Where is the gate?\" in Persian?",
    options: ["گیت کجاست؟", "بلیت دارید؟", "چمدان دارید؟", "پرواز تاخیر دارد؟"],
    correct: 0,
  },
  {
    question: "What is a natural reply to \"Passport please\"?",
    options: ["گیت کجاست؟", "بفرمایید.", "پرواز من ساعت چند است؟", "تاخیر دارد."],
    correct: 1,
  },
];

const STORAGE_KEY = "bllp-persian-lesson-1";
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

function SpeakingPracticeSection({ onNext }: { onNext: () => void }) {
  const [messages, setMessages] = useState<
    { role: "ai" | "you"; text: string; english?: string }[]
  >([
    { role: "ai", text: aiPrompts[0].ai, english: aiPrompts[0].aiEnglish },
  ]);
  const [promptIndex, setPromptIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [playingAiId, setPlayingAiId] = useState<string | null>(null);

  const handleSpeakAi = (id: string, text: string) => {
    if (playingAiId === id) {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
      }
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setPlayingAiId(null);
      return;
    }
    setPlayingAiId(id);
    speak(text, "fa-IR", () => setPlayingAiId(null));
  };

  const normalize = (text: string) =>
    text
      .toLowerCase()
      .replace(/[.!?؟]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Try Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "fa-IR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setListening(true);
    setTranscript("");

    recognition.onresult = (event: any) => {
      const result = event.results[0][0].transcript as string;
      setTranscript(result);
      setListening(false);

      const current = aiPrompts[promptIndex];
      const userMsg: { role: "ai" | "you"; text: string; english?: string } = {
        role: "you",
        text: result,
      };

      if (normalize(result) === normalize(current.expected)) {
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

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.start();
  };

  const allDone =
    promptIndex >= aiPrompts.length - 1 &&
    messages.filter((m) => m.role === "you").length >= aiPrompts.length;

  return (
    <motion.section key="speaking" variants={fadeUp} initial="hidden" animate="show" exit="hidden">
      <div className="flex items-center gap-2 mb-4">
        <Mic className="h-5 w-5 text-rose-500" />
        <h2 className="text-lg font-semibold">Speaking Practice - AI Roleplay</h2>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="p-5 space-y-4 max-h-[400px] overflow-y-auto">
          {messages.map((msg, i) => {
            const aiId = `ai-roleplay-fa-${i}`;
            const isAiPlaying = msg.role === "ai" && playingAiId === aiId;
            return (
              <div key={i}>
                <p
                  className={`text-[10px] font-semibold uppercase tracking-wide mb-1 ${
                    msg.role === "you" ? "text-right text-primary" : "text-muted-foreground"
                  }`}
                >
                  {msg.role === "ai" ? "AI Tutor" : "You"}
                </p>
                <div className={`flex ${msg.role === "you" ? "justify-end" : ""}`}>
                  <div
                    className={`relative overflow-hidden max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${
                      msg.role === "ai" ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"
                    }`}
                  >
                    <div className="relative z-10 flex items-center justify-between gap-2">
                      <span className="break-words">{msg.text}</span>
                      {msg.role === "ai" && (
                        <button
                          type="button"
                          onClick={() => handleSpeakAi(aiId, msg.text)}
                          className={`shrink-0 rounded-full p-1 transition-colors ${
                            isAiPlaying ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                          }`}
                          title={`Listen: ${msg.text}`}
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    {isAiPlaying && (
                      <div className="absolute bottom-0 left-0 w-full h-1 overflow-hidden">
                        <div
                          className="h-full w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent"
                          style={{ animation: "progress-sweep 1.2s ease-in-out infinite" }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                {msg.english && (
                  <p className={`mt-1 text-xs text-muted-foreground/70 italic ${msg.role === "you" ? "text-right pr-1" : "pl-1"}`}>
                    {msg.english}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {!allDone && (
          <div className="border-t p-4 text-center">
            {showHint && (
              <p className="text-xs text-muted-foreground mb-3">
                Hint: <span className="font-medium">{aiPrompts[promptIndex].expected}</span>{" "}
                <span className="text-muted-foreground/60">({aiPrompts[promptIndex].expectedEnglish})</span>
              </p>
            )}
            {transcript && <p className="text-xs text-muted-foreground mb-3">Heard: &ldquo;{transcript}&rdquo;</p>}

            <button
              onClick={startListening}
              disabled={listening}
              className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full transition-all ${
                listening ? "bg-red-500 text-white animate-pulse scale-110" : "bg-primary/10 text-primary hover:bg-primary/20 hover:scale-105"
              }`}
            >
              <Mic className="h-7 w-7" />
            </button>
            <p className="mt-3 text-sm text-muted-foreground">
              {listening ? "Listening... speak now" : "Tap the microphone and speak in Persian"}
            </p>

            <button onClick={() => setShowHint(true)} className="mt-3 text-xs text-primary hover:underline">
              Need a hint?
            </button>
          </div>
        )}

        {allDone && (
          <div className="border-t p-4 text-center">
            <p className="text-sm font-medium text-emerald-600 mb-2">Great job! You completed all speaking prompts.</p>
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

export default function PersianLesson1Page() {
  const [mounted, setMounted] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [highestReached, setHighestReached] = useState(0);
  const [reviewMode, setReviewMode] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const [listeningStep, setListeningStep] = useState(0);
  const [listeningSelected, setListeningSelected] = useState<number | null>(null);
  const [listeningLocked, setListeningLocked] = useState(false);
  const [listeningDone, setListeningDone] = useState(false);

  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(
    Array(quizQuestions.length).fill(null)
  );
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const started = true;

  useEffect(() => {
    const saved = loadProgress();
    const completed = saved >= sectionLabels.length;
    setHighestReached(saved);
    setCurrentSection(completed ? 0 : saved);
    setReviewMode(completed);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!reviewMode && currentSection > highestReached) {
      setHighestReached(currentSection);
      localStorage.setItem(STORAGE_KEY, String(currentSection));
    }
  }, [currentSection, highestReached, reviewMode, mounted]);

  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
      }
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  const score = useMemo(
    () => quizAnswers.filter((a, i) => a === quizQuestions[i].correct).length,
    [quizAnswers]
  );

  if (!mounted) return null;

  const jumpToSection = (index: number) => {
    setCurrentSection(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSpeak = (
    id: string,
    text: string,
    lang: "fa-IR" | "en-US" = "fa-IR"
  ) => {
    if (playingId === id) {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
      }
      if (window.speechSynthesis) window.speechSynthesis.cancel();
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

  const progressStep = reviewMode || quizSubmitted ? sectionLabels.length : currentSection + 1;
  const progressPercent = Math.round((progressStep / sectionLabels.length) * 100);

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/courses/mandarin"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Persian
        </Link>

        <div className="flex items-center gap-4 mt-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-500">
            <Plane className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">
              Lesson 1 - At the Airport
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Focus: Persian check-in, boarding, and airport basics
            </p>
          </div>
        </div>
      </div>

      {started && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>{sectionLabels[Math.min(currentSection, sectionLabels.length - 1)]}</span>
            {reviewMode ? <span>Completed - Review Mode</span> : null}
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <div className="mt-2 overflow-x-auto">
            <div className="flex min-w-max items-center justify-between gap-2">
              {sectionLabels.map((label, i) => {
                const completed =
                  reviewMode || i < currentSection || (i === sectionLabels.length - 1 && quizSubmitted);
                const active = i === currentSection;
                const clickable = reviewMode || i <= highestReached;
                return (
                  <button
                    key={label}
                    onClick={() => clickable && jumpToSection(i)}
                    disabled={!clickable}
                    className={`flex items-center justify-center gap-1 rounded-md px-2 py-1 text-xs whitespace-nowrap transition-colors ${
                      clickable ? "cursor-pointer hover:text-primary" : "cursor-default"
                    } ${
                      completed ? "text-primary" : active ? "text-foreground font-semibold" : "text-muted-foreground"
                    }`}
                  >
                    {reviewMode || completed ? <CheckCircle2 className="h-3 w-3" /> : null}
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {started && currentSection === 0 && (
        <motion.section key="vocab" variants={fadeUp} initial="hidden" animate="show" exit="hidden">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-emerald-500" />
            <h2 className="text-lg font-semibold">Vocabulary</h2>
          </div>
          <div className="space-y-3">
            {vocabulary.map((v) => {
              const id = `vocab-${v.persian}`;
              const isPlaying = playingId === id;
              return (
                <div key={v.persian} className="relative overflow-hidden rounded-lg border bg-card px-4 py-3 shadow-sm">
                  <div className="flex items-start justify-between gap-3 relative z-10">
                    <div>
                      <p className="font-medium text-foreground">{v.persian}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{v.english}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSpeak(id, v.persian, "fa-IR")}
                      className={`shrink-0 mt-0.5 rounded-full p-1.5 transition-colors ${
                        isPlaying ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                      }`}
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

      {started && currentSection === 1 && (
        <motion.section key="sentences" variants={fadeUp} initial="hidden" animate="show" exit="hidden">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-semibold">Key Sentences</h2>
          </div>
          <div className="space-y-3">
            {keySentences.map((s) => {
              const qId = `sentence-q-${s.persian}`;
              const aId = `sentence-a-${s.persian}`;
              const isQPlaying = playingId === qId;
              const isAPlaying = playingId === aId;
              return (
                <div key={s.persian} className="relative overflow-hidden rounded-lg border bg-card px-4 py-3 shadow-sm">
                  <div className="flex items-start justify-between gap-3 relative z-10">
                    <div>
                      <p className="font-medium text-foreground">{s.persian}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{s.english}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSpeak(qId, s.persian, "fa-IR")}
                      className={`shrink-0 mt-0.5 rounded-full p-1.5 transition-colors ${
                        isQPlaying ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                      }`}
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-3 border-t pt-3 flex items-start justify-between gap-3 relative z-10">
                    <div>
                      <p className="font-medium text-foreground">{s.answerPersian}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{s.answerEnglish}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSpeak(aId, s.answerPersian, "fa-IR")}
                      className={`shrink-0 mt-0.5 rounded-full p-1.5 transition-colors ${
                        isAPlaying ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                      }`}
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                  </div>

                  {(isQPlaying || isAPlaying) && (
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

      {started && currentSection === 2 && (
        <motion.section key="dialogue" variants={fadeUp} initial="hidden" animate="show" exit="hidden">
          <h2 className="text-lg font-semibold mb-4">Mini Dialogue - Beginner Level</h2>
          <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
            {dialogue.map((line, i) => {
              const dlgId = `dialogue-fa-${i}`;
              const isPlaying = playingId === dlgId;
              const isYou = line.speaker === "You";
              return (
                <div key={i}>
                  <p className={`text-[10px] font-semibold uppercase tracking-wide mb-1 ${isYou ? "text-right text-primary" : "text-muted-foreground"}`}>
                    {line.speaker}
                  </p>
                  <div className={`flex ${isYou ? "justify-end" : ""}`}>
                    <div
                      className={`relative overflow-hidden max-w-[80%] rounded-xl px-4 py-2.5 text-sm cursor-pointer ${
                        isYou ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                      }`}
                      onClick={() => handleSpeak(dlgId, line.text, "fa-IR")}
                    >
                      <div className="flex items-center gap-2 relative z-10">
                        <span>{line.text}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSpeak(dlgId, line.text, "fa-IR");
                          }}
                          className={`shrink-0 rounded-full p-1 transition-colors ${
                            isPlaying
                              ? isYou
                                ? "text-primary-foreground/90 bg-white/20"
                                : "text-primary bg-primary/10"
                              : isYou
                              ? "text-primary-foreground/60 hover:text-primary-foreground/90"
                              : "text-muted-foreground hover:text-primary"
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
                  <p className={`mt-1 text-xs text-muted-foreground/70 italic ${isYou ? "text-right pr-1" : "pl-1"}`}>{line.english}</p>
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

      {started && currentSection === 3 && (
        <motion.section key="listening" variants={fadeUp} initial="hidden" animate="show" exit="hidden">
          <div className="flex items-center gap-2 mb-4">
            <Headphones className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-semibold">Listening Practice</h2>
          </div>

          {!listeningDone ? (
            (() => {
              const q = listeningQuestions[listeningStep];
              const promptId = `listen-prompt-fa-${listeningStep}`;
              const isPromptPlaying = playingId === promptId;
              return (
                <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Question {listeningStep + 1} of {listeningQuestions.length}
                  </p>
                  <div
                    className="relative overflow-hidden rounded-lg bg-muted px-4 py-3 cursor-pointer hover:bg-muted/80 transition-colors"
                    onClick={() => handleSpeak(promptId, q.prompt, "fa-IR")}
                  >
                    <div className="flex items-center gap-3 relative z-10">
                      <button
                        type="button"
                        className={`shrink-0 rounded-full p-2 transition-colors ${
                          isPromptPlaying ? "text-primary bg-primary/10" : "text-primary hover:bg-primary/10"
                        }`}
                      >
                        <Volume2 className="h-5 w-5" />
                      </button>
                      <div>
                        <p className="text-sm font-medium text-foreground">&ldquo;{q.prompt}&rdquo;</p>
                        <p className="text-xs text-muted-foreground/70 italic mt-0.5">{q.promptEnglish}</p>
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

                  <div className="space-y-2">
                    {q.options.map((opt, oi) => {
                      const isCorrect = oi === q.correct;
                      const isSelected = listeningSelected === oi;
                      const wrong = isSelected && !isCorrect && !listeningLocked;

                      return (
                        <button
                          key={oi}
                          type="button"
                          disabled={listeningLocked}
                          className={`w-full text-left rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                            listeningLocked && isCorrect
                              ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                              : wrong
                              ? "border-red-300 bg-red-50 text-red-600"
                              : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-primary/5"
                          }`}
                          onClick={() => {
                            if (listeningLocked) return;
                            setListeningSelected(oi);
                            handleSpeak(`listen-opt-fa-${listeningStep}-${oi}`, opt.text, "fa-IR");
                            if (isCorrect) setListeningLocked(true);
                            else setTimeout(() => setListeningSelected(null), 1200);
                          }}
                        >
                          <p>&ldquo;{opt.text}&rdquo;</p>
                          <p className="text-xs text-muted-foreground/70 italic mt-0.5">{opt.english}</p>
                        </button>
                      );
                    })}
                  </div>

                  {listeningLocked && (
                    <div className="flex justify-end">
                      <Button
                        onClick={() => {
                          const next = listeningStep + 1;
                          if (next >= listeningQuestions.length) {
                            setListeningDone(true);
                          } else {
                            setListeningStep(next);
                            setListeningSelected(null);
                            setListeningLocked(false);
                          }
                        }}
                      >
                        {listeningStep + 1 < listeningQuestions.length ? "Next Question" : "Finish Listening"}
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })()
          ) : (
            <div className="rounded-xl border bg-card p-6 shadow-sm text-center space-y-4">
              <h3 className="text-lg font-semibold">Listening Practice Complete!</h3>
              <p className="text-sm text-muted-foreground">Great work. You finished all listening questions.</p>
              <div className="flex justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setListeningStep(0);
                    setListeningSelected(null);
                    setListeningLocked(false);
                    setListeningDone(false);
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

      {started && currentSection === 4 && <SpeakingPracticeSection onNext={handleNext} />}

      {started && currentSection === 5 && (
        <motion.section key="quiz" variants={fadeUp} initial="hidden" animate="show" exit="hidden">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-semibold">Lesson Quiz</h2>
          </div>

          {!quizSubmitted ? (
            <div className="rounded-xl border bg-card p-5 shadow-sm space-y-5">
              {quizQuestions.map((q, qi) => (
                <div key={qi}>
                  <p className="text-sm font-medium mb-2">
                    {qi + 1}. {q.question}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => {
                      const selected = quizAnswers[qi] === oi;
                      return (
                        <button
                          key={oi}
                          type="button"
                          onClick={() =>
                            setQuizAnswers((prev) => {
                              const next = [...prev];
                              next[qi] = oi;
                              return next;
                            })
                          }
                          className={`w-full text-left rounded-lg border px-3 py-2 text-sm transition-colors ${
                            selected ? "border-primary bg-primary/5 text-foreground" : "border-border hover:border-primary/40"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    setQuizSubmitted(true);
                    localStorage.setItem(STORAGE_KEY, String(sectionLabels.length));
                    setReviewMode(true);
                    setHighestReached(sectionLabels.length);
                  }}
                  disabled={quizAnswers.some((a) => a === null)}
                >
                  Submit Quiz
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border bg-card p-6 shadow-sm text-center">
              <p className="text-sm text-muted-foreground">Your score</p>
              <p className="mt-1 text-3xl font-bold">
                {score}/{quizQuestions.length}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {score >= Math.ceil(quizQuestions.length * 0.7)
                  ? "Great job! You passed."
                  : "Nice effort. Review and try again."}
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setQuizSubmitted(false);
                    setQuizAnswers(Array(quizQuestions.length).fill(null));
                  }}
                >
                  Retry Quiz
                </Button>
                <Button onClick={() => jumpToSection(0)}>Review Lesson</Button>
              </div>
            </div>
          )}
        </motion.section>
      )}
    </div>
  );
}

