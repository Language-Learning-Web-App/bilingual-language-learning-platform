"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const languages = [
  { name: "Spanish", flag: "🇪🇸", learners: "12M+" },
  { name: "Mandarin", flag: "🇨🇳", learners: "8M+" },
  { name: "French", flag: "🇫🇷", learners: "9M+" },
  { name: "Arabic", flag: "🇸🇦", learners: "5M+" },
  { name: "Korean", flag: "🇰🇷", learners: "6M+" },
  { name: "Japanese", flag: "🇯🇵", learners: "7M+" },
  { name: "German", flag: "🇩🇪", learners: "4M+" },
  { name: "Portuguese", flag: "🇧🇷", learners: "5M+" },
  { name: "Hindi", flag: "🇮🇳", learners: "3M+" },
  { name: "Italian", flag: "🇮🇹", learners: "4M+" },
  { name: "Turkish", flag: "🇹🇷", learners: "2M+" },
  { name: "Farsi", flag: "🇮🇷", learners: "1M+" },
];

function LanguagePill({
  name,
  flag,
  learners,
}: {
  name: string;
  flag: string;
  learners: string;
}) {
  return (
    <div className="flex shrink-0 items-center gap-3 rounded-full border border-border/60 bg-card px-5 py-3 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5">
      <span className="text-2xl">{flag}</span>
      <div>
        <p className="font-display text-sm font-bold text-foreground">{name}</p>
        <p className="text-[11px] text-muted-foreground">{learners} learners</p>
      </div>
    </div>
  );
}

export function LanguagesMarquee() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <section id="languages" ref={ref} className="relative overflow-hidden py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Global Reach
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            30+ Languages & Counting
          </h2>
        </motion.div>
      </div>

      {/* Scrolling rows */}
      <div className="mt-14 space-y-4">
        {/* Row 1 - scrolls left */}
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-background to-transparent" />
          <motion.div
            className="flex gap-4"
            animate={{ x: [0, -1200] }}
            transition={{
              x: { repeat: Infinity, repeatType: "loop", duration: 40, ease: "linear" },
            }}
          >
            {[...languages, ...languages].map((lang, i) => (
              <LanguagePill key={`row1-${i}`} {...lang} />
            ))}
          </motion.div>
        </div>

        {/* Row 2 - scrolls right */}
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-background to-transparent" />
          <motion.div
            className="flex gap-4"
            animate={{ x: [-1200, 0] }}
            transition={{
              x: { repeat: Infinity, repeatType: "loop", duration: 45, ease: "linear" },
            }}
          >
            {[...languages.slice(6), ...languages.slice(0, 6), ...languages].map((lang, i) => (
              <LanguagePill key={`row2-${i}`} {...lang} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
