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
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(
    Array(quizQuestions.length).fill(null)
  );
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);

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
    setQuizAnswers(Array(quizQuestions.length).fill(null));
    window.scrollTo({ top: 0, behavior: "smooth" });
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
              {vocabulary.map((word) => (
                <div
                  key={word.turkish}
                  className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 shadow-sm"
                >
                  <div>
                    <span className="font-semibold text-foreground">{word.turkish}</span>
                    <span className="ml-2 text-sm text-muted-foreground">– {word.english}</span>
                  </div>
                  <Volume2 className="h-4 w-4 shrink-0 cursor-pointer text-muted-foreground hover:text-primary" />
                </div>
              ))}
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
              {keySentences.map((s) => (
                <div key={s.turkish} className="rounded-lg border bg-card px-4 py-3 shadow-sm">
                  <p className="font-medium text-foreground">{s.turkish}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{s.english}</p>
                </div>
              ))}
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
              {dialogue.map((line, i) => (
                <div key={i}>
                  <p className={`text-[10px] font-semibold uppercase tracking-wide mb-1 ${
                    line.speaker === "You" ? "text-right text-primary" : "text-muted-foreground"
                  }`}>
                    {line.speaker}
                  </p>
                  <div className={`flex gap-3 ${line.speaker === "You" ? "justify-end" : ""}`}>
                    <div
                      className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${
                        line.speaker === "Staff"
                          ? "bg-muted text-foreground"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      {line.text}
                    </div>
                  </div>
                  <p
                    className={`mt-1 text-xs text-muted-foreground/70 italic ${
                      line.speaker === "You" ? "text-right pr-1" : "pl-1"
                    }`}
                  >
                    {line.english}
                  </p>
                </div>
              ))}
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
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <p className="text-sm text-muted-foreground mb-3">
                Listen and respond with the correct phrase:
              </p>
              <div className="rounded-lg bg-muted px-4 py-3 mb-3">
                <p className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-primary" />
                  &ldquo;Pasaportunuz lütfen.&rdquo;
                </p>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Your response:</p>
              <div className="flex flex-wrap gap-2">
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700">
                  &ldquo;Buyurun.&rdquo;
                </div>
                <span className="text-sm text-muted-foreground self-center">or</span>
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700">
                  &ldquo;İşte pasaportum.&rdquo;
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={handleNext}>
                Continue <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
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

            {!quizSubmitted ? (
              <>
                <div className="space-y-5">
                  {quizQuestions.map((q, qi) => (
                    <div key={qi} className="rounded-xl border bg-card p-5 shadow-sm">
                      <p className="font-medium text-foreground mb-3">
                        {qi + 1}. {q.question}
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {q.options.map((opt, oi) => (
                          <button
                            key={oi}
                            onClick={() => {
                              const next = [...quizAnswers];
                              next[qi] = oi;
                              setQuizAnswers(next);
                            }}
                            className={`rounded-lg border px-4 py-2.5 text-sm text-left transition-all ${
                              quizAnswers[qi] === oi
                                ? "border-primary bg-primary/10 text-primary font-medium"
                                : "bg-card text-foreground hover:border-primary/30 hover:bg-muted"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-end">
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
            ) : (
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
                          % — {passed ? "Passed" : `${PASSING_PERCENT}% required to pass`}
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
