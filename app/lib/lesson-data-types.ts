export interface LessonMetadata {
  title: string;
  description: string;
}

export interface LessonVocabularyItem {
  local: string;
  english: string;
}

export interface LessonKeySentence {
  local: string;
  english: string;
  answerLocal: string;
  answerEnglish: string;
}

export interface LessonDialogueLine {
  speaker: string;
  local: string;
  english: string;
}

export interface LessonListeningOption {
  local: string;
  english: string;
}

export interface LessonListeningQuestion {
  prompt: string;
  promptEnglish: string;
  options: LessonListeningOption[];
  correct: number;
}

export interface LessonSpeakingPrompt {
  ai: string;
  aiEnglish: string;
  expected: string;
  expectedEnglish: string;
}

export interface LessonQuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

export interface LessonContent {
  metadata: LessonMetadata;
  vocabulary: LessonVocabularyItem[];
  keySentences: LessonKeySentence[];
  dialogue: LessonDialogueLine[];
  listening: LessonListeningQuestion[];
  speakingPrompts: LessonSpeakingPrompt[];
  quizQuestions: LessonQuizQuestion[];
}
