"use client";

import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Link from "next/link";

import { useUserProfile } from "@/app/context/UserProfileContext";

// ─── Constants ────────────────────────────────────────────────────────────────
// TODO: pull these from your course data source when available
const TOTAL_SECTIONS = 6;
const TOTAL_LESSONS = 15;

// ─── Pie chart colors ─────────────────────────────────────────────────────────
const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ec4899", "#14b8a6"];

// ─── Animation variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.07 },
  }),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getProgressPercent(completed: number, total: number) {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

function CircularProgress({ percent }: { percent: number }) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative w-20 h-20 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="currentColor"
          strokeWidth="6"
          className="text-muted"
          fill="transparent"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="currentColor"
          strokeWidth="6"
          className="text-primary"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
        {percent}%
      </span>
    </div>
  );
}

// ─── Placeholder notice for unimplemented charts ──────────────────────────────
function ChartPlaceholderNotice() {
  return (
    <p className="text-xs text-muted-foreground/60 mt-2 text-center italic">
      * Based on sample data — live activity tracking coming soon.
    </p>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProgressPage() {
  const { profile } = useUserProfile();

  // Build per-course progress data from real Firestore profile
  const progressData =
    profile?.enrolled.map((courseName) => {
      const courseProgress = profile.courseProgress.find(
        (c) => c.courseName === courseName
      );
      const completedLessons =
        courseProgress?.lessons.filter(
          (l) => l.sectionsComplete >= TOTAL_SECTIONS
        ).length ?? 0;
      return { course: courseName, completedLessons, totalLessons: TOTAL_LESSONS };
    }) ?? [];

  // Summary stats
  const totalEnrolled = progressData.length;
  const totalCompleted = progressData.reduce(
    (sum, c) => sum + c.completedLessons,
    0
  );
  const totalPossible = progressData.reduce(
    (sum, c) => sum + c.totalLessons,
    0
  );
  const overallPercent =
    totalPossible > 0
      ? Math.round((totalCompleted / totalPossible) * 100)
      : 0;

  // Placeholder weekly data (clearly marked as such)
  const weeklyPlaceholder = [
    { day: "Mon", hours: 1 },
    { day: "Tue", hours: 2 },
    { day: "Wed", hours: 1.5 },
    { day: "Thu", hours: 3 },
    { day: "Fri", hours: 2.5 },
    { day: "Sat", hours: 4 },
    { day: "Sun", hours: 2 },
  ];

  const isEmpty = totalEnrolled === 0;

  return (
    <motion.div
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto space-y-10 pb-16"
    >
      {/* ── Header ── */}
      <motion.div variants={fadeUp} custom={0}>
        <h1 className="text-3xl font-bold tracking-tight">Your Progress</h1>
        <p className="text-muted-foreground mt-2">
          Track your learning journey across all enrolled courses.
        </p>
      </motion.div>

      {/* ── Summary Banner ── */}
      {!isEmpty && (
        <motion.div
          variants={fadeUp}
          custom={1}
          className="grid grid-cols-3 gap-4 rounded-xl border bg-card p-6 shadow-sm"
        >
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">{totalEnrolled}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {totalEnrolled === 1 ? "Course Enrolled" : "Courses Enrolled"}
            </p>
          </div>
          <div className="text-center border-x">
            <p className="text-3xl font-bold text-primary">{totalCompleted}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Lessons Completed
            </p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">{overallPercent}%</p>
            <p className="text-xs text-muted-foreground mt-1">Overall Progress</p>
          </div>
        </motion.div>
      )}

      {/* ── Course Progress Cards ── */}
      {isEmpty ? (
        /* Empty state with CTA */
        <motion.div
          variants={fadeUp}
          custom={1}
          className="rounded-xl border bg-card p-12 shadow-sm flex flex-col items-center gap-4 text-center"
        >
          <span className="text-5xl">📚</span>
          <h2 className="text-xl font-semibold">No courses enrolled yet</h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            Enroll in a course to start tracking your progress here.
          </p>
          <Link
            href="/dashboard/courses"
            className="mt-2 inline-flex items-center px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Browse Courses →
          </Link>
        </motion.div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {progressData.map((course, i) => {
            const percent = getProgressPercent(
              course.completedLessons,
              course.totalLessons
            );
            return (
              <motion.div
                key={course.course}
                variants={fadeUp}
                custom={i + 2}
                className="rounded-xl border bg-card p-6 shadow-sm space-y-4"
              >
                {/* Course name */}
                <p className="text-sm font-semibold leading-snug line-clamp-2">
                  {course.course}
                </p>

                {/* Circular progress */}
                <CircularProgress percent={percent} />

                {/* Lesson count — single, below the circle only */}
                <p className="text-center text-xs text-muted-foreground">
                  {course.completedLessons} / {course.totalLessons} lessons completed
                </p>

                {/* Linear progress bar as secondary indicator */}
                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Charts Section (placeholder-aware) ── */}
      {!isEmpty && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Weekly Activity — placeholder data, clearly labeled */}
          <motion.div
            variants={fadeUp}
            custom={progressData.length + 2}
            className="rounded-xl border bg-card p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold mb-1">Weekly Study Activity</h2>
            <ChartPlaceholderNotice />
            <div className="mt-4">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={weeklyPlaceholder}>
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => `${v}h`}
                    width={30}
                  />
                  <Tooltip formatter={(v) => [`${v ?? 0}h`, "Study time"]} />
                  <Line
                    type="monotone"
                    dataKey="hours"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Course Distribution — real data from Firestore */}
          <motion.div
            variants={fadeUp}
            custom={progressData.length + 3}
            className="rounded-xl border bg-card p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold mb-4">
              Lessons Completed by Course
            </h2>
            {totalCompleted === 0 ? (
              <div className="flex items-center justify-center h-[220px] text-sm text-muted-foreground">
                Complete some lessons to see your distribution here.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={progressData.filter((c) => c.completedLessons > 0)}
                    dataKey="completedLessons"
                    nameKey="course"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }: { name?: string; percent?: number }) =>
                      `${(name ?? "").split(" ")[0]} ${Math.round((percent ?? 0) * 100)}%`
                    }
                    labelLine={false}
                  >
                    {progressData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => [
                      `${v ?? 0} lesson${Number(v) !== 1 ? "s" : ""}`,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}