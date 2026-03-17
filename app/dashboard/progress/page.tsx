"use client";

import { useEffect, useState } from "react";
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

// Default mock data if localStorage is empty
const defaultData = {
  streak: 5,
  courses: [
    { name: "English 101", hours: 12, completedLessons: 6, totalLessons: 10 },
    { name: "Spanish Basics", hours: 5, completedLessons: 2, totalLessons: 8 },
    { name: "French Advanced", hours: 8, completedLessons: 8, totalLessons: 8 },
  ],
  weeklyActivity: [
    { day: "Mon", hours: 1 },
    { day: "Tue", hours: 2 },
    { day: "Wed", hours: 1.5 },
    { day: "Thu", hours: 3 },
    { day: "Fri", hours: 2.5 },
    { day: "Sat", hours: 4 },
    { day: "Sun", hours: 2 },
  ],
};

// Colors for pie chart
const COLORS = ["#6366f1", "#22c55e", "#f59e0b"];

export default function ProgressPage() {
  const [userData, setUserData] = useState(defaultData);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("userProgress");
    if (saved) setUserData(JSON.parse(saved));
  }, []);

  // Save to localStorage whenever userData changes
  useEffect(() => {
    localStorage.setItem("userProgress", JSON.stringify(userData));
  }, [userData]);

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto space-y-10"
    >
      {/* Header with streak */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Progress</h1>
          <p className="text-muted-foreground mt-2">
            Track your learning progress for each course.
          </p>
        </div>

        {/* Streak Counter */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold px-4 py-2 rounded-full shadow-md flex items-center space-x-2">
          <span>🔥</span>
          <span>{userData.streak}-Day Streak</span>
        </div>
      </div>

      {/* Progress Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {userData.courses.map((course, i) => {
          const progressPercent =
            (course.completedLessons / course.totalLessons) * 100;

          return (
            <motion.div
              key={i}
              variants={fadeUp}
              className="rounded-xl border bg-card p-6 shadow-sm space-y-4"
            >
              <p className="text-sm text-muted-foreground font-medium">
                {course.name}
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
                    strokeDashoffset={188} // start at 0
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      from={188}
                      to={188 - (progressPercent / 100) * 188}
                      dur="1s"
                      fill="freeze"
                    />
                  </circle>
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
          <h2 className="text-lg font-semibold mb-4">Weekly Study Activity</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={userData.weeklyActivity}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="hours"
                stroke="#6366f1"
                strokeWidth={3}
                animationDuration={1000}
                animationEasing="ease-in-out"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          variants={fadeUp}
          className="rounded-xl border bg-card p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold mb-4">Course Time Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={userData.courses}
                dataKey="hours"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
                isAnimationActive={true}
                animationDuration={1000}
              >
                {userData.courses.map((_, index) => (
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