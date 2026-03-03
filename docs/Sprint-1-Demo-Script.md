# Sprint 1 — Demo Script

---

## 1. App Running

- **Platform:** Web (Next.js)
- **Public URL:** *(insert deployed Vercel/Netlify URL here)*
- Open the app in browser from the public URL — **not localhost**
- Show the landing page loads successfully with all sections visible

---

## 2. New Features from This Sprint

| Feature | Description |
|---------|-------------|
| **Landing Page** | Full responsive landing page with animated hero, features, how-it-works, language marquee, and CTA sections. |
| **Sign Up Page** | User registration form with email/password and Google authentication. |
| **Sign In Page** | Login form with email/password and Google authentication. |
| **Terms & Privacy Policy Page** | Dedicated legal page with Terms of Service and Privacy Policy content. |
| **Language Showcase** | Scrolling marquee displaying 12+ supported languages with learner counts. |

**Demo flow:**
1. Navigate the landing page — scroll through Hero, Features, How It Works, Languages, and CTA sections
2. Click "Sign Up" — show the registration form with all fields and Google sign-up option
3. Click "Sign In" — show the login form with email/password and Google sign-in option
4. Click "Terms & Privacy Policy" in the footer — show the legal page

---

## 3. Improvements or Fixes

| Item | Details |
|------|---------|
| **Unit Tests** | Added 64 automated tests across 10 test files using Vitest + React Testing Library |
| **Code Coverage** | Achieved 85.96% statement coverage, 81.57% function coverage |
| **Responsive Design** | All pages work on mobile, tablet, and desktop viewports |
| **Accessibility** | Proper semantic HTML, aria labels, keyboard navigation support |

**Demo:** Run `pnpm test:coverage` in the terminal to show all 64 tests passing with coverage metrics.

---

## 4. What's Next

- **Sprint 2:** Implement Firebase backend integration for actual user authentication, build the dashboard page for logged-in users, and add interactive language lesson modules.

---

## Team Speaking Order

| Order | Team Member | Section |
|-------|-------------|---------|
| 1 | *(Name)* | App Running + Landing Page walkthrough |
| 2 | *(Name)* | Sign Up / Sign In feature demo |
| 3 | *(Name)* | Tests + Code Coverage |
| 4 | *(Name)* | What's Next |

---

## Reminders

- App must run from the **public deployed URL** — not localhost
- Every team member must speak at least once
- All demos must use the **same public URL** (merged to main branch)
