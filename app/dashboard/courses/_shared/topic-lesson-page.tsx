"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Headphones,
  MessageCircle,
  Mic,
  Plane,
  Trophy,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTopicMetaById, SupportedLanguage } from "./topic-lessons";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const sectionLabels = [
  "Vocabulary",
  "Key Sentences",
  "Mini Dialogue",
  "Listening Practice",
  "Speaking Practice",
  "Quiz",
];

let currentAudio: HTMLAudioElement | null = null;
let onSpeakEnd: (() => void) | null = null;
let currentAbort: AbortController | null = null;

async function speak(
  text: string,
  lang: "tr-TR" | "fa-IR" | "en-US",
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
  } catch {
    if (window.speechSynthesis) {
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

function trTemplates(place: string, terms: string[], enTerms: string[]) {
  const [t1, t2, t3, t4, t5, t6] = terms;
  const [e1, e2, e3, e4, e5, e6] = enTerms;
  return {
    vocabulary: terms.map((w, i) => ({ local: w, english: enTerms[i] ?? enTerms[0] })),
    keySentences: [
      {
        local: `${place} için ${t1} nerede?`,
        english: `Where is the ${e1} for the ${place}?`,
        answerLocal: `${t1} sağ tarafta.`,
        answerEnglish: `The ${e1} is on the right side.`,
      },
      {
        local: `${t2} alabilir miyim?`,
        english: `Can I get a ${e2}?`,
        answerLocal: `Evet, hemen hazırlıyorum.`,
        answerEnglish: `Yes, I will prepare it right away.`,
      },
      {
        local: `${t3} saat kaçta başlıyor?`,
        english: `What time does ${e3} start?`,
        answerLocal: `${t3} saat üçte başlıyor.`,
        answerEnglish: `${e3} starts at 3 o'clock.`,
      },
      {
        local: `${t4} hakkında yardımcı olur musunuz?`,
        english: `Can you help with ${e4}?`,
        answerLocal: `Tabii, birlikte kontrol edelim.`,
        answerEnglish: `Of course, let's check together.`,
      },
      {
        local: `${t5} var mı?`,
        english: `Do you have ${e5}?`,
        answerLocal: `Evet, burada mevcut.`,
        answerEnglish: `Yes, it is available here.`,
      },
      {
        local: `Teşekkürler, ${t6} için ne yapmalıyım?`,
        english: `Thanks, what should I do for ${e6}?`,
        answerLocal: `Lütfen şu sırayı takip edin.`,
        answerEnglish: `Please follow this order.`,
      },
    ],
    dialogue: [
      { speaker: "Staff", local: `Merhaba, ${place} hoş geldiniz.`, english: `Hello, welcome to the ${place}.` },
      { speaker: "You", local: `${t1} hakkında bilgi alabilir miyim?`, english: `Can I get information about ${e1}?` },
      { speaker: "Staff", local: `Tabii, ${t1} bu tarafta.`, english: `Sure, the ${e1} is on this side.` },
      { speaker: "You", local: `${t2} almak istiyorum.`, english: `I want to get ${e2}.` },
      { speaker: "Staff", local: `Tamam, hemen yardımcı oluyorum.`, english: `Okay, I will help right away.` },
      { speaker: "You", local: `Çok teşekkür ederim.`, english: `Thank you very much.` },
    ],
    listening: [
      {
        prompt: `${t1} nerede?`,
        promptEnglish: `Where is the ${e1}?`,
        options: [
          { local: `${t1} sağ tarafta.`, english: `The ${e1} is on the right side.` },
          { local: `Bilmiyorum.`, english: `I don't know.` },
          { local: `Daha sonra gelin.`, english: `Come later.` },
        ],
        correct: 0,
      },
      {
        prompt: `${t2} alabilir miyim?`,
        promptEnglish: `Can I get ${e2}?`,
        options: [
          { local: `Evet, tabii.`, english: `Yes, of course.` },
          { local: `Hayır, kapalı.`, english: `No, it's closed.` },
          { local: `Belki yarın.`, english: `Maybe tomorrow.` },
        ],
        correct: 0,
      },
      {
        prompt: `${t3} saat kaçta?`,
        promptEnglish: `What time is ${e3}?`,
        options: [
          { local: `Saat üçte.`, english: `At 3 o'clock.` },
          { local: `Bugün değil.`, english: `Not today.` },
          { local: `Hiç yok.`, english: `There isn't any.` },
        ],
        correct: 0,
      },
    ],
    speakingPrompts: [
      {
        ai: `Merhaba. ${place} için ilk sorunuz nedir?`,
        aiEnglish: `Hello. What's your first question for the ${place}?`,
        expected: `${t1} nerede?`,
        expectedEnglish: `Where is the ${e1}?`,
      },
      {
        ai: `${t2} ile ilgili ne söylersiniz?`,
        aiEnglish: `What would you say about ${e2}?`,
        expected: `${t2} alabilir miyim?`,
        expectedEnglish: `Can I get ${e2}?`,
      },
      {
        ai: `${t3} saatini sorar mısınız?`,
        aiEnglish: `Can you ask the time for ${e3}?`,
        expected: `${t3} saat kaçta?`,
        expectedEnglish: `What time is ${e3}?`,
      },
    ],
  };
}

function faTemplates(place: string, terms: string[], enTerms: string[]) {
  const [t1, t2, t3, t4, t5, t6] = terms;
  const [e1, e2, e3, e4, e5, e6] = enTerms;
  return {
    vocabulary: terms.map((w, i) => ({ local: w, english: enTerms[i] ?? enTerms[0] })),
    keySentences: [
      {
        local: `برای ${place} ${t1} کجاست؟`,
        english: `Where is the ${e1} for the ${place}?`,
        answerLocal: `${t1} سمت راست است.`,
        answerEnglish: `The ${e1} is on the right side.`,
      },
      {
        local: `می‌توانم ${t2} بگیرم؟`,
        english: `Can I get ${e2}?`,
        answerLocal: `بله، همین الان آماده می‌کنم.`,
        answerEnglish: `Yes, I will prepare it right now.`,
      },
      {
        local: `${t3} چه ساعتی شروع می‌شود؟`,
        english: `What time does ${e3} start?`,
        answerLocal: `${t3} ساعت سه شروع می‌شود.`,
        answerEnglish: `${e3} starts at 3 o'clock.`,
      },
      {
        local: `در مورد ${t4} کمک می‌کنید؟`,
        english: `Can you help with ${e4}?`,
        answerLocal: `حتما، با هم بررسی می‌کنیم.`,
        answerEnglish: `Sure, we will check together.`,
      },
      {
        local: `${t5} دارید؟`,
        english: `Do you have ${e5}?`,
        answerLocal: `بله، اینجا موجود است.`,
        answerEnglish: `Yes, it is available here.`,
      },
      {
        local: `ممنون، برای ${t6} چه کار کنم؟`,
        english: `Thanks, what should I do for ${e6}?`,
        answerLocal: `لطفا این مراحل را انجام دهید.`,
        answerEnglish: `Please follow these steps.`,
      },
    ],
    dialogue: [
      { speaker: "Staff", local: `سلام، به ${place} خوش آمدید.`, english: `Hello, welcome to the ${place}.` },
      { speaker: "You", local: `می‌توانم درباره ${t1} سوال کنم؟`, english: `Can I ask about ${e1}?` },
      { speaker: "Staff", local: `بله، ${t1} این طرف است.`, english: `Yes, the ${e1} is this way.` },
      { speaker: "You", local: `می‌خواهم ${t2} بگیرم.`, english: `I want to get ${e2}.` },
      { speaker: "Staff", local: `حتما، الان کمک می‌کنم.`, english: `Sure, I will help now.` },
      { speaker: "You", local: `خیلی ممنون.`, english: `Thank you very much.` },
    ],
    listening: [
      {
        prompt: `${t1} کجاست؟`,
        promptEnglish: `Where is the ${e1}?`,
        options: [
          { local: `${t1} سمت راست است.`, english: `The ${e1} is on the right side.` },
          { local: `نمی‌دانم.`, english: `I don't know.` },
          { local: `بعدا بیایید.`, english: `Come later.` },
        ],
        correct: 0,
      },
      {
        prompt: `می‌توانم ${t2} بگیرم؟`,
        promptEnglish: `Can I get ${e2}?`,
        options: [
          { local: `بله، حتما.`, english: `Yes, of course.` },
          { local: `خیر، بسته است.`, english: `No, it's closed.` },
          { local: `شاید فردا.`, english: `Maybe tomorrow.` },
        ],
        correct: 0,
      },
      {
        prompt: `${t3} چه ساعتی است؟`,
        promptEnglish: `What time is ${e3}?`,
        options: [
          { local: `ساعت سه.`, english: `At 3 o'clock.` },
          { local: `امروز نه.`, english: `Not today.` },
          { local: `اصلا نیست.`, english: `There isn't any.` },
        ],
        correct: 0,
      },
    ],
    speakingPrompts: [
      {
        ai: `سلام. اولین سوال شما برای ${place} چیست؟`,
        aiEnglish: `Hello. What's your first question for the ${place}?`,
        expected: `${t1} کجاست؟`,
        expectedEnglish: `Where is the ${e1}?`,
      },
      {
        ai: `درباره ${t2} چه می‌گویید؟`,
        aiEnglish: `What would you say about ${e2}?`,
        expected: `می‌توانم ${t2} بگیرم؟`,
        expectedEnglish: `Can I get ${e2}?`,
      },
      {
        ai: `ساعت ${t3} را بپرسید.`,
        aiEnglish: `Ask the time for ${e3}.`,
        expected: `${t3} چه ساعتی است؟`,
        expectedEnglish: `What time is ${e3}?`,
      },
    ],
  };
}

type GeneratedLesson = ReturnType<typeof trTemplates> & {
  title: string;
  description: string;
};

function getGeneratedLesson(id: number, language: SupportedLanguage): GeneratedLesson {
  const meta = getTopicMetaById(id);
  if (!meta) {
    const fallback = getTopicMetaById(1)!;
    const place = language === "tr" ? fallback.place.tr : fallback.place.fa;
    const data =
      language === "tr"
        ? trTemplates(place, fallback.terms.tr, fallback.terms.en)
        : faTemplates(place, fallback.terms.fa, fallback.terms.en);
    return { ...data, title: fallback.title, description: fallback.description };
  }

  const place = language === "tr" ? meta.place.tr : meta.place.fa;
  const data =
    language === "tr"
      ? trTemplates(place, meta.terms.tr, meta.terms.en)
      : faTemplates(place, meta.terms.fa, meta.terms.en);
  return { ...data, title: meta.title, description: meta.description };
}

function parseLessonSlug(slug: string): number | null {
  const match = /^lesson-(\d+)$/.exec(slug);
  if (!match) return null;
  const id = Number.parseInt(match[1], 10);
  if (Number.isNaN(id) || id < 1 || id > 15) return null;
  return id;
}

function normalizeForCompare(input: string): string {
  return input
    .toLowerCase()
    .replace(/[.!?؟]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function SpeakingPracticeSection({
  speakingPrompts,
  onNext,
  langCode,
}: {
  speakingPrompts: Array<{
    ai: string;
    aiEnglish: string;
    expected: string;
    expectedEnglish: string;
  }>;
  onNext: () => void;
  langCode: "tr-TR" | "fa-IR";
}) {
  const [messages, setMessages] = useState<
    { role: "ai" | "you"; text: string; english?: string }[]
  >([{ role: "ai", text: speakingPrompts[0].ai, english: speakingPrompts[0].aiEnglish }]);
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
    speak(text, langCode, () => setPlayingAiId(null));
  };

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Try Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = langCode;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setListening(true);
    setTranscript("");

    recognition.onresult = (event: any) => {
      const result = event.results[0][0].transcript as string;
      setTranscript(result);
      setListening(false);

      const current = speakingPrompts[promptIndex];
      const userMsg: { role: "ai" | "you"; text: string; english?: string } = {
        role: "you",
        text: result,
      };

      if (normalizeForCompare(result) === normalizeForCompare(current.expected)) {
        userMsg.english = current.expectedEnglish;
      }

      const nextIndex = promptIndex + 1;
      const newMessages = [...messages, userMsg];

      if (nextIndex < speakingPrompts.length) {
        newMessages.push({
          role: "ai",
          text: speakingPrompts[nextIndex].ai,
          english: speakingPrompts[nextIndex].aiEnglish,
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
    promptIndex >= speakingPrompts.length - 1 &&
    messages.filter((m) => m.role === "you").length >= speakingPrompts.length;

  return (
    <motion.section key="speaking" variants={fadeUp} initial="hidden" animate="show" exit="hidden">
      <div className="flex items-center gap-2 mb-4">
        <Mic className="h-5 w-5 text-rose-500" />
        <h2 className="text-lg font-semibold">Speaking Practice - AI Roleplay</h2>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="p-5 space-y-4 max-h-[400px] overflow-y-auto">
          {messages.map((msg, i) => {
            const aiId = `ai-speak-${i}`;
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
                            isAiPlaying
                              ? "text-primary bg-primary/10"
                              : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                          }`}
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
                  <p
                    className={`mt-1 text-xs text-muted-foreground/70 italic ${
                      msg.role === "you" ? "text-right pr-1" : "pl-1"
                    }`}
                  >
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
                Hint: <span className="font-medium">{speakingPrompts[promptIndex].expected}</span>{" "}
                <span className="text-muted-foreground/60">
                  ({speakingPrompts[promptIndex].expectedEnglish})
                </span>
              </p>
            )}
            {transcript && (
              <p className="text-xs text-muted-foreground mb-3">Heard: &ldquo;{transcript}&rdquo;</p>
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
              {listening ? "Listening... speak now" : "Tap the microphone and speak"}
            </p>
            <button onClick={() => setShowHint(true)} className="mt-3 text-xs text-primary hover:underline">
              Need a hint?
            </button>
          </div>
        )}

        {allDone && (
          <div className="border-t p-4 text-center">
            <p className="text-sm font-medium text-emerald-600 mb-2">
              Great job! You completed all speaking prompts.
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

export default function TopicLessonPage({
  language,
  lessonSlug,
  backHref,
  backLabel,
  courseTitle,
}: {
  language: SupportedLanguage;
  lessonSlug: string;
  backHref: string;
  backLabel: string;
  courseTitle: string;
}) {
  const lessonId = parseLessonSlug(lessonSlug);
  const safeLessonId = lessonId ?? 1;
  const lesson = getGeneratedLesson(safeLessonId, language);
  const langCode: "tr-TR" | "fa-IR" = language === "tr" ? "tr-TR" : "fa-IR";
  const storageKey = `bllp-${language === "tr" ? "turkish" : "persian"}-lesson-${safeLessonId}`;

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
    Array(4).fill(null)
  );
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedRaw = localStorage.getItem(storageKey);
    const saved = savedRaw ? Number.parseInt(savedRaw, 10) : 0;
    const completed = saved >= sectionLabels.length;
    setHighestReached(saved);
    setCurrentSection(completed ? 0 : saved);
    setReviewMode(completed);
    setMounted(true);
  }, [storageKey]);

  useEffect(() => {
    if (!mounted) return;
    if (!reviewMode && currentSection > highestReached) {
      setHighestReached(currentSection);
      localStorage.setItem(storageKey, String(currentSection));
    }
  }, [currentSection, highestReached, reviewMode, mounted, storageKey]);

  const quizQuestions = useMemo(
    () => [
      {
        question: `What does "${lesson.vocabulary[0].local}" mean?`,
        options: [
          lesson.vocabulary[0].english,
          lesson.vocabulary[1].english,
          lesson.vocabulary[2].english,
          lesson.vocabulary[3].english,
        ],
        correct: 0,
      },
      {
        question: `Choose the best meaning for "${lesson.vocabulary[1].local}".`,
        options: [
          lesson.vocabulary[3].english,
          lesson.vocabulary[1].english,
          lesson.vocabulary[4].english,
          lesson.vocabulary[2].english,
        ],
        correct: 1,
      },
      {
        question: `A correct response to "${lesson.listening[0].promptEnglish}" is:`,
        options: lesson.listening[0].options.map((o) => o.english),
        correct: lesson.listening[0].correct,
      },
      {
        question: `Which phrase asks for help politely?`,
        options: [
          lesson.keySentences[3].local,
          lesson.keySentences[2].answerLocal,
          lesson.keySentences[1].answerLocal,
          lesson.keySentences[0].answerLocal,
        ],
        correct: 0,
      },
    ],
    [lesson]
  );

  const score = quizAnswers.filter((a, i) => a === quizQuestions[i].correct).length;
  const progressStep = reviewMode || quizSubmitted ? sectionLabels.length : currentSection + 1;
  const progressPercent = Math.round((progressStep / sectionLabels.length) * 100);

  if (!mounted) return null;

  const jumpToSection = (index: number) => {
    setCurrentSection(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNext = () => {
    setCurrentSection((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSpeak = (
    id: string,
    text: string,
    lang: "tr-TR" | "fa-IR" | "en-US" = langCode
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

  return (
    <div>
      <div className="mb-6">
        <Link
          href={backHref}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {backLabel}
        </Link>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-500">
            <Plane className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">
              Lesson {safeLessonId} - {lesson.title}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {courseTitle} focus: {lesson.description}
            </p>
          </div>
        </div>
      </div>

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

      {currentSection === 0 && (
        <motion.section key="vocab" variants={fadeUp} initial="hidden" animate="show" exit="hidden">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-emerald-500" />
            <h2 className="text-lg font-semibold">Vocabulary</h2>
          </div>
          <div className="space-y-3">
            {lesson.vocabulary.map((v) => {
              const id = `vocab-${v.local}`;
              const isPlaying = playingId === id;
              return (
                <div key={v.local} className="relative overflow-hidden rounded-lg border bg-card px-4 py-3 shadow-sm">
                  <div className="flex items-start justify-between gap-3 relative z-10">
                    <div>
                      <p className="font-medium text-foreground">{v.local}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{v.english}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSpeak(id, v.local, langCode)}
                      className={`shrink-0 mt-0.5 rounded-full p-1.5 transition-colors ${
                        isPlaying
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-primary hover:bg-primary/10"
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

      {currentSection === 1 && (
        <motion.section key="sentences" variants={fadeUp} initial="hidden" animate="show" exit="hidden">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-semibold">Key Sentences</h2>
          </div>
          <div className="space-y-3">
            {lesson.keySentences.map((s, idx) => {
              const qId = `sentence-q-${idx}`;
              const aId = `sentence-a-${idx}`;
              const isQPlaying = playingId === qId;
              const isAPlaying = playingId === aId;
              return (
                <div key={qId} className="relative overflow-hidden rounded-lg border bg-card px-4 py-3 shadow-sm">
                  <div className="flex items-start justify-between gap-3 relative z-10">
                    <div>
                      <p className="font-medium text-foreground">{s.local}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{s.english}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSpeak(qId, s.local, langCode)}
                      className={`shrink-0 mt-0.5 rounded-full p-1.5 transition-colors ${
                        isQPlaying
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                      }`}
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 border-t pt-3 flex items-start justify-between gap-3 relative z-10">
                    <div>
                      <p className="font-medium text-foreground">{s.answerLocal}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{s.answerEnglish}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSpeak(aId, s.answerLocal, langCode)}
                      className={`shrink-0 mt-0.5 rounded-full p-1.5 transition-colors ${
                        isAPlaying
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-primary hover:bg-primary/10"
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

      {currentSection === 2 && (
        <motion.section key="dialogue" variants={fadeUp} initial="hidden" animate="show" exit="hidden">
          <h2 className="text-lg font-semibold mb-4">Mini Dialogue - Beginner Level</h2>
          <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
            {lesson.dialogue.map((line, i) => {
              const dlgId = `dialogue-${i}`;
              const isPlaying = playingId === dlgId;
              const isYou = line.speaker === "You";
              return (
                <div key={dlgId}>
                  <p
                    className={`text-[10px] font-semibold uppercase tracking-wide mb-1 ${
                      isYou ? "text-right text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {line.speaker}
                  </p>
                  <div className={`flex ${isYou ? "justify-end" : ""}`}>
                    <div
                      className={`relative overflow-hidden max-w-[80%] rounded-xl px-4 py-2.5 text-sm cursor-pointer ${
                        isYou ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                      }`}
                      onClick={() => handleSpeak(dlgId, line.local, langCode)}
                    >
                      <div className="flex items-center gap-2 relative z-10">
                        <span>{line.local}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSpeak(dlgId, line.local, langCode);
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
                  <p className={`mt-1 text-xs text-muted-foreground/70 italic ${isYou ? "text-right pr-1" : "pl-1"}`}>
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

      {currentSection === 3 && (
        <motion.section key="listening" variants={fadeUp} initial="hidden" animate="show" exit="hidden">
          <div className="flex items-center gap-2 mb-4">
            <Headphones className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-semibold">Listening Practice</h2>
          </div>
          {!listeningDone ? (
            (() => {
              const q = lesson.listening[listeningStep];
              const promptId = `listen-prompt-${listeningStep}`;
              const isPromptPlaying = playingId === promptId;
              return (
                <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Question {listeningStep + 1} of {lesson.listening.length}
                  </p>
                  <div
                    className="relative overflow-hidden rounded-lg bg-muted px-4 py-3 cursor-pointer hover:bg-muted/80 transition-colors"
                    onClick={() => handleSpeak(promptId, q.prompt, langCode)}
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
                          key={`${listeningStep}-${oi}`}
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
                            handleSpeak(`listen-opt-${listeningStep}-${oi}`, opt.local, langCode);
                            if (isCorrect) setListeningLocked(true);
                            else setTimeout(() => setListeningSelected(null), 1200);
                          }}
                        >
                          <p>&ldquo;{opt.local}&rdquo;</p>
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
                          if (next >= lesson.listening.length) {
                            setListeningDone(true);
                          } else {
                            setListeningStep(next);
                            setListeningSelected(null);
                            setListeningLocked(false);
                          }
                        }}
                      >
                        {listeningStep + 1 < lesson.listening.length
                          ? "Next Question"
                          : "Finish Listening"}
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
              <p className="text-sm text-muted-foreground">
                Great work. You finished all listening questions.
              </p>
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

      {currentSection === 4 && (
        <SpeakingPracticeSection
          speakingPrompts={lesson.speakingPrompts}
          onNext={handleNext}
          langCode={langCode}
        />
      )}

      {currentSection === 5 && (
        <motion.section key="quiz" variants={fadeUp} initial="hidden" animate="show" exit="hidden">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-semibold">Lesson Quiz</h2>
          </div>
          {!quizSubmitted ? (
            <div className="rounded-xl border bg-card p-5 shadow-sm space-y-5">
              {quizQuestions.map((q, qi) => (
                <div key={`quiz-${qi}`}>
                  <p className="text-sm font-medium mb-2">
                    {qi + 1}. {q.question}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => {
                      const selected = quizAnswers[qi] === oi;
                      return (
                        <button
                          key={`quiz-${qi}-${oi}`}
                          type="button"
                          onClick={() =>
                            setQuizAnswers((prev) => {
                              const next = [...prev];
                              next[qi] = oi;
                              return next;
                            })
                          }
                          className={`w-full text-left rounded-lg border px-3 py-2 text-sm transition-colors ${
                            selected
                              ? "border-primary bg-primary/5 text-foreground"
                              : "border-border hover:border-primary/40"
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
                    localStorage.setItem(storageKey, String(sectionLabels.length));
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

