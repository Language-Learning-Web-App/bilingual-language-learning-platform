"use client";

import { useParams } from "next/navigation";
import TopicLessonPage from "../../_shared/topic-lesson-page";

export default function FrenchTopicLessonPage() {
  const params = useParams<{ lessonSlug: string }>();
  const lessonSlug = params?.lessonSlug ?? "lesson-1";

  return (
    <TopicLessonPage
      language="fr"
      lessonSlug={lessonSlug}
      backHref="/dashboard/courses/french"
      backLabel="Back to French"
      courseTitle="French"
    />
  );
}
