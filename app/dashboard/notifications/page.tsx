"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { auth } from "@/app/lib/firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import { useCourses } from "@/app/dashboard/courses-context"; // connect to courses context

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export interface Notification {
  id: number;
  message: string;
  time: string;
  read: boolean;
}

export default function NotificationsPage() {
  const { activity } = useCourses(); // grab user activity
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [uid, setUid] = useState<string | null>(null);

  // Track Firebase user
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) setUid(user.uid);
      else {
        setUid(null);
        setNotifications([]);
      }
    });
    return unsub;
  }, []);

  // Load notifications from localStorage
  useEffect(() => {
    if (!uid) return;
    const saved = localStorage.getItem(`notifications-${uid}`);
    if (saved) setNotifications(JSON.parse(saved));
  }, [uid]);

  // Merge activity entries into notifications
  const mergedNotifications: Notification[] = [
    // Map recent activity to notification objects
    ...activity.map((entry, idx) => ({
      id: entry.timestamp.getTime() + idx, // unique id
      message:
        entry.action === "enrolled"
          ? `Enrolled in ${entry.course}`
          : `Dropped ${entry.course}`,
      time: entry.timestamp.toLocaleDateString(),
      read: false,
    })),
    // Existing notifications
    ...notifications,
  ].sort((a, b) => b.id - a.id); // newest first

  // Save notifications to localStorage
  useEffect(() => {
    if (!uid) return;
    localStorage.setItem(`notifications-${uid}`, JSON.stringify(notifications));
  }, [notifications, uid]);

  const markAsRead = (id: number) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const markAllAsRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-2">
            Stay updated with your recent activities.
          </p>
        </div>
        <button
          onClick={markAllAsRead}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition"
        >
          Mark all as read
        </button>
      </div>

      {/* Notifications / Activity List */}
      <div className="space-y-4">
        {mergedNotifications.length === 0 ? (
          <p className="text-sm text-muted-foreground">No notifications yet.</p>
        ) : (
          mergedNotifications.map((note) => (
            <motion.div
              key={note.id}
              variants={fadeUp}
              className={`rounded-lg border bg-card p-4 shadow-sm flex justify-between items-center cursor-pointer transition ${
                note.read ? "opacity-60" : "opacity-100 hover:shadow-md"
              }`}
              onClick={() => markAsRead(note.id)}
            >
              <p className="text-sm">{note.message}</p>
              <span className="text-xs text-muted-foreground">{note.time}</span>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}