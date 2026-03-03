"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Brain, Headphones, BarChart3, Globe } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Adaptive AI Tutor",
    description:
      "Lessons that adjust in real-time to your strengths and weaknesses. No two learning paths are alike.",
    accent: "bg-primary/10 text-primary",
  },
  {
    icon: Headphones,
    title: "Immersive Audio",
    description:
      "Native speaker recordings and AI pronunciation feedback to train your ear and your accent.",
    accent: "bg-warm-amber/10 text-warm-amber",
  },
  {
    icon: BarChart3,
    title: "Smart Analytics",
    description:
      "Track vocabulary retention, speaking fluency, and grammar accuracy with detailed dashboards.",
    accent: "bg-emerald-accent/10 text-emerald-accent",
  },
  {
    icon: Globe,
    title: "30+ Languages",
    description:
      "From Spanish and Mandarin to Farsi and Korean. Start with one, expand to many.",
    accent: "bg-[#7c3aed]/10 text-[#7c3aed]",
  },
];

export function Features() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="features"
      ref={ref}
      className="relative py-24 lg:py-32"
    >
      <div className="absolute inset-0 gradient-mesh-amber" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Why BLLP-AI
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Language learning,{" "}
            <span className="text-primary">reimagined</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Traditional apps bore you with repetition. We use AI to make every
            session unique, challenging, and genuinely useful.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: 0.15 + i * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-7 transition-all duration-500 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/[0.04] hover:-translate-y-1"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${feature.accent} transition-transform duration-300 group-hover:scale-110`}
              >
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-display text-lg font-bold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>

              {/* Decorative corner gradient on hover */}
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/[0.03] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
