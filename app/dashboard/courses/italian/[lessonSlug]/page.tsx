"use client";

import { useParams } from "next/navigation";
import TopicLessonPage from "../../_shared/topic-lesson-page";

export default function ItalianTopicLessonPage() {
  const params = useParams<{ lessonSlug: string }>();
  const lessonSlug = params?.lessonSlug ?? "lesson-1";

  return (
    <TopicLessonPage
      language="it"
      lessonSlug={lessonSlug}
      backHref="/dashboard/courses/italian"
      backLabel="Back to Italian"
      courseTitle="Italian"
    />
  );
}
