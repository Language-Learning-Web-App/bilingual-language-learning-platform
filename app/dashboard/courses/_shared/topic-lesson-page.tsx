"use client";

import { useEffect, useRef, useState } from "react";
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
import type { LessonContent } from "@/app/lib/lesson-data-types";
import { getTopicMetaById, SupportedLanguage } from "./topic-lessons";
import { saveLessonProgress, addSecondsLearned } from "@/app/lib/userProfileService";
import { auth } from "@/app/lib/firebase-config";
import { useUserProfile } from "@/app/context/UserProfileContext";

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

type SpeakLang =
  | "tr-TR"
  | "fa-IR"
  | "en-US"
  | "sr-Latn-RS"
  | "ru-RU"
  | "es-ES"
  | "fr-FR"
  | "de-DE"
  | "ja-JP"
  | "ar-SA"
  | "hi-IN";

async function speak(
  text: string,
  lang: SpeakLang,
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

const MAX_LESSON_BY_LANGUAGE: Record<SupportedLanguage, number> = {
  tr: 15,
  fa: 15,
  sr: 16,
  ru: 16,
  es: 15,
  fr: 15,
  de: 15,
  ja: 15,
  ar: 15,
  hi: 15,
};

const LANGUAGE_FOLDER: Record<SupportedLanguage, string> = {
  tr: "turkish",
  fa: "persian",
  sr: "serbian",
  ru: "russian",
  es: "spanish",
  fr: "french",
  de: "german",
  ja: "japanese",
  ar: "arabic",
  hi: "hindi",
};

const LANGUAGE_LOCALE: Record<
  SupportedLanguage,
  Exclude<SpeakLang, "en-US">
> = {
  tr: "tr-TR",
  fa: "fa-IR",
  sr: "sr-Latn-RS",
  ru: "ru-RU",
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE",
  ja: "ja-JP",
  ar: "ar-SA",
  hi: "hi-IN",
};

function parseLessonSlug(
  slug: string,
  language: SupportedLanguage
): number | null {
  const match = /^lesson-(\d+)$/.exec(slug);
  if (!match) return null;
  const id = Number.parseInt(match[1], 10);
  const max = MAX_LESSON_BY_LANGUAGE[language];
  if (Number.isNaN(id) || id < 1 || id > max) return null;
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
  langCode: Exclude<SpeakLang, "en-US">;
}) {
  const [messages, setMessages] = useState<
    { role: "ai" | "you"; text: string; english?: string }[]
  >([{ role: "ai", text: speakingPrompts[0].ai, english: speakingPrompts[0].aiEnglish }]);
  const [promptIndex, setPromptIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [sttError, setSttError] = useState<string | null>(null);
  const [playingAiId, setPlayingAiId] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const levelRafRef = useRef<number | null>(null);
  const maxLevelRef = useRef(0);
  const autoStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const MAX_RECORDING_MS = 30000;
  const MIN_LEVEL_THRESHOLD = 0.01;

  const teardownAudioMeter = () => {
    if (levelRafRef.current !== null) {
      cancelAnimationFrame(levelRafRef.current);
      levelRafRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevel(0);
  };

  const stopMediaStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    teardownAudioMeter();
    if (autoStopTimerRef.current) {
      clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = null;
    }
  };

  const applyTranscript = (result: string) => {
    if (!result) return;
    setTranscript(result);

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

  const stopRecordingAndTranscribe = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
  };

  const startListening = async () => {
    if (listening || transcribing) {
      if (listening) stopRecordingAndTranscribe();
      return;
    }

    setTranscript("");
    setSttError(null);

    const supportsRecording =
      typeof window !== "undefined" &&
      typeof window.MediaRecorder !== "undefined" &&
      !!navigator.mediaDevices?.getUserMedia;

    if (!supportsRecording) {
      setSttError(
        "Your browser does not support microphone recording. Try Chrome, Safari, or Edge."
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      try {
        const AudioCtx =
          (window as any).AudioContext || (window as any).webkitAudioContext;
        const audioContext: AudioContext = new AudioCtx();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 1024;
        source.connect(analyser);
        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        maxLevelRef.current = 0;

        const buffer = new Float32Array(analyser.fftSize);
        const tick = () => {
          const a = analyserRef.current;
          if (!a) return;
          a.getFloatTimeDomainData(buffer);
          let sumSquares = 0;
          for (let i = 0; i < buffer.length; i++) {
            sumSquares += buffer[i] * buffer[i];
          }
          const rms = Math.sqrt(sumSquares / buffer.length);
          if (rms > maxLevelRef.current) maxLevelRef.current = rms;
          setAudioLevel(rms);
          levelRafRef.current = requestAnimationFrame(tick);
        };
        levelRafRef.current = requestAnimationFrame(tick);
      } catch (meterErr) {
        console.log("[stt] audio meter unavailable", meterErr);
      }

      const preferredTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
        "audio/mp4",
      ];
      const mimeType = preferredTypes.find((t) =>
        typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported
          ? MediaRecorder.isTypeSupported(t)
          : false
      );

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        setListening(false);
        const capturedMaxLevel = maxLevelRef.current;
        stopMediaStream();

        const chunks = audioChunksRef.current;
        audioChunksRef.current = [];
        if (!chunks.length) {
          setSttError(
            "No audio was captured. Please check your microphone and try again."
          );
          return;
        }

        const blobType = recorder.mimeType || mimeType || "audio/webm";
        const audioBlob = new Blob(chunks, { type: blobType });

        const extension = blobType.includes("ogg")
          ? "ogg"
          : blobType.includes("mp4")
            ? "m4a"
            : "webm";

        console.log("[stt] recorded blob", {
          size: audioBlob.size,
          type: blobType,
          extension,
          chunkCount: chunks.length,
          maxLevel: capturedMaxLevel,
        });

        if (capturedMaxLevel > 0 && capturedMaxLevel < MIN_LEVEL_THRESHOLD) {
          setSttError(
            "Your mic is connected but no sound is coming through. On macOS open System Settings → Privacy & Security → Microphone and enable access for your browser, then reload this page."
          );
          return;
        }

        if (audioBlob.size < 8000) {
          setSttError(
            "Recording too short. Tap the mic, wait one full second, speak clearly, then tap again to stop."
          );
          return;
        }

        setTranscribing(true);
        try {
          const formData = new FormData();
          formData.append("audio", audioBlob, `speech.${extension}`);
          formData.append("language", langCode.split("-")[0]);

          const res = await fetch("/api/stt", {
            method: "POST",
            body: formData,
          });

          const data = (await res.json().catch(() => ({}))) as {
            text?: string;
            provider?: string;
            error?: string;
            detail?: string;
            fallback?: boolean;
            audioBytes?: number;
          };
          console.log("[stt] response", { status: res.status, ...data });

          if (!res.ok || data.error) {
            setSttError(
              data.detail ||
                data.error ||
                "Speech recognition failed. Please try again."
            );
            return;
          }

          const text = (data.text ?? "").trim();
          if (text) {
            applyTranscript(text);
          } else {
            setSttError(
              "No speech detected. Please speak a bit louder or closer to the mic."
            );
          }
        } catch (err) {
          console.log("[stt] fetch error", err);
          setSttError(
            "Could not reach the speech service. Please check your connection and try again."
          );
        } finally {
          setTranscribing(false);
        }
      };

      recorder.onerror = () => {
        setListening(false);
        stopMediaStream();
      };

      recorder.start();
      setListening(true);

      autoStopTimerRef.current = setTimeout(() => {
        if (recorder.state !== "inactive") {
          try {
            recorder.stop();
          } catch {}
        }
      }, MAX_RECORDING_MS);
    } catch (err) {
      console.log("[stt] getUserMedia error", err);
      stopMediaStream();
      setSttError(
        "Microphone access was blocked. Please allow mic permission and try again."
      );
    }
  };

  useEffect(() => {
    return () => {
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== "inactive") {
        try {
          recorder.stop();
        } catch {}
      }
      stopMediaStream();
    };
  }, []);

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
            {sttError && (
              <p className="text-xs text-rose-500 mb-3">{sttError}</p>
            )}

            <button
              onClick={startListening}
              disabled={transcribing}
              className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full transition-all ${
                listening
                  ? "bg-red-500 text-white animate-pulse scale-110"
                  : transcribing
                    ? "bg-amber-500 text-white animate-pulse"
                    : "bg-primary/10 text-primary hover:bg-primary/20 hover:scale-105"
              }`}
            >
              <Mic className="h-7 w-7" />
            </button>
            <p className="mt-3 text-sm text-muted-foreground">
              {listening
                ? "Recording... tap again to stop"
                : transcribing
                  ? "Transcribing your speech..."
                  : "Tap the microphone and speak"}
            </p>
            {listening && (
              <div className="mx-auto mt-3 w-48">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-emerald-500 transition-[width] duration-75"
                    style={{
                      width: `${Math.min(100, Math.round(audioLevel * 500))}%`,
                    }}
                  />
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {audioLevel > 0.02
                    ? "Mic is picking up your voice"
                    : "Speak now — if the bar stays flat, check your mic"}
                </p>
              </div>
            )}
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

  const { refreshProfile } = useUserProfile();
  const lessonId = parseLessonSlug(lessonSlug, language);
  const safeLessonId = lessonId ?? 1;
  const langCode = LANGUAGE_LOCALE[language];
  const storageKey = `bllp-${LANGUAGE_FOLDER[language]}-lesson-${safeLessonId}`;

  const [mounted, setMounted] = useState(false);
  const [lesson, setLesson] = useState<LessonContent | null>(null);
  const [lessonLoading, setLessonLoading] = useState(true);
  const [lessonError, setLessonError] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [highestReached, setHighestReached] = useState(0);
  const [reviewMode, setReviewMode] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [listeningStep, setListeningStep] = useState(0);
  const [listeningSelected, setListeningSelected] = useState<number | null>(null);
  const [listeningLocked, setListeningLocked] = useState(false);
  const [listeningDone, setListeningDone] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([]);
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

  // Save section progress to both localStorage and Firestore
  useEffect(() => {
    let cancelled = false;

    async function loadLesson() {
      setLessonLoading(true);
      setLessonError(null);
      try {
        const res = await fetch(
          `/api/lesson-data?language=${language}&lesson=${safeLessonId}`
        );
        if (!res.ok) {
          throw new Error(`Failed to load lesson data (${res.status})`);
        }
        const data = (await res.json()) as LessonContent;
        if (!cancelled) {
          setLesson(data);
          setQuizAnswers(Array(data.quizQuestions.length).fill(null));
        }
      } catch (error) {
        if (!cancelled) {
          setLesson(null);
          setLessonError(String(error));
        }
      } finally {
        if (!cancelled) {
          setLessonLoading(false);
        }
      }
    }

    loadLesson();
    return () => {
      cancelled = true;
    };
  }, [language, safeLessonId]);

  useEffect(() => {
    if (!mounted) return;
    if (!reviewMode && currentSection > highestReached) {
      setHighestReached(currentSection);
      localStorage.setItem(storageKey, String(currentSection));

      // Write mid-lesson section progress to Firestore
      const uid = auth.currentUser?.uid;
      if (uid) {
        saveLessonProgress(uid, courseTitle, safeLessonId, currentSection).then(
          () => refreshProfile()
        );
      }
    }
  }, [currentSection, highestReached, reviewMode, mounted, storageKey, courseTitle, safeLessonId, refreshProfile]);

  useEffect(() => {
    const startTime = Date.now();
    return () => {
      const secondsSpent = Math.floor((Date.now() - startTime) / 1000);
      if (secondsSpent < 5) return;
      const uid = auth.currentUser?.uid;
      if (uid) {
        addSecondsLearned(uid, secondsSpent).then(() => refreshProfile());
      }
    };
  }, []);

  const quizQuestions = lesson?.quizQuestions ?? [];

  const score = quizAnswers.filter((a, i) => a === quizQuestions[i].correct).length;
  const progressStep = reviewMode || quizSubmitted ? sectionLabels.length : currentSection + 1;
  const progressPercent = Math.round((progressStep / sectionLabels.length) * 100);

  if (!mounted || lessonLoading) {
    return <div className="text-sm text-muted-foreground">Loading lesson data...</div>;
  }
  if (!lesson) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Could not load lesson data from CSV. {lessonError ?? ""}
      </div>
    );
  }

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
    lang: SpeakLang = langCode
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
              Lesson {safeLessonId} - {lesson.metadata.title}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {courseTitle} focus: {lesson.metadata.description}
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
                  onClick={async () => {
                    setQuizSubmitted(true);
                    setReviewMode(true);
                    setHighestReached(sectionLabels.length);
                    localStorage.setItem(storageKey, String(sectionLabels.length));

                    // Save completed lesson progress to Firestore
                    const uid = auth.currentUser?.uid;
                    if (uid) {
                      await saveLessonProgress(uid, courseTitle, safeLessonId, sectionLabels.length);
                      await refreshProfile();
                    }
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