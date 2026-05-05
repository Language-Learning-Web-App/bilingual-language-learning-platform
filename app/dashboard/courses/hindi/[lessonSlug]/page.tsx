"use client";

import { useParams } from "next/navigation";
import TopicLessonPage from "../../_shared/topic-lesson-page";

export default function HindiTopicLessonPage() {
  const params = useParams<{ lessonSlug: string }>();
  const lessonSlug = params?.lessonSlug ?? "lesson-1";

  return (
    <TopicLessonPage
      language="hi"
      lessonSlug={lessonSlug}
      backHref="/dashboard/courses/hindi"
      backLabel="Back to Hindi"
      courseTitle="Hindi"
    />
  );
}
