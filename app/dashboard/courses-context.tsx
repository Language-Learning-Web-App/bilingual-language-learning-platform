"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/lib/firebase-config";

export interface ActivityEntry {
  action: "enrolled" | "dropped";
  course: string;
  timestamp: Date;
}

interface StoredActivity {
  action: "enrolled" | "dropped";
  course: string;
  timestamp: string;
}

interface CoursesContextValue {
  enrolled: string[];
  activity: ActivityEntry[];
  enroll: (course: string) => void;
  drop: (course: string) => void;
}

const CoursesContext = createContext<CoursesContextValue | null>(null);

function loadEnrolled(uid: string): string[] {
  try {
    const raw = localStorage.getItem(`bllp-enrolled-${uid}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadActivity(uid: string): ActivityEntry[] {
  try {
    const raw = localStorage.getItem(`bllp-activity-${uid}`);
    if (!raw) return [];
    const parsed: StoredActivity[] = JSON.parse(raw);
    return parsed.map((e) => ({ ...e, timestamp: new Date(e.timestamp) }));
  } catch {
    return [];
  }
}

export function CoursesProvider({ children }: { children: ReactNode }) {
  const [uid, setUid] = useState<string | null>(null);
  const [enrolled, setEnrolled] = useState<string[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
        setEnrolled(loadEnrolled(user.uid));
        setActivity(loadActivity(user.uid));
      } else {
        setUid(null);
        setEnrolled([]);
        setActivity([]);
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!uid) return;
    localStorage.setItem(`bllp-enrolled-${uid}`, JSON.stringify(enrolled));
  }, [enrolled, uid]);

  useEffect(() => {
    if (!uid) return;
    localStorage.setItem(`bllp-activity-${uid}`, JSON.stringify(activity));
  }, [activity, uid]);

  const enroll = (course: string) => {
    setEnrolled((prev) => (prev.includes(course) ? prev : [...prev, course]));
    setActivity((prev) => [
      { action: "enrolled", course, timestamp: new Date() },
      ...prev,
    ]);
  };

  const drop = (course: string) => {
    setEnrolled((prev) => prev.filter((c) => c !== course));
    setActivity((prev) => [
      { action: "dropped", course, timestamp: new Date() },
      ...prev,
    ]);
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
