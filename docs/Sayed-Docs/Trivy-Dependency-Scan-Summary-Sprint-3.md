# Trivy / Dependency Scan Summary - Sprint 3

**Date:** 2026-03-17  
**Project:** BLLPP-AI (Bilingual Language Learning Platform - AI)

---

## 1. Tools Used

- **Programming language(s):** TypeScript, JavaScript (Node.js runtime)
- **SonarQube version/edition:** Not included in this file (required as separate SonarQube PDF report for Sprint 3)
- **Trivy scan type:** Filesystem dependency vulnerability scan (`trivy fs --scanners vuln`)
- **Where scan was executed:** Local machine

### Trivy execution note

- Trivy `fs` scan was attempted, but vulnerability DB download failed in this environment due to TLS certificate verification (`x509`) error.
- For dependency vulnerability counts, `npm audit --json` was used as fallback evidence for this sprint summary.

---

## 2. Required Metrics (Trivy/Dependency)

| Severity | Count |
|----------|-------|
| CRITICAL | 0 |
| HIGH | 5 |
| MEDIUM | 2 |
| LOW | 0 |

**Total vulnerabilities:** 7

---

## 3. Scope

- **Scanned:** Repository dependencies from `package-lock.json`/installed npm dependency graph (local project workspace).
- **Excluded:** Container image scanning and secret/misconfiguration scanners were not included in this run.

---

## 4. Trend (Compared to Sprint 2)

| Sprint | CRITICAL | HIGH | MEDIUM | LOW | Total |
|--------|----------|------|--------|-----|-------|
| Sprint 2 | 0 | 1 | 1 | 1 | 3 |
| Sprint 3 | 0 | 5 | 2 | 0 | 7 |

- **Change:** Total vulnerabilities increased from 3 to 7, with most increase in HIGH severity dependencies.

---

## 5. Reflection (Short)

The most problematic area is transitive npm dependencies with multiple HIGH-severity advisories (notably `minimatch`, `hono`, and related packages).  
Next sprint, we will prioritize dependency upgrades, run `npm audit fix` in a controlled branch, and re-test key user flows before merge.  
We will also schedule a clean Trivy run in CI with trusted certificates to avoid local DB download failures.

---

## Next Required Report for This Section

To complete this submission section, add the **SonarQube PDF report** and include:

- Bugs
- Vulnerabilities
- Code Smells
- Security Hotspots
- Quality Gate (Pass/Fail)

Recommended filename:

- `SonarQube-Report-Sprint-3.pdf`

Then place both files in the same folder and submit the GitHub folder URL.

---

*This static analysis was generated using automated tools during this sprint.*
