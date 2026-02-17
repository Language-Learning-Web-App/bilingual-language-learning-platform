import Link from "next/link";
import { Languages, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms & Privacy Policy — BLLP-AI",
  description:
    "Terms of Service and Privacy Policy for BLLP-AI, the Bilingual Language Learning Platform Powered by Artificial Intelligence.",
};

export default function TermsPrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Languages className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-foreground">
              BLLP<span className="text-primary">-AI</span>
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-6 py-16 lg:py-20">
        <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Terms & Privacy Policy
        </h1>
        <p className="mt-3 text-muted-foreground">
          Last updated: February 2026
        </p>

        <div className="mt-12 space-y-12">
          {/* Terms of Service */}
          <section>
            <h2 className="font-display text-2xl font-bold text-foreground">
              Terms of Service
            </h2>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                Welcome to BLLP-AI (Bilingual Language Learning Platform Powered
                by Artificial Intelligence). By accessing or using our platform,
                you agree to be bound by these Terms of Service. Please read
                them carefully before using our services.
              </p>

              <h3 className="font-display text-lg font-semibold text-foreground">
                1. Acceptance of Terms
              </h3>
              <p>
                By creating an account or using BLLP-AI, you acknowledge that
                you have read, understood, and agree to be bound by these terms.
                If you do not agree, please do not use our platform.
              </p>

              <h3 className="font-display text-lg font-semibold text-foreground">
                2. Use of the Platform
              </h3>
              <p>
                BLLP-AI provides AI-powered language learning tools including
                lessons, quizzes, and structured learning paths. You agree to
                use the platform only for its intended educational purposes and
                in compliance with all applicable laws.
              </p>

              <h3 className="font-display text-lg font-semibold text-foreground">
                3. User Accounts
              </h3>
              <p>
                You are responsible for maintaining the confidentiality of your
                account credentials and for all activities that occur under your
                account. You must provide accurate and complete information when
                creating your account.
              </p>

              <h3 className="font-display text-lg font-semibold text-foreground">
                4. Intellectual Property
              </h3>
              <p>
                All content on BLLP-AI, including lessons, exercises, designs,
                and AI-generated materials, is owned by BLLP-AI and protected by
                intellectual property laws. You may not reproduce, distribute,
                or create derivative works without our written permission.
              </p>

              <h3 className="font-display text-lg font-semibold text-foreground">
                5. Termination
              </h3>
              <p>
                We reserve the right to suspend or terminate your account if you
                violate these terms or engage in conduct that we determine is
                harmful to the platform or other users.
              </p>

              <h3 className="font-display text-lg font-semibold text-foreground">
                6. Limitation of Liability
              </h3>
              <p>
                BLLP-AI is provided &ldquo;as is&rdquo; without warranties of
                any kind. We are not liable for any indirect, incidental, or
                consequential damages arising from your use of the platform.
              </p>
            </div>
          </section>

          <hr className="border-border/60" />

          {/* Privacy Policy */}
          <section>
            <h2 className="font-display text-2xl font-bold text-foreground">
              Privacy Policy
            </h2>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                Your privacy is important to us. This Privacy Policy explains
                how BLLP-AI collects, uses, and protects your personal
                information.
              </p>

              <h3 className="font-display text-lg font-semibold text-foreground">
                1. Information We Collect
              </h3>
              <p>
                We collect information you provide directly, such as your name,
                email address, and learning preferences when you create an
                account. We also collect usage data including lesson progress,
                quiz results, and platform interaction patterns to improve your
                learning experience.
              </p>

              <h3 className="font-display text-lg font-semibold text-foreground">
                2. How We Use Your Information
              </h3>
              <p>
                We use your information to personalize your learning experience,
                improve our AI algorithms, communicate important updates, and
                maintain the security of our platform. We do not sell your
                personal information to third parties.
              </p>

              <h3 className="font-display text-lg font-semibold text-foreground">
                3. Data Storage & Security
              </h3>
              <p>
                Your data is stored securely using industry-standard encryption
                and security practices. We use Firebase and other trusted
                services to ensure your information is protected.
              </p>

              <h3 className="font-display text-lg font-semibold text-foreground">
                4. Cookies & Analytics
              </h3>
              <p>
                We use cookies and analytics tools to understand how our
                platform is used and to improve our services. You can manage
                cookie preferences through your browser settings.
              </p>

              <h3 className="font-display text-lg font-semibold text-foreground">
                5. Your Rights
              </h3>
              <p>
                You have the right to access, update, or delete your personal
                information at any time. You may also request a copy of the data
                we hold about you by contacting us.
              </p>

              <h3 className="font-display text-lg font-semibold text-foreground">
                6. Changes to This Policy
              </h3>
              <p>
                We may update this Privacy Policy from time to time. We will
                notify you of any significant changes through the platform or
                via email.
              </p>

              <h3 className="font-display text-lg font-semibold text-foreground">
                7. Contact Us
              </h3>
              <p>
                If you have any questions about these terms or our privacy
                practices, please contact us through the platform.
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-card/50">
        <div className="mx-auto max-w-4xl px-6 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} All rights reserved by BLLP-AI.
          </p>
        </div>
      </footer>
    </div>
  );
}
