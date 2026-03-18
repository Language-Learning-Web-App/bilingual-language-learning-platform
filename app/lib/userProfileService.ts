import{
    doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove
} from "firebase/firestore";
import { db } from "./firebase-config";

export interface ActivityEntry {
    action: "enrolled" | "dropped";
    course: string;
    timestamp: string;
}

export interface LessonProgress {
    lessonId: number;
    sectionsComplete: number;
}

export interface CourseProgress {
    courseName: string;
    lessons: LessonProgress[];
}

export interface UserProfile {
    uid: string;
    email: string;
    name: string;
    bio: string;
    nativeLanguage: string;
    targetLanguage: string;
    preferences: {
        theme: "light" | "dark";
        difficulty: "beginner" | "intermediate" | "advanced";
    };
    enrolled: string[];
    activity: ActivityEntry[];
    courseProgress: CourseProgress[];
    createdAt: string;
    lastLoginAt: string;
}

const defaultProfile = (uid: string, email: string): UserProfile => ({
    uid,
    email,
    name: email.split("@")[0],
    bio: "",
    nativeLanguage: "",
    targetLanguage: "",
    preferences: {
        theme: "light",
        difficulty: "beginner",
    },
    enrolled: [],
    activity: [],
    courseProgress: [],
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
});

export async function createUserProfile(uid: string, email: string): Promise<void>{
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
        await setDoc(ref, defaultProfile(uid, email));
    }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    await updateDoc(doc(db, "users", uid), {
        ...updates,
        lastLoginAt: new Date().toISOString(),
    });
}

export async function enrollCourse(uid: string, course: string): Promise<void> {
  const entry: ActivityEntry = {
    action: "enrolled",
    course,
    timestamp: new Date().toISOString(),
  };
  await updateDoc(doc(db, "users", uid), {
    enrolled: arrayUnion(course),
    activity: arrayUnion(entry),
  });
}

export async function dropCourse(uid: string, course: string): Promise<void> {
  const profile = await getUserProfile(uid);
  if (!profile) return;
  const entry: ActivityEntry = {
    action: "dropped",
    course,
    timestamp: new Date().toISOString(),
  };
  // Remove enrolled, log activity, clear lesson progress for that course
  await updateDoc(doc(db, "users", uid), {
    enrolled: arrayRemove(course),
    activity: arrayUnion(entry),
    courseProgress: profile.courseProgress.filter(
      (c) => c.courseName !== course
    ),
  });
}

// Lesson progress
export async function saveLessonProgress(
  uid: string,
  courseName: string,
  lessonId: number,
  sectionsComplete: number
): Promise<void> {
  const profile = await getUserProfile(uid);
  if (!profile) return;

  const existing = profile.courseProgress.find(
    (c) => c.courseName === courseName
  );

  let updatedCourseProgress: CourseProgress[];

  if (existing) {
    const lessonExists = existing.lessons.find((l) => l.lessonId === lessonId);
    updatedCourseProgress = profile.courseProgress.map((c) => {
      if (c.courseName !== courseName) return c;
      return {
        ...c,
        lessons: lessonExists
          ? c.lessons.map((l) =>
              l.lessonId === lessonId ? { ...l, sectionsComplete } : l
            )
          : [...c.lessons, { lessonId, sectionsComplete }],
      };
    });
  } else {
    updatedCourseProgress = [
      ...profile.courseProgress,
      { courseName, lessons: [{ lessonId, sectionsComplete }] },
    ];
  }

  await updateDoc(doc(db, "users", uid), {
    courseProgress: updatedCourseProgress,
  });
}

export async function resetLessonProgress(
  uid: string,
  courseName: string,
  lessonId: number
): Promise<void> {
  const profile = await getUserProfile(uid);
  if (!profile) return;

  const updatedCourseProgress = profile.courseProgress.map((c) => {
    if (c.courseName !== courseName) return c;
    return {
      ...c,
      lessons: c.lessons.filter((l) => l.lessonId !== lessonId),
    };
  });

  await updateDoc(doc(db, "users", uid), {
    courseProgress: updatedCourseProgress,
  });
}