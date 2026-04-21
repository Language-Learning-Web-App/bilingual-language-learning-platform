"use client";

import TopicLessonPage from "../../_shared/topic-lesson-page";

export default function TurkishLesson1Page() {
  return (
    <TopicLessonPage
      language="tr"
      lessonSlug="lesson-1"
      backHref="/dashboard/courses/turkish"
      backLabel="Back to Turkish"
      courseTitle="Turkish"
    />
  );
}
