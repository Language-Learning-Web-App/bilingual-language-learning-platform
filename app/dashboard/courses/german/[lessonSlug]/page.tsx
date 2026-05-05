"use client";

import { useParams } from "next/navigation";
import TopicLessonPage from "../../_shared/topic-lesson-page";

export default function GermanTopicLessonPage() {
  const params = useParams<{ lessonSlug: string }>();
  const lessonSlug = params?.lessonSlug ?? "lesson-1";

  return (
    <TopicLessonPage
      language="de"
      lessonSlug={lessonSlug}
      backHref="/dashboard/courses/german"
      backLabel="Back to German"
      courseTitle="German"
    />
  );
}
