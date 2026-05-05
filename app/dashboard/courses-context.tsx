"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/lib/firebase-config";
import {
  enrollCourse as firestoreEnroll,
  dropCourse as firestoreDrop,
} from "@/app/lib/userProfileService";
import { useUserProfile } from "@/app/context/UserProfileContext";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ActivityEntry {
  action: "enrolled" | "dropped";
  course: string;
  timestamp: Date;
}

export interface Notification {
  id: number;
  message: string;
  time: string;
  read: boolean;
}

interface CoursesContextValue {
  enrolled: string[];
  activity: ActivityEntry[];
  enroll: (course: string) => void;
  drop: (course: string) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const CoursesContext = createContext<CoursesContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CoursesProvider({ children }: { children: ReactNode }) {
  const { profile, refreshProfile } = useUserProfile();
  const [uid, setUid] = useState<string | null>(null);

  // Track the current Firebase Auth uid
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUid(user ? user.uid : null);
    });
    return unsub;
  }, []);

  // Derived from Firestore profile — single source of truth
  const enrolled: string[] = profile?.enrolled ?? [];

  const activity: ActivityEntry[] =
    profile?.activity.map((a) => ({
      ...a,
      timestamp: new Date(a.timestamp),
    })) ?? [];

  const enroll = async (course: string) => {
    if (!uid) return;
    await firestoreEnroll(uid, course);
    await refreshProfile();
  };

  const drop = async (course: string) => {
    if (!uid) return;
    await firestoreDrop(uid, course);
    await refreshProfile();
  };

  return (
    <CoursesContext.Provider value={{ enrolled, activity, enroll, drop }}>
      {children}
    </CoursesContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCourses() {
  const ctx = useContext(CoursesContext);
  if (!ctx) throw new Error("useCourses must be used within CoursesProvider");
  return ctx;
}