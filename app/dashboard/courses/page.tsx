"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const courses = [
  { title: "Spanish Basics", progress: "80%" },
  { title: "French Intermediate", progress: "50%" },
  { title: "Japanese for Beginners", progress: "20%" },
];

export default function MyCoursesPage() {
  return (
    <div className="p-6 lg:p-10">
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <h1 className="font-display text-3xl font-bold tracking-tight mb-6">
          My Courses
        </h1>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course.title}
              className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-5 w-5 text-primary" />
                <h2 className="font-medium text-lg">{course.title}</h2>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: course.progress }}
                />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Progress: {course.progress}
              </p>
              <Link
                href="#"
                className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
              >
                Continue Course
              </Link>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
