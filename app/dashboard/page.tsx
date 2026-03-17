"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCourses } from "./courses-context";
import { signOut } from "firebase/auth";
import { auth } from "@/app/lib/firebase-config";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function DashboardPage() {
  const router = useRouter();

  // ✅ CONNECTED TO CONTEXT
  const { enrolled, activity } = useCourses();

  const formatTime = (date: Date): string => {
    return date.toLocaleDateString();
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/sign-in");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="bg-background">
      {/* Main Content */}
      <main className="p-8">
        <h1 className="font-display text-3xl font-bold tracking-tight mb-8">
          Welcome back 👋
        </h1>

        {/* Stats Grid */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">Active Courses</p>
            <p className="mt-2 text-3xl font-bold">
              {enrolled.length}
            </p>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">Hours Learned</p>
            <p className="mt-2 text-3xl font-bold">0</p>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">Current Streak</p>
            <p className="mt-2 text-3xl font-bold">0 days</p>
          </div>
        </motion.div>

      </main>
    </div>
  );
}