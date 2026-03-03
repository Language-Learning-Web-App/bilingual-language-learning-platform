"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, BookOpen, Mic } from "lucide-react";

const floatingGlyphs = [
  { char: "你好", top: "12%", left: "8%", delay: 0, size: "text-2xl" },
  { char: "مرحبا", top: "25%", right: "12%", delay: 0.5, size: "text-xl" },
  { char: "こんにちは", bottom: "30%", left: "5%", delay: 1, size: "text-lg" },
  { char: "Bonjour", top: "8%", right: "25%", delay: 1.5, size: "text-base" },
  { char: "Hola", bottom: "18%", right: "8%", delay: 0.8, size: "text-xl" },
  { char: "안녕", top: "45%", left: "15%", delay: 1.2, size: "text-lg" },
];

const stagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function Hero() {
  return (
    <section className="relative overflow-hidden grain-overlay">
      {/* Background mesh */}
      <div className="absolute inset-0 gradient-mesh-teal" />

      {/* Floating language glyphs */}
      {floatingGlyphs.map((glyph, i) => (
        <motion.span
          key={i}
          className={`pointer-events-none absolute select-none font-display ${glyph.size} text-primary/[0.06] font-bold`}
          style={{
            top: glyph.top,
            left: glyph.left,
            right: glyph.right,
            bottom: glyph.bottom,
          }}
          animate={{
            y: [0, -12, 0],
            rotate: [0, 3, 0],
          }}
          transition={{
            duration: 5 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: glyph.delay,
          }}
        >
          {glyph.char}
        </motion.span>
      ))}

      <div className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-20 lg:px-10 lg:pb-32 lg:pt-28">
        <div className="grid items-center gap-16 lg:grid-cols-[1fr_auto] lg:gap-20">
          {/* Text content */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="max-w-2xl"
          >
            <motion.div
              variants={fadeUp}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-warm-amber/20 bg-warm-amber/5 px-4 py-1.5 text-sm font-medium text-warm-amber"
            >
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered Learning
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-display text-5xl font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-6xl lg:text-7xl"
            >
              Learn Languages
              <br />
              with{" "}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-primary via-emerald-accent to-primary bg-clip-text text-transparent">
                  Confidence
                </span>
                <span className="absolute -bottom-1 left-0 h-3 w-full rounded-sm bg-primary/10" />
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground sm:text-xl"
            >
              AI-powered lessons, interactive quizzes, and structured learning
              paths tailored to your pace. Speak fluently, faster.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <Button
                size="lg"
                className="h-12 gap-2 bg-primary px-7 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5"
                asChild
              >
                <Link href="/sign-up">
                  Sign Up
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 gap-2 border-2 border-primary/20 px-7 text-base font-semibold text-primary transition-all duration-300 hover:border-primary/40 hover:bg-primary/5"
              >
                View Languages
              </Button>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="mt-10 flex items-center gap-6 text-sm text-muted-foreground"
            >
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-accent" />
                30+ languages
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-accent" />
                AI-powered lessons
              </span>
              <span className="hidden items-center gap-1.5 sm:flex">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-accent" />
                Personalized paths
              </span>
            </motion.div>
          </motion.div>

          {/* Hero card */}
          <motion.div
            initial={{ opacity: 0, x: 40, rotateY: -5 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative hidden lg:block"
          >
            {/* Decorative ring behind card */}
            <div className="absolute -inset-4 rounded-3xl border border-primary/[0.06]" />
            <div className="absolute -inset-8 rounded-[2rem] border border-primary/[0.03]" />

            <div className="relative w-[380px] overflow-hidden rounded-2xl border border-border bg-card p-7 shadow-2xl shadow-primary/[0.06]">
              {/* Card header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Your Progress
                  </p>
                  <p className="mt-1 font-display text-2xl font-bold text-foreground">
                    Arabic
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <BookOpen className="h-6 w-6" />
                </div>
              </div>

              {/* Progress */}
              <div className="mt-6">
                <div className="flex items-end justify-between text-sm">
                  <span className="text-muted-foreground">Intermediate</span>
                  <span className="font-display text-2xl font-bold text-primary">
                    78%
                  </span>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-secondary">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-accent"
                    initial={{ width: "0%" }}
                    animate={{ width: "78%" }}
                    transition={{
                      duration: 1.4,
                      delay: 1,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  />
                </div>
              </div>

              {/* Mini stats */}
              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  { label: "Streak", value: "14d", icon: "🔥" },
                  { label: "Words", value: "842", icon: "📖" },
                  { label: "Hours", value: "36h", icon: "⏱" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl bg-secondary/60 px-3 py-3 text-center"
                  >
                    <p className="text-lg">{stat.icon}</p>
                    <p className="mt-1 font-display text-sm font-bold text-foreground">
                      {stat.value}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
