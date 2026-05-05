import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { readFile, readdir } from "fs/promises";
import type {
  LessonContent,
  LessonDialogueLine,
  LessonKeySentence,
  LessonListeningQuestion,
  LessonMetadata,
  LessonQuizQuestion,
  LessonSpeakingPrompt,
  LessonVocabularyItem,
} from "@/app/lib/lesson-data-types";

export const runtime = "nodejs";

type CsvRow = Record<string, string>;

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      const next = line[i + 1];
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      out.push(current);
      current = "";
      continue;
    }
    current += ch;
  }

  out.push(current);
  return out;
}

function parseCsv(text: string): CsvRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]);
  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i += 1) {
    const values = parseCsvLine(lines[i]);
    const row: CsvRow = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] ?? "";
    });
    rows.push(row);
  }

  return rows;
}

type LanguageFolder =
  | "turkish"
  | "persian"
  | "serbian"
  | "russian"
  | "spanish"
  | "french"
  | "german"
  | "japanese";

function languageKey(code: string): LanguageFolder | null {
  if (code === "tr") return "turkish";
  if (code === "fa") return "persian";
  if (code === "sr") return "serbian";
  if (code === "ru") return "russian";
  if (code === "es") return "spanish";
  if (code === "fr") return "french";
  if (code === "de") return "german";
  if (code === "ja") return "japanese";
  return null;
}

const MAX_LESSON_BY_LANGUAGE: Record<LanguageFolder, number> = {
  turkish: 15,
  persian: 15,
  serbian: 16,
  russian: 16,
  spanish: 15,
  french: 15,
  german: 15,
  japanese: 15,
};

function toLessonContent(rows: CsvRow[]): LessonContent {
  const metadataRow = rows.find((r) => r.section === "metadata");
  if (!metadataRow) {
    throw new Error("CSV is missing metadata row");
  }

  const metadata = JSON.parse(metadataRow.payload_json) as LessonMetadata;
  const vocabulary: LessonVocabularyItem[] = [];
  const keySentences: LessonKeySentence[] = [];
  const dialogue: LessonDialogueLine[] = [];
  const listening: LessonListeningQuestion[] = [];
  const speakingPrompts: LessonSpeakingPrompt[] = [];
  const quizQuestions: LessonQuizQuestion[] = [];

  rows.forEach((row) => {
    if (row.section === "vocabulary") {
      vocabulary.push(JSON.parse(row.payload_json) as LessonVocabularyItem);
    } else if (row.section === "keySentence") {
      keySentences.push(JSON.parse(row.payload_json) as LessonKeySentence);
    } else if (row.section === "dialogue") {
      dialogue.push(JSON.parse(row.payload_json) as LessonDialogueLine);
    } else if (row.section === "listening") {
      listening.push(JSON.parse(row.payload_json) as LessonListeningQuestion);
    } else if (row.section === "speakingPrompt") {
      speakingPrompts.push(JSON.parse(row.payload_json) as LessonSpeakingPrompt);
    } else if (row.section === "quizQuestion") {
      quizQuestions.push(JSON.parse(row.payload_json) as LessonQuizQuestion);
    }
  });

  return {
    metadata,
    vocabulary,
    keySentences,
    dialogue,
    listening,
    speakingPrompts,
    quizQuestions,
  };
}

export async function GET(req: NextRequest) {
  const lessonParam = req.nextUrl.searchParams.get("lesson");
  const languageParam = req.nextUrl.searchParams.get("language");

  const lessonNumber = Number.parseInt(lessonParam ?? "", 10);
  const language = languageKey(languageParam ?? "");

  if (
    !language ||
    Number.isNaN(lessonNumber) ||
    lessonNumber < 1 ||
    lessonNumber > MAX_LESSON_BY_LANGUAGE[language]
  ) {
    return NextResponse.json(
      { error: "Invalid language or lesson" },
      { status: 400 }
    );
  }

  try {
    const baseDir = path.join(process.cwd(), "lessons", language);
    const lessonPrefix = `lesson-${String(lessonNumber).padStart(2, "0")}-`;
    const dirNames = await readdir(baseDir);
    const matched = dirNames.find((name) => name.startsWith(lessonPrefix));
    if (!matched) {
      return NextResponse.json({ error: "Lesson folder not found" }, { status: 404 });
    }

    const filePath = path.join(baseDir, matched, "lesson-data.csv");
    const raw = await readFile(filePath, "utf-8");
    const rows = parseCsv(raw);
    const content = toLessonContent(rows);
    return NextResponse.json(content);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load lesson CSV data", detail: String(error) },
      { status: 500 }
    );
  }
}
