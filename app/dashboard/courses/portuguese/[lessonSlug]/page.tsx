"use client";

import { useParams } from "next/navigation";
import TopicLessonPage from "../../_shared/topic-lesson-page";

export default function PortugueseTopicLessonPage() {
  const params = useParams<{ lessonSlug: string }>();
  const lessonSlug = params?.lessonSlug ?? "lesson-1";

  return (
    <TopicLessonPage
      language="pt"
      lessonSlug={lessonSlug}
      backHref="/dashboard/courses/portuguese"
      backLabel="Back to Portuguese"
      courseTitle="Portuguese"
    />
  );
}
