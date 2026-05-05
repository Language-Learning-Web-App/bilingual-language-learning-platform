"use client";

import { useParams } from "next/navigation";
import TopicLessonPage from "../../_shared/topic-lesson-page";

export default function RussianTopicLessonPage() {
  const params = useParams<{ lessonSlug: string }>();
  const lessonSlug = params?.lessonSlug ?? "lesson-1";

  return (
    <TopicLessonPage
      language="ru"
      lessonSlug={lessonSlug}
      backHref="/dashboard/courses/russian"
      backLabel="Back to Russian"
      courseTitle="Russian"
    />
  );
}
