# Trivy / Dependency Scan Summary - Sprint 6

**Date:** 2026-05-06  
**Project:** BLLPPBAI (Bilingual Language Learning Platform - AI)

---

## 1. Tools Used

- **Programming language(s):** TypeScript, JavaScript (Node.js runtime)
- **SonarQube version/edition:** SonarQube report is submitted separately as a PDF export from your SonarQube dashboard for Sprint 6 (when available under `docs/`).
- **Trivy scan type:** Filesystem vulnerability scan (`trivy fs --scanners vuln`)
- **Trivy version:** 0.69.3
- **Where scan was executed:** Local machine

---

## 2. Required Metrics (Trivy)

| Severity | Count |
|----------|-------|
| CRITICAL | 1 |
| HIGH | 9 |
| MEDIUM | 21 |
| LOW | 2 |

**Total vulnerabilities:** 33

---

## 3. Scope

- **What was scanned:** Project filesystem dependency manifests and lockfiles via `trivy fs` from repository root. Findings were reported primarily against `package-lock.json` (npm).
- **What was excluded:** Container image scan and secret/misconfiguration scanners were not included in this run.

---

## 4. Trend (Compared to Previous Sprints)

| Sprint | CRITICAL | HIGH | MEDIUM | LOW | Total |
|--------|----------|------|--------|-----|-------|
| Sprint 3 | 0 | 5 | 2 | 0 | 7 |
| Sprint 4 | 0 | 16 | 34 | 4 | 54 |
| Sprint 5 | 2 | 18 | 36 | 4 | 60 |
| Sprint 6 | 1 | 9 | 21 | 2 | 33 |

- **Change:** Total reported dependency vulnerabilities **decreased** from 60 (Sprint 5) to 33. CRITICAL dropped from 2 to 1; HIGH, MEDIUM, and LOW counts all fell. Part of the drop reflects **dependency and lockfile cleanup on `main`** (single npm lockfile, updated packages); part reflects **changes in the vulnerability database and how issues are deduplicated** between runs. The remaining **CRITICAL** finding still requires a targeted upgrade (see below).

---

## 5. Reflection (Short)

Standout findings in this run include **CRITICAL `protobufjs` (CVE-2026-41242)** (arbitrary code execution), **HIGH `next`** (Server Components DoS, GHSA-q4gf-8mx6-v5v3), **HIGH `hono` / `@hono/node-server`** (auth / static path issues), and **HIGH ReDoS-class issues** in **`path-to-regexp`**, **`picomatch`**, and **`minimatch`** (often transitive).

The most problematic area remains **transitive npm supply-chain risk**. Next sprint we will **patch the `protobufjs` chain first**, then run a **controlled upgrade batch** for `next` and glob-related dependencies, rerunning `trivy fs` after each batch to confirm counts and avoid regressions. We will also keep **SonarQube and Trivy** runs in the same sprint window so submission metrics stay comparable.

---

*This static analysis was generated using automated tools during this sprint.*
