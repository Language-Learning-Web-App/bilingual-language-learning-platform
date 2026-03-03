"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export interface ActivityEntry {
  action: "enrolled" | "dropped";
  course: string;
  timestamp: Date;
}

interface CoursesContextValue {
  enrolled: string[];
  activity: ActivityEntry[];
  enroll: (course: string) => void;
  drop: (course: string) => void;
}

const CoursesContext = createContext<CoursesContextValue | null>(null);

export function CoursesProvider({ children }: { children: ReactNode }) {
  const [enrolled, setEnrolled] = useState<string[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);

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
