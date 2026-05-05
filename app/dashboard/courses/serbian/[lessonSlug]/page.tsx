"use client";

import { useParams } from "next/navigation";
import TopicLessonPage from "../../_shared/topic-lesson-page";

export default function SerbianTopicLessonPage() {
  const params = useParams<{ lessonSlug: string }>();
  const lessonSlug = params?.lessonSlug ?? "lesson-1";

  return (
    <TopicLessonPage
      language="sr"
      lessonSlug={lessonSlug}
      backHref="/dashboard/courses/serbian"
      backLabel="Back to Serbian"
      courseTitle="Serbian"
    />
  );
}
