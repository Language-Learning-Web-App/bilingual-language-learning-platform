# Trivy / Dependency Scan Summary — Sprint 2

**Date:** 2026-03-03  
**Scope:** Dependencies (`package-lock.json`); filesystem scan attempted but Trivy vulnerability DB download failed (TLS) on this environment.

## Dependency vulnerabilities (npm audit)

Trivy was installed but could not download its vulnerability database on first run. Dependency scan was performed with **npm audit** as the equivalent source for dependency vulnerabilities.

### Counts by severity

| Severity | Count |
|----------|-------|
| CRITICAL  | 0     |
| HIGH      | 1     |
| MEDIUM    | 1     |
| LOW       | 1     |

**Total:** 3 vulnerabilities

### Details (from npm audit)

- **ajv** &lt;6.14.0 — *moderate* — ReDoS when using `$data` option  
- **hono** &lt;4.11.10 — *low* — Timing comparison hardening in basicAuth/bearerAuth  
- **minimatch** (multiple) — *high* — ReDoS via wildcards / extglobs  

**Remediation:** `npm audit fix` (apply with testing).

---

*This static analysis was generated using automated tools during this sprint.*
