"use client";

import { useParams } from "next/navigation";
import TopicLessonPage from "../../_shared/topic-lesson-page";

export default function JapaneseTopicLessonPage() {
  const params = useParams<{ lessonSlug: string }>();
  const lessonSlug = params?.lessonSlug ?? "lesson-1";

  return (
    <TopicLessonPage
      language="ja"
      lessonSlug={lessonSlug}
      backHref="/dashboard/courses/japanese"
      backLabel="Back to Japanese"
      courseTitle="Japanese"
    />
  );
}
