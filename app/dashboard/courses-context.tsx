"use client";

import {
  createContext, useContext, useState, useEffect, type ReactNode,
} from "react";
import { useUserProfile } from "@/app/context/UserProfileContext";
import {
  enrollCourse,
  dropCourse,
  ActivityEntry,
} from "@/app/lib/userProfileService";
import { auth } from "@/app/lib/firebase-config";

interface CoursesContextValue {
  enrolled: string[];
  activity: ActivityEntry[];
  enroll: (course: string) => Promise<void>;
  drop: (course: string) => Promise<void>;
}

const CoursesContext = createContext<CoursesContextValue | null>(null);

export function CoursesProvider({ children }: { children: ReactNode }) {
  const { profile, refreshProfile } = useUserProfile();

  const enrolled = profile?.enrolled ?? [];
  const activity = profile?.activity ?? [];

  const enroll = async (course: string) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    await enrollCourse(uid, course);
    await refreshProfile();
  };

  const drop = async (course: string) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    await dropCourse(uid, course);
    await refreshProfile();
  };

  return (
    <CoursesContext.Provider value={{ enrolled, activity, enroll, drop }}>
      {children}
    </CoursesContext.Provider>
  );
}

export function useCourses() {
  const ctx = useContext(CoursesContext);
  if (!ctx) throw new Error("useCourses must be used within CoursesProvider");
  return ctx;
}