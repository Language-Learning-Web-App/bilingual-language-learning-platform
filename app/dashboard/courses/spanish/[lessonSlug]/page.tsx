"use client";

import { useParams } from "next/navigation";
import TopicLessonPage from "../../_shared/topic-lesson-page";

export default function SpanishTopicLessonPage() {
  const params = useParams<{ lessonSlug: string }>();
  const lessonSlug = params?.lessonSlug ?? "lesson-1";

  return (
    <TopicLessonPage
      language="es"
      lessonSlug={lessonSlug}
      backHref="/dashboard/courses/spanish"
      backLabel="Back to Spanish"
      courseTitle="Spanish"
    />
  );
}
