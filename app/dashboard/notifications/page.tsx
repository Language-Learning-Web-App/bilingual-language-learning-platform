"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "@/app/lib/firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import { useCourses } from "@/app/dashboard/courses-context";

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
  const { activity } = useCourses();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [uid, setUid] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

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

  // Load notifications and merge activity once
  useEffect(() => {
    if (!uid) return;

    // Load saved notifications
    const saved = localStorage.getItem(`notifications-${uid}`);
    const savedNotifications: Notification[] = saved ? JSON.parse(saved) : [];

    // Map activity to notifications
    const activityNotifications: Notification[] = activity.map((entry, idx) => ({
      id: entry.timestamp.getTime() + idx,
      message:
        entry.action === "enrolled"
          ? `Enrolled in ${entry.course}`
          : `Dropped ${entry.course}`,
      time: entry.timestamp.toLocaleDateString(),
      read: false,
    }));

    // Merge and sort by newest
    const merged = [...activityNotifications, ...savedNotifications].sort((a, b) => b.id - a.id);

    setNotifications(merged);
  }, [uid, activity]);

  // Save notifications whenever they change
  useEffect(() => {
    if (!uid) return;
    localStorage.setItem(`notifications-${uid}`, JSON.stringify(notifications));
  }, [notifications, uid]);

  const markAsRead = (id: number) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

  const markAllAsRead = () => {
    setMarkingAll(true);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setMarkingAll(false);
  };

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
          disabled={markingAll}
          className={`px-4 py-2 rounded-md transition ${
            markingAll
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-primary text-white hover:bg-primary/80"
          }`}
        >
          {markingAll ? "Marking..." : "Mark all as read"}
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        <AnimatePresence>
          {notifications.length === 0 ? (
            <motion.p
              key="empty"
              className="text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              No notifications yet.
            </motion.p>
          ) : (
            notifications.map((note) => (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
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
        </AnimatePresence>
      </div>
    </motion.div>
  );
}