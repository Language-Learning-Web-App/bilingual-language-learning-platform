"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { BookOpen, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCourses } from "../courses-context";

interface Course {
  name: string;
  flag: string;
  lessons: number;
  level: string;
}

const allCourses: Course[] = [
  { name: "Spanish", flag: "🇪🇸", lessons: 15, level: "Beginner" },
  { name: "French", flag: "🇫🇷", lessons: 15, level: "Beginner" },
  { name: "German", flag: "🇩🇪", lessons: 15, level: "Beginner" },
  { name: "Japanese", flag: "🇯🇵", lessons: 15, level: "Beginner" },
  { name: "Arabic", flag: "🇸🇦", lessons: 15, level: "Beginner" },
  { name: "Turkish", flag: "🇹🇷", lessons: 15, level: "Beginner" },
  { name: "Italian", flag: "🇮🇹", lessons: 15, level: "Beginner" },
  { name: "Portuguese", flag: "🇵🇹", lessons: 15, level: "Beginner" },
  { name: "Serbian", flag: "🇷🇸", lessons: 15, level: "Beginner" },
  { name: "Mandarin", flag: "🇨🇳", lessons: 15, level: "Beginner" },
  { name: "Hindi", flag: "🇮🇳", lessons: 15, level: "Beginner" },
  { name: "Russian", flag: "🇷🇺", lessons: 15, level: "Beginner" },
];

const courseRoutes: Record<string, string> = {
  Spanish: "/dashboard/courses/spanish",
  French: "/dashboard/courses/french",
  German: "/dashboard/courses/german",
  Japanese: "/dashboard/courses/japanese",
  Arabic: "/dashboard/courses/arabic",
  Turkish: "/dashboard/courses/turkish",
  Italian: "/dashboard/courses/italian",
  Portuguese: "/dashboard/courses/portuguese",
  Serbian: "/dashboard/courses/serbian",
  Mandarin: "/dashboard/courses/mandarin",
  Hindi: "/dashboard/courses/hindi",
  Russian: "/dashboard/courses/russian",
};

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function CoursesPage() {
  const router = useRouter();
  const { enrolled, enroll, drop } = useCourses();

  const [confirmEnroll, setConfirmEnroll] = useState<string | null>(null);
  const [confirmDrop, setConfirmDrop] = useState<string | null>(null);

  const enrolledCourses = allCourses.filter((c) => enrolled.includes(c.name));
  const browseCourses = allCourses.filter((c) => !enrolled.includes(c.name));

  const handleEnroll = (name: string) => {
    enroll(name);
    setConfirmEnroll(null);
  };

  const handleDrop = (name: string) => {
    drop(name);
    setConfirmDrop(null);
  };

  return (
    <>
      <h1 className="font-display text-3xl font-bold tracking-tight mb-8">
        Courses
      </h1>

      {/* Confirm enroll dialog */}
      {confirmEnroll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-lg">
            <h3 className="font-display text-lg font-bold">Enroll in {confirmEnroll}?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              You are about to enroll in the {confirmEnroll} course. Ready to start learning?
            </p>
            <div className="mt-6 flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setConfirmEnroll(null)}>
                Cancel
              </Button>
              <Button onClick={() => handleEnroll(confirmEnroll)}>
                Enroll
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm drop dialog */}
      {confirmDrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-lg">
            <h3 className="font-display text-lg font-bold text-red-600">Drop {confirmDrop}?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Are you sure you want to drop this course? All your activity will be erased.
            </p>
            <div className="mt-6 flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setConfirmDrop(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => handleDrop(confirmDrop)}>
                Drop Course
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Enrolled Courses */}
      {enrolledCourses.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold">Enrolled Courses</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {enrolledCourses.map((course) => (
              <motion.div
                key={course.name}
                variants={fadeIn}
                initial="hidden"
                animate="show"
                className="group relative rounded-xl border bg-card p-5 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="absolute right-3 top-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setConfirmDrop(course.name)}
                        className="text-foreground"
                      >
                        Drop Course
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <span className="text-4xl">{course.flag}</span>
                <h3 className="mt-3 font-display text-base font-bold">
                  {course.name}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {course.lessons} lessons &middot; {course.level}
                </p>
                <Button
                  size="sm"
                  className="mt-4 w-full"
                  onClick={() => {
                    const route = courseRoutes[course.name];
                    if (route) router.push(route);
                  }}
                >
                  Continue
                </Button>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Browse Courses */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">
          {enrolledCourses.length > 0 ? "Browse Courses" : "All Courses"}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {browseCourses.map((course) => (
            <motion.div
              key={course.name}
              variants={fadeIn}
              initial="hidden"
              animate="show"
              className="group rounded-xl border bg-card p-5 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
            >
              <span className="text-4xl">{course.flag}</span>
              <h3 className="mt-3 font-display text-base font-bold">
                {course.name}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {course.lessons} lessons &middot; {course.level}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => setConfirmEnroll(course.name)}
                >
                  <BookOpen className="mr-1.5 h-3.5 w-3.5" />
                  Start Course
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}
