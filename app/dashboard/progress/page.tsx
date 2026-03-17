"use client";

import { motion } from "framer-motion";

import { useUserProfile } from "@/app/context/UserProfileContext";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};


export default function ProgressPage() {

  const { profile } = useUserProfile();

  const TOTAL_SECTIONS = 6;
  const TOTAL_LESSONS = 15;

  const progressData = profile?.enrolled.map((courseName) =>{
    const courseProgress = profile.courseProgress.find(
      (c) => c.courseName === courseName
    );
    const completedLessons =
      courseProgress?.lessons.filter(
        (l) => l.sectionsComplete >= TOTAL_SECTIONS
      ).length ?? 0;
    return {
      course: courseName,
      completedLessons,
      totalLessons: TOTAL_LESSONS,
    };
  }) ?? [];

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
        {progressData.length === 0 ? (
          <p className="text-sm text-muted-foreground col-span-3">
            No Courses enrolled yet.
          </p>
        ) : progressData.map((course, i) => {
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