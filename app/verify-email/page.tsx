"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { sendEmailVerification, reload } from "firebase/auth";
import { auth } from "@/app/lib/firebase-config";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      router.replace("/sign-in");
      return;
    }
    if (user.emailVerified) {
      router.replace("/dashboard");
      return;
    }
  }, [router, user]);

  useEffect(() => {
    if (!user) return;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible") {
        try {
          await reload(user);
          if (user.emailVerified) {
            router.replace("/dashboard");
          }
        } catch (err) {
          console.error("Visibility check failed:", err);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [user, router]);

  const handleResend = async () => {
    if (!user) return;
    try {
      await sendEmailVerification(user, {
        url: `${window.location.origin}/dashboard`,
        handleCodeInApp: false,
      });
      setEmailSent(true);
    } catch (err) {
      console.error("Failed to resend verification email:", err);
      alert("Could not send verification email. Try again later.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4">
      <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-sm text-center">
        <h1 className="text-2xl font-bold mb-2">Verify Your Email</h1>
        <p className="text-muted-foreground text-sm mb-6">
          A verification link was sent to <strong>{user?.email}</strong>.
          Click the link and you'll be taken straight to your dashboard.
        </p>

        <Button onClick={handleResend} disabled={emailSent} className="w-full">
          {emailSent ? "Verification Email Sent!" : "Resend Verification Email"}
        </Button>

        <Button
          variant="destructive"
          className="mt-3 w-full"
          onClick={() => auth.signOut().then(() => router.replace("/sign-in"))}
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
}