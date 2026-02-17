"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Languages,
  LayoutDashboard,
  BookOpen,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden w-64 border-r bg-muted/40 p-6 lg:flex lg:flex-col">
        {/* Logo */}
        <Link href="/" className="mb-10 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Languages className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">
            BLLP<span className="text-primary">-AI</span>
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-2 text-sm">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2 font-medium text-primary"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>

          <Link
            href="/dashboard/courses"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted"
          >
            <BookOpen className="h-4 w-4" />
            My Courses
          </Link>

          <Link
            href="/dashboard/progress"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted"
          >
            <BarChart3 className="h-4 w-4" />
            Progress
          </Link>

          <Link
            href="#"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </nav>

        <Separator className="my-6" />

        <Button variant="ghost" className="justify-start gap-2 text-muted-foreground">
          <LogOut className="h-4 w-4" />
          Log Out
        </Button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10">
        {/* Top Bar */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Welcome back 👋
          </h1>

          <div className="flex items-center gap-4">
            <Bell className="h-5 w-5 cursor-pointer text-muted-foreground hover:text-foreground" />
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <User className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">Active Courses</p>
            <p className="mt-2 text-3xl font-bold">3</p>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">Hours Learned</p>
            <p className="mt-2 text-3xl font-bold">42</p>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">Current Streak</p>
            <p className="mt-2 text-3xl font-bold">12 days</p>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-10 rounded-xl border bg-card p-6 shadow-sm"
        >
          <h2 className="mb-4 text-lg font-semibold">Recent Activity</h2>

          <div className="space-y-4 text-sm text-muted-foreground">
            <p>✔ Completed Lesson 4 – Spanish Basics</p>
            <p>✔ Practiced Vocabulary – 20 words</p>
            <p>✔ Earned 150 XP</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
