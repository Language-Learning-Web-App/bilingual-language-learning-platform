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
}

export default function NotificationsPage() {
  const { activity } = useCourses();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [uid, setUid] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  const READ_KEY = "readNotifications";
  const DELETE_KEY = "deletedNotifications";

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

  // load stored states
  useEffect(() => {
    const savedRead = localStorage.getItem(READ_KEY);
    const savedDeleted = localStorage.getItem(DELETE_KEY);

    if (savedRead) setReadIds(JSON.parse(savedRead));
    if (savedDeleted) setDeletedIds(JSON.parse(savedDeleted));
  }, []);

  // build notifications
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
        };
      })
      .filter((n) => !deletedIds.includes(n.id))
      .sort((a, b) => (a.id < b.id ? 1 : -1));

    setNotifications(built);
  }, [uid, activity, deletedIds]);

  // mark single as read
  const markAsRead = (id: string) => {
    if (readIds.includes(id)) return;

    const updated = [...readIds, id];
    setReadIds(updated);
    localStorage.setItem(READ_KEY, JSON.stringify(updated));
  };

  // mark all as read
  const markAllAsRead = () => {
    setMarkingAll(true);

    const allIds = notifications.map((n) => n.id);
    const updated = Array.from(new Set([...readIds, ...allIds]));

    setTimeout(() => {
      setReadIds(updated);
      localStorage.setItem(READ_KEY, JSON.stringify(updated));
      setMarkingAll(false);
    }, 250);
  };

  // delete one notification
  const deleteNotification = (id: string) => {
    const updated = [...deletedIds, id];
    setDeletedIds(updated);
    localStorage.setItem(DELETE_KEY, JSON.stringify(updated));

    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // delete all
  const deleteAll = () => {
    const allIds = notifications.map((n) => n.id);
    const updated = [...deletedIds, ...allIds];

    setDeletedIds(updated);
    localStorage.setItem(DELETE_KEY, JSON.stringify(updated));
    setNotifications([]);
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

        <div className="flex gap-2">
          <button
            onClick={markAllAsRead}
            disabled={markingAll || notifications.length === 0}
            className={`px-4 py-2 rounded-md transition ${
              markingAll || notifications.length === 0
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-primary text-white hover:bg-primary/80"
            }`}
          >
            {markingAll ? "Updating..." : "Mark all as read"}
          </button>

          <button
            onClick={deleteAll}
            disabled={notifications.length === 0}
            className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition"
          >
            Delete all
          </button>
        </div>
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
            notifications.map((note) => {
              const isRead = readIds.includes(note.id);

              return (
                <motion.div
                  key={note.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`rounded-lg border p-4 shadow-sm flex justify-between items-center transition
                    ${
                      isRead
                        ? "bg-gray-100 text-gray-500"
                        : "bg-card hover:shadow-md cursor-pointer"
                    }`}
                  onClick={() => markAsRead(note.id)}
                >
                  <div>
                    <p className="text-sm">{note.message}</p>
                    <span className="text-xs text-muted-foreground">
                      {note.time}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(note.id);
                    }}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}