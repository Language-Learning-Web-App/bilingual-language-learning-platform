# BLLP-AI — Bilingual Language Learning Platform Powered by AI

A modern web application that helps users learn new languages through structured, AI-assisted, interactive lessons. Built with Next.js, Tailwind CSS, and Firebase Authentication, with text-to-speech and conversational practice powered by OpenAI, ElevenLabs, and Microsoft Cognitive Services.

## Features

- **12 language courses** with up to 15 topic-based lessons each: Spanish, French, German, Japanese, Arabic, Turkish, Italian, Portuguese, Serbian, Persian, Hindi, and Russian.
- **CSV-driven lessons** — each lesson is authored as a single `lesson-data.csv` file containing vocabulary, key sentences, dialogue, listening, speaking prompts, and a quiz.
- **AI-powered speaking and listening practice** — text-to-speech voices via ElevenLabs and Microsoft Cognitive Services, and conversational feedback via OpenAI.
- **User authentication** via email/password and Google sign-in (Firebase).
- **Progress tracking** per user, with resume/review state stored locally per lesson.
- **Responsive dashboard** with a mobile-friendly sidebar.
- **Beautiful, accessible UI** built with shadcn/ui components and Framer Motion animations.

## Tech Stack

- **Framework:** Next.js 16 (App Router, Node.js runtime for lesson data API)
- **Styling:** Tailwind CSS 4, shadcn/ui
- **Auth:** Firebase Authentication
- **Language:** TypeScript
- **AI / Speech:** OpenAI, ElevenLabs, Microsoft Cognitive Services Speech SDK
- **Testing:** Vitest, React Testing Library
- **Animations:** Framer Motion

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `app/` — Next.js App Router pages, API routes, and shared UI.
- `app/api/lesson-data/route.ts` — server-side handler that reads `lessons/<language>/lesson-NN-*/lesson-data.csv` and returns typed lesson JSON.
- `app/dashboard/courses/` — course hubs, lesson list, and lesson player UI.
- `lessons/<language>/lesson-NN-<topic>/lesson-data.csv` — per-lesson content data.
- `docs/` — sprint reports and static-analysis summaries (Trivy, SonarQube).

## Quality & Security

- Static analysis runs each sprint via SonarQube (PDF reports under `docs/`).
- Dependency vulnerability scans run each sprint via Trivy (`docs/Trivy-Dependency-Scan-Summary-Sprint-N.md`).

## Deployment

The app is deployed to Vercel. Pushes to `main` trigger a production build. The repo uses **npm** as its package manager — `package-lock.json` is the source of truth, and `pnpm-lock.yaml` should not be added back.
