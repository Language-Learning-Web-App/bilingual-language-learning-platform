"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { auth } from "@/app/lib/firebase-config";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

export default function ProfilePage() {
  const user = auth.currentUser;

  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    name: user?.displayName || "User",
    email: user?.email || "",
    bio: "Passionate learner building modern web applications.",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  }

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage your personal information.
        </p>
      </div>

      {/* Profile Card */}
      <div className="rounded-2xl border bg-card p-8 shadow-sm space-y-8">
        {/* Avatar Section */}
        <div className="flex items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
            {profile.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <p className="text-lg font-semibold">{profile.name}</p>
            <p className="text-sm text-muted-foreground">
              {profile.email}
            </p>
          </div>
        </div>

        {/* Editable Fields */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              Full Name
            </label>
            <input
              name="name"
              value={profile.name}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full rounded-lg border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              Email
            </label>
            <input
              name="email"
              value={profile.email}
              disabled
              className="w-full rounded-lg border bg-background px-4 py-2 text-sm opacity-60"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">
            Bio
          </label>
          <textarea
            name="bio"
            rows={3}
            value={profile.bio}
            onChange={handleChange}
            disabled={!isEditing}
            className="w-full rounded-lg border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
              >
                Save Changes
              </button>

              <button
                onClick={() => setIsEditing(false)}
                className="rounded-lg border px-5 py-2 text-sm font-medium hover:bg-muted transition"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}