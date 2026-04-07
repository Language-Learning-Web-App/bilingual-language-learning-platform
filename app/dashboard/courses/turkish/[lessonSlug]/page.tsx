"use client";

import { useParams } from "next/navigation";
import TopicLessonPage from "../../_shared/topic-lesson-page";

export default function TurkishTopicLessonPage() {
  const params = useParams<{ lessonSlug: string }>();
  const lessonSlug = params?.lessonSlug ?? "lesson-1";

  return (
    <TopicLessonPage
      language="tr"
      lessonSlug={lessonSlug}
      backHref="/dashboard/courses/turkish"
      backLabel="Back to Turkish"
      courseTitle="Turkish"
    />
  );
}

