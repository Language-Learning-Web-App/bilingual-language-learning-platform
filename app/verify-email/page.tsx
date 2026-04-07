"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { sendEmailVerification, reload } from "firebase/auth";
import { auth } from "@/app/lib/firebase-config";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const user = auth.currentUser;

  // Check verification status
  const checkVerification = async () => {
    if (user) {
      setLoading(true);
      try {
        await reload(user); // Refresh the user object from Firebase
        if (user.emailVerified) {
          router.replace("/dashboard");
        } else {
          alert("Email not verified yet. Please check your inbox or spam folder.");
        }
      } catch (err) {
        console.error("Error checking verification:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!user) {
      router.replace("/sign-in");
    } else if (user.emailVerified) {
      router.replace("/dashboard");
    }
  }, [router, user]);

  const handleResend = async () => {
    if (user) {
      try {
        await sendEmailVerification(user, {
          url: `${window.location.origin}/verify-email`, // redirect after verification
        });
        setEmailSent(true);
      } catch (err) {
        console.error("Failed to send verification email:", err);
        alert("Could not send verification email. Try again later.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <h1 className="text-2xl font-bold mb-4">Verify Your Email</h1>
      <p className="mb-6 text-center text-muted-foreground">
        You need to verify your email before accessing the dashboard. If you don't see the email, check your Spam or Promotions folder.
      </p>

      <Button onClick={handleResend} disabled={emailSent}>
        {emailSent ? "Verification Email Sent!" : "Resend Verification Email"}
      </Button>

      {/* Button to refresh verification status */}
      <Button
        variant="outline"
        className="mt-4"
        onClick={checkVerification}
        disabled={loading}
      >
        {loading ? "Checking..." : "I've Verified My Email"}
      </Button>

      <Button
        variant="destructive"
        className="mt-4"
        onClick={() => auth.signOut().then(() => router.replace("/sign-in"))}
      >
        Sign Out
      </Button>
    </div>
  );
}