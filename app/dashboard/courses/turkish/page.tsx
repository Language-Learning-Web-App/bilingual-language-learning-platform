"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  PlayCircle,
  Plane,
  BedDouble,
  Coffee,
  UtensilsCrossed,
  ShoppingCart,
  Bus,
  TrainFront,
  Pill,
  Stethoscope,
  GraduationCap,
  Briefcase,
  Landmark,
  Mail,
  ShoppingBag,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

interface Lesson {
  id: number;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bg: string;
}

const lessons: Lesson[] = [
  { id: 1, title: "At the Airport", description: "Check-in, boarding, and baggage claim.", icon: Plane, color: "text-sky-500", bg: "bg-sky-50" },
  { id: 2, title: "At the Hotel", description: "Booking rooms and requesting services.", icon: BedDouble, color: "text-violet-500", bg: "bg-violet-50" },
  { id: 3, title: "At a Café", description: "Ordering drinks and snacks.", icon: Coffee, color: "text-amber-600", bg: "bg-amber-50" },
  { id: 4, title: "At a Restaurant", description: "Ordering food and asking for the bill.", icon: UtensilsCrossed, color: "text-orange-500", bg: "bg-orange-50" },
  { id: 5, title: "At the Grocery Store", description: "Shopping for items and asking prices.", icon: ShoppingCart, color: "text-emerald-500", bg: "bg-emerald-50" },
  { id: 6, title: "At the Bus Stop", description: "Asking for directions.", icon: Bus, color: "text-yellow-500", bg: "bg-yellow-50" },
  { id: 7, title: "At the Train Station", description: "Buying tickets and finding schedules.", icon: TrainFront, color: "text-blue-500", bg: "bg-blue-50" },
  { id: 8, title: "At the Pharmacy", description: "Asking for medication and dosage.", icon: Pill, color: "text-green-500", bg: "bg-green-50" },
  { id: 9, title: "At the Doctor's Office", description: "Describing symptoms and seeing a doctor.", icon: Stethoscope, color: "text-red-500", bg: "bg-red-50" },
  { id: 10, title: "At School", description: "Introducing yourself and academics.", icon: GraduationCap, color: "text-indigo-500", bg: "bg-indigo-50" },
  { id: 11, title: "At Work", description: "Meetings, tasks, and colleagues.", icon: Briefcase, color: "text-slate-600", bg: "bg-slate-100" },
  { id: 12, title: "At the Bank", description: "Transactions, currency, and accounts.", icon: Landmark, color: "text-teal-500", bg: "bg-teal-50" },
  { id: 13, title: "At the Post Office", description: "Sending packages and buying stamps.", icon: Mail, color: "text-rose-500", bg: "bg-rose-50" },
  { id: 14, title: "At the Shopping Mall", description: "Sizes, prices, and returns.", icon: ShoppingBag, color: "text-pink-500", bg: "bg-pink-50" },
  { id: 15, title: "At a Friend's House", description: "Small talk and socializing.", icon: Users, color: "text-cyan-500", bg: "bg-cyan-50" },
];

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function TurkishCoursePage() {
  return (
    <>
      <div className="mb-8">
        <Link
          href="/dashboard/courses"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Courses
        </Link>

        <div className="flex items-center gap-4 mt-2">
          <span className="text-5xl">🇹🇷</span>
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              Turkish
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Beginner &middot; 15 lessons &middot; 0% complete
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lessons.map((lesson) => (
          <motion.div
            key={lesson.id}
            variants={fadeIn}
            initial="hidden"
            animate="show"
            className="group rounded-xl border bg-card p-5 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${lesson.bg} ${lesson.color}`}>
                <lesson.icon className="h-5 w-5" />
              </div>
              <PlayCircle className="h-5 w-5 text-primary" />
            </div>

            <h3 className="mt-3 font-display text-sm font-bold text-foreground">
              {lesson.title}
            </h3>

            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {lesson.description}
            </p>

            <Button
              size="sm"
              className="mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Start Lesson
            </Button>
          </motion.div>
        ))}
      </div>
    </>
  );
}
