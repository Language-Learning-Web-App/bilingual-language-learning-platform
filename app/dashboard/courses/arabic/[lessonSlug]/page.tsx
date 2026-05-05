"use client";

import { useParams } from "next/navigation";
import TopicLessonPage from "../../_shared/topic-lesson-page";

export default function ArabicTopicLessonPage() {
  const params = useParams<{ lessonSlug: string }>();
  const lessonSlug = params?.lessonSlug ?? "lesson-1";

  return (
    <TopicLessonPage
      language="ar"
      lessonSlug={lessonSlug}
      backHref="/dashboard/courses/arabic"
      backLabel="Back to Arabic"
      courseTitle="Arabic"
    />
  );
}
