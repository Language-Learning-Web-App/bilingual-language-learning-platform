"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";

export function CTASection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-3xl border border-border bg-card"
        >
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-secondary via-card to-secondary" />
          <div className="absolute inset-0 gradient-mesh-teal opacity-60" />

          {/* Dot pattern */}
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* Decorative floating elements */}
          <motion.div
            className="absolute right-12 top-12 text-5xl opacity-40 select-none"
            animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            🌍
          </motion.div>
          <motion.div
            className="absolute left-16 bottom-12 text-4xl opacity-40 select-none"
            animate={{ y: [0, -6, 0], rotate: [0, -3, 0] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          >
            💬
          </motion.div>

          <div className="relative z-10 flex flex-col items-center px-8 py-20 text-center lg:px-16 lg:py-24">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"
            >
              <Zap className="h-7 w-7" />
            </motion.div>

            <h2 className="mt-8 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
              Ready to start your
              <br />
              language journey?
            </h2>

            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              Join millions of learners worldwide. It takes less than 2 minutes
              to begin your language journey.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Button
                size="lg"
                className="h-13 gap-2.5 bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5"
                asChild
              >
                <Link href="/sign-up">
                  Get Started
                  <ArrowRight className="h-4.5 w-4.5" />
                </Link>
              </Button>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}
