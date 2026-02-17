"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Globe2, CalendarCheck } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Globe2,
    title: "Pick a Language",
    description:
      "Choose from over 30 global languages. Our AI assesses your level and creates a custom learning roadmap.",
    accent: "from-primary to-emerald-accent",
  },
  {
    number: "02",
    icon: CalendarCheck,
    title: "Practice Daily",
    description:
      "Bite-sized interactive exercises designed for maximum retention. Just 10 minutes a day builds real fluency.",
    accent: "from-warm-amber to-[#f59e0b]",
  },
];

export function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="relative overflow-hidden py-24 lg:py-32"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-primary" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-[#0d4e49] opacity-100" />

      {/* Subtle pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-white/60">
            Simple Process
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            How It Works
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/70">
            Three simple steps to transform how you learn. Our AI handles the
            complexity so you can focus on speaking.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 md:max-w-3xl md:mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: 0.2 + i * 0.15,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group relative"
            >
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] p-8 backdrop-blur-sm transition-all duration-500 hover:border-white/20 hover:bg-white/[0.1]">
                {/* Step number */}
                <span className="font-display text-5xl font-extrabold text-white/[0.08]">
                  {step.number}
                </span>

                {/* Icon */}
                <div className="mt-4 flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 text-white transition-transform duration-300 group-hover:scale-110">
                  <step.icon className="h-7 w-7" />
                </div>

                <h3 className="mt-5 font-display text-xl font-bold text-white">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/70">
                  {step.description}
                </p>

                {/* Gradient accent line */}
                <div className="mt-6 h-1 w-12 overflow-hidden rounded-full opacity-60">
                  <div
                    className={`h-full w-full bg-gradient-to-r ${step.accent}`}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
