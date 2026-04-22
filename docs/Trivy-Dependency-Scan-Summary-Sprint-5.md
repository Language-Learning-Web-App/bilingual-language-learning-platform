# Trivy / Dependency Scan Summary - Sprint 5

**Date:** 2026-04-21  
**Project:** BLLPPBAI (Bilingual Language Learning Platform - AI)

---

## 1. Tools Used

- **Programming language(s):** TypeScript, JavaScript (Node.js runtime)
- **SonarQube version/edition:** SonarQube report is submitted separately as a PDF export from the SonarQube dashboard for Sprint 5 (`docs/SonarQube-Sprint5-Report.pdf`)
- **Trivy scan type:** Filesystem vulnerability scan (`trivy fs --scanners vuln`)
- **Trivy version:** 0.69.3
- **Where scan was executed:** Local machine

---

## 2. Required Metrics (Trivy)

| Severity | Count |
|----------|-------|
| CRITICAL | 2 |
| HIGH | 18 |
| MEDIUM | 36 |
| LOW | 4 |

**Total vulnerabilities:** 60

---

## 3. Scope

- **What was scanned:** Project filesystem dependency manifests and lockfiles via `trivy fs` from repository root. Findings were reported against `package-lock.json` and `pnpm-lock.yaml`.
- **What was excluded:** Container image scan and secret/misconfiguration scanners were not included in this run.

---

## 4. Trend (Compared to Previous Sprints)

| Sprint | CRITICAL | HIGH | MEDIUM | LOW | Total |
|--------|----------|------|--------|-----|-------|
| Sprint 3 | 0 | 5 | 2 | 0 | 7 |
| Sprint 4 | 0 | 16 | 34 | 4 | 54 |
| Sprint 5 | 2 | 18 | 36 | 4 | 60 |

- **Change:** Total dependency vulnerabilities increased from 54 to 60. Two new CRITICAL findings appeared this sprint (notably `protobufjs` arbitrary code execution, CVE-2026-41242), and HIGH and MEDIUM counts each rose by 2. LOW count remained unchanged.

---

## 5. Notable Findings

- **CRITICAL — `protobufjs` (CVE-2026-41242):** Arbitrary code execution vulnerability; fixed in 7.5.5 / 8.0.1.
- **HIGH — `next` (GHSA-q4gf-8mx6-v5v3):** Denial of Service in Next.js Server Components; fixed in 15.5.15 / 16.2.3.
- **HIGH — `path-to-regexp` (CVE-2026-4926):** ReDoS via crafted regular expressions; fixed in 8.4.0.
- **HIGH — `picomatch` (CVE-2026-33671) and `minimatch` (CVE-2026-27903/27904):** ReDoS issues in widely used glob utilities, pulled in transitively.
- **MEDIUM — `hono`, `next`:** Multiple advisories around CSRF, cookie handling, and prototype pollution.

---

## 6. Reflection (Short)

The most problematic area continues to be transitive npm dependencies, and this sprint a new CRITICAL appeared in `protobufjs` via an indirect dependency chain. Framework-level packages (`next`, `hono`) and glob utilities (`minimatch`, `picomatch`, `path-to-regexp`) account for most of the HIGH/MEDIUM findings.  
Next sprint, we will prioritize patching the CRITICAL `protobufjs` finding first, then bump `next` and the glob-related dependencies in a focused upgrade batch, rerunning Trivy after each batch to verify reductions and catch regressions. We will also scope in development dependencies on a secondary pass.

---

*This static analysis was generated using automated tools during this sprint.*
