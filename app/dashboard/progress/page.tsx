"use client";

import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const progressData = [
  { week: "Week 1", hours: 4 },
  { week: "Week 2", hours: 6 },
  { week: "Week 3", hours: 5 },
  { week: "Week 4", hours: 8 },
];

export default function ProgressPage() {
  return (
    <div className="p-6 lg:p-10">
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <h1 className="font-display text-3xl font-bold tracking-tight mb-6 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          Progress
        </h1>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {progressData.map((week) => (
            <div
              key={week.week}
              className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <h2 className="font-medium text-lg mb-2">{week.week}</h2>
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full"
                  style={{ width: `${week.hours * 10}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Hours Learned: {week.hours}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
