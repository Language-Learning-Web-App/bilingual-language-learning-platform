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

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// Mock data
const mockProgress = [
  { course: "English 101", hours: 12, completedLessons: 6, totalLessons: 10 },
  { course: "Spanish Basics", hours: 5, completedLessons: 2, totalLessons: 8 },
  { course: "French Advanced", hours: 8, completedLessons: 8, totalLessons: 8 },
];

// Weekly activity (line chart)
const weeklyData = [
  { day: "Mon", hours: 1 },
  { day: "Tue", hours: 2 },
  { day: "Wed", hours: 1.5 },
  { day: "Thu", hours: 3 },
  { day: "Fri", hours: 2.5 },
  { day: "Sat", hours: 4 },
  { day: "Sun", hours: 2 },
];

// Colors for pie
const COLORS = ["#6366f1", "#22c55e", "#f59e0b"];

export default function ProgressPage() {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto space-y-10"
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

              {/* Circular Progress */}
              <div className="relative w-20 h-20 mx-auto">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="30"
                    stroke="currentColor"
                    strokeWidth="6"
                    className="text-muted"
                    fill="transparent"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="30"
                    stroke="currentColor"
                    strokeWidth="6"
                    className="text-primary"
                    fill="transparent"
                    strokeDasharray={188}
                    strokeDashoffset={
                      188 - (progressPercent / 100) * 188
                    }
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
                  {Math.round(progressPercent)}%
                </span>
              </div>

              <p className="text-center text-xs text-muted-foreground">
                {course.completedLessons}/{course.totalLessons} lessons
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Line Chart */}
        <motion.div
          variants={fadeUp}
          className="rounded-xl border bg-card p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold mb-4">
            Weekly Study Activity
          </h2>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={weeklyData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="hours"
                stroke="#6366f1"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          variants={fadeUp}
          className="rounded-xl border bg-card p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold mb-4">
            Course Time Distribution
          </h2>

          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={mockProgress}
                dataKey="hours"
                nameKey="course"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {mockProgress.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </motion.div>
  );
}