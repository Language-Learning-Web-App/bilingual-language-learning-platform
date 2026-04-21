"use client";

import { useParams } from "next/navigation";
import TopicLessonPage from "../../_shared/topic-lesson-page";

export default function PersianTopicLessonPage() {
  const params = useParams<{ lessonSlug: string }>();
  const lessonSlug = params?.lessonSlug ?? "lesson-1";

  return (
    <TopicLessonPage
      language="fa"
      lessonSlug={lessonSlug}
      backHref="/dashboard/courses/persian"
      backLabel="Back to Persian"
      courseTitle="Persian"
    />
  );
}

