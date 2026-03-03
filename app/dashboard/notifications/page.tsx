"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// Mock notifications for UI demonstration
const mockNotifications = [
  { id: 1, message: "You enrolled in English 101", time: "2h ago", read: false },
  { id: 2, message: "Your Spanish Basics quiz is available", time: "5h ago", read: false },
  { id: 3, message: "French Advanced lesson 3 completed", time: "1d ago", read: false },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);

  // Example: mark all as read after 3 seconds (for UI demo)
  useEffect(() => {
    const timer = setTimeout(() => {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className="max-w-4xl mx-auto space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground mt-2">
          Stay updated with your recent activities.
        </p>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground">No notifications yet.</p>
        ) : (
          notifications.map((note) => (
            <motion.div
              key={note.id}
              variants={fadeUp}
              className={`rounded-lg border bg-card p-4 shadow-sm flex justify-between items-center ${
                note.read ? "opacity-60" : ""
              }`}
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