# Sprint 2 Static Analysis Report

**Available after Feb 17, 2026 12:00am**

**Submission:** All file submissions must be through GitHub. Submit only the **URL to the folder** in your repository containing the PDFs.

**Folder URL (after push):**  
`https://github.com/Language-Learning-Web-App/bilingual-language-learning-platform/tree/main/docs`

*Place your SonarQube and Trivy PDF reports in the `docs/` folder and push to main. Submit the URL above.*

---

## 1. Tools Used

| Item | Details |
|------|---------|
| **Programming language(s)** | TypeScript, JavaScript (Next.js 16, React 19) |
| **SonarQube version/edition** | Run locally or in CI; export PDF from SonarQube dashboard (e.g. Community or Developer Edition) |
| **Trivy scan type** | Dependencies (npm audit; Trivy `trivy sbom package-lock.json` available when DB is present) |
| **Where scan was executed** | Local |

---

## 2. Required Metrics

### SonarQube

*Update the table below from your SonarQube PDF after running the scan. Current snapshot from ESLint (Sprint 2 codebase) is provided as reference.*

| Metric | Count / Status |
|--------|----------------|
| Bugs | 4 *(from ESLint: setState-in-effect issues that can cause cascading renders)* |
| Vulnerabilities | 0 |
| Code Smells | 13 *(from ESLint: 8× no-explicit-any, 5× no-unused-vars)* |
| Security Hotspots | 0 |
| **Quality Gate** | Fail *(12 ESLint errors; update from SonarQube PDF)* |

### Trivy

*Dependency scan performed via npm audit (Trivy CLI was installed but vulnerability DB download failed in this environment). See `Trivy-Sprint2-Summary.md` in docs. For a Trivy PDF, run locally: `trivy fs .` and `trivy sbom package-lock.json`.*

| Severity | Count |
|----------|-------|
| CRITICAL | 0 |
| HIGH | 1 |
| MEDIUM | 1 |
| LOW | 1 |

---

## 3. Scope

- **What was scanned:**  
  - `app/` (Next.js App Router pages, layout, sign-in, sign-up, dashboard, courses, Turkish lesson 1, settings, profile, progress, notifications)  
  - `components/` (landing: hero, navbar, features, footer, etc.; UI: shadcn-style components)  
  - `public/` (firebase-config.js)  
  - Config: `eslint.config.mjs`, `next.config.ts`, `tsconfig.json`, `package.json`
- **What was excluded (if anything):**  
  - `.next/`, `out/`, `node_modules/`, `build/`  
  - Ignored by ESLint/Next: `next-env.d.ts`, lockfiles  
  - Large binaries and docs (e.g. video recordings) not scanned for code issues  

---

## 4. Trend (If Applicable)

- **Sprint 2:** First sprint submitting static analysis for this project.  
- **Baseline sprint — no prior comparison.**  
- Next sprint: compare SonarQube and Trivy counts to this baseline.

---

## 5. Reflection (Short)

- **Most problematic area:** React effects that call `setState` synchronously (e.g. in `course-lessons.tsx` and `turkish/lesson-1/page.tsx`), which can trigger cascading renders; and use of `any` in sign-in/sign-up and lesson page (type safety and maintainability).
- **Plan to reduce issues next sprint:** Refactor effects to avoid synchronous setState (e.g. derive state or use layout effects where appropriate); replace `any` with proper types (Firebase/auth and event types); remove or use unused imports and variables.

---

## Required Statement

*This static analysis was generated using automated tools during this sprint.*

---

## Rubric Reference

| Area | Weight |
|------|--------|
| SonarQube execution & report | 30% |
| Trivy execution & report | 30% |
| Clear metrics & scope | 20% |
| Trend & reflection | 20% |
