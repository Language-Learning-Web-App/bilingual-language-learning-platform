"use client";

import TopicLessonPage from "../../_shared/topic-lesson-page";

export default function PersianLesson1Page() {
  return (
    <TopicLessonPage
      language="fa"
      lessonSlug="lesson-1"
      backHref="/dashboard/courses/persian"
      backLabel="Back to Persian"
      courseTitle="Persian"
    />
  );
}
