# Trivy / Dependency Scan Summary - Sprint 4

**Date:** 2026-04-07  
**Project:** BLLPPBAI (Bilingual Language Learning Platform - AI)

---

## 1. Tools Used

- **Programming language(s):** TypeScript, JavaScript (Node.js runtime)
- **SonarQube version/edition:** SonarQube report is submitted separately as a PDF export from your SonarQube dashboard for Sprint 4
- **Trivy scan type:** Filesystem vulnerability scan (`trivy fs --scanners vuln`)
- **Where scan was executed:** Local machine

---

## 2. Required Metrics (Trivy)

| Severity | Count |
|----------|-------|
| CRITICAL | 0 |
| HIGH | 16 |
| MEDIUM | 34 |
| LOW | 4 |

**Total vulnerabilities:** 54

---

## 3. Scope

- **What was scanned:** Project filesystem dependency manifests and lockfiles via `trivy fs` from repository root.
- **What was excluded:** Trivy default output suppressed development/testing dependencies in this run; container image scan and secret/misconfiguration scanners were not included.

---

## 4. Trend (Compared to Sprint 3)

| Sprint | CRITICAL | HIGH | MEDIUM | LOW | Total |
|--------|----------|------|--------|-----|-------|
| Sprint 3 | 0 | 5 | 2 | 0 | 7 |
| Sprint 4 | 0 | 16 | 34 | 4 | 54 |

- **Change:** Total dependency vulnerabilities increased from 7 to 54, with the largest increase in MEDIUM and HIGH severities.

---

## 5. Reflection (Short)

The most problematic area is dependency risk accumulation in transitive npm packages, especially middleware and routing-related libraries with repeated advisories.  
Next sprint, we will prioritize version upgrades for high-risk dependencies first, then rerun Trivy after each upgrade batch to verify reductions and avoid regressions.  
We will also include development dependency scanning in a secondary pass for fuller coverage.

---

*This static analysis was generated using automated tools during this sprint.*
