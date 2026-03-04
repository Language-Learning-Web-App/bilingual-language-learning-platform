"use client";

import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// Mock data for UI demonstration
const mockProgress = [
  { course: "English 101", hours: 12, completedLessons: 6, totalLessons: 10 },
  { course: "Spanish Basics", hours: 5, completedLessons: 2, totalLessons: 8 },
  { course: "French Advanced", hours: 8, completedLessons: 8, totalLessons: 8 },
];

export default function ProgressPage() {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Progress</h1>
        <p className="text-muted-foreground mt-2">
          Track your learning progress for each course.
        </p>
      </div>

      {/* Progress Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {mockProgress.map((course, i) => {
          const progressPercent =
            (course.completedLessons / course.totalLessons) * 100;

          return (
            <motion.div
              key={i}
              variants={fadeUp}
              className="rounded-xl border bg-card p-6 shadow-sm space-y-4"
            >
              <p className="text-sm text-muted-foreground font-medium">
                {course.course}
              </p>
              <p className="text-2xl font-bold">{course.hours} hrs</p>
              <p className="text-xs text-muted-foreground/70">
                {course.completedLessons}/{course.totalLessons} lessons completed
              </p>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-2 bg-primary rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}