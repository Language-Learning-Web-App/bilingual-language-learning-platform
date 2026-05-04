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
  id: string;
  message: string;
  time: string;
  read: boolean;
}

export default function NotificationsPage() {
  const { activity } = useCourses();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [uid, setUid] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  const STORAGE_KEY = "hiddenNotifications";

  // auth
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

  // load hidden ids
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setHiddenIds(JSON.parse(saved));
  }, []);

  // build notifications (STABLE IDS NOW)
  useEffect(() => {
    if (!uid) return;

    const built: Notification[] = activity
      .map((entry) => {
        const id = `${entry.course}-${entry.action}-${entry.timestamp}`;

        return {
          id,
          message:
            entry.action === "enrolled"
              ? `Enrolled in ${entry.course}`
              : `Dropped ${entry.course}`,
          time: new Date(entry.timestamp).toLocaleDateString(),
          read: false,
        };
      })
      .filter((n) => !hiddenIds.includes(n.id))
      .sort((a, b) => (a.id < b.id ? 1 : -1));

    setNotifications(built);
  }, [uid, activity, hiddenIds]);

  // mark single
  const markAsRead = (id: string) => {
    const updated = [...hiddenIds, id];

    setHiddenIds(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // mark all
  const markAllAsRead = () => {
    setMarkingAll(true);

    const allIds = notifications.map((n) => n.id);
    const updated = [...hiddenIds, ...allIds];

    setTimeout(() => {
      setHiddenIds(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setNotifications([]);
      setMarkingAll(false);
    }, 250);
  };

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Notifications
          </h1>
          <p className="text-muted-foreground mt-2">
            Stay updated with your recent activities.
          </p>
        </div>

        <button
          onClick={markAllAsRead}
          disabled={markingAll || notifications.length === 0}
          className={`px-4 py-2 rounded-md transition ${
            markingAll || notifications.length === 0
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-primary text-white hover:bg-primary/80"
          }`}
        >
          {markingAll ? "Clearing..." : "Mark all as read"}
        </button>
      </div>

      {/* LIST */}
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
                className="rounded-lg border bg-card p-4 shadow-sm flex justify-between items-center cursor-pointer hover:shadow-md transition"
                onClick={() => markAsRead(note.id)}
              >
                <p className="text-sm">{note.message}</p>
                <span className="text-xs text-muted-foreground">
                  {note.time}
                </span>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}