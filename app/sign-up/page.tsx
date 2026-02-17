"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Languages, ArrowLeft, Mail, Lock, User } from "lucide-react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/app/lib/firebase-config";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const stagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function SignUpPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword){
      setError("Passwords do not match");
      return;
    }
    
    setLoading(true);
    try{
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(cred.user, {
        displayName: `${firstName} ${lastName}`.trim(),
      });
      router.push("/sign-in");
    }catch (err: any) {
      setError(err?.message ?? "Sign up failed.");
    }finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError(null);
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      await signInWithPopup(auth, provider);

      router.push("/");
    } catch (err: any) {
      setError(err?.message ?? "Google sign up failed.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="relative flex min-h-screen">
      {/* Left decorative panel */}
      <div className="relative hidden w-[45%] overflow-hidden bg-primary lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d4e49] via-primary to-primary" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Floating glyphs */}
        {["Ciao", "Danke", "สวัสดี", "Olá", "Привет", "Hej"].map(
          (glyph, i) => (
            <motion.span
              key={glyph}
              className="absolute font-display text-white/[0.06] font-bold select-none"
              style={{
                fontSize: `${1.5 + (i % 3) * 0.8}rem`,
                top: `${10 + i * 14}%`,
                left: `${15 + (i % 2) * 45}%`,
              }}
              animate={{ y: [0, -10, 0], rotate: [0, -2, 0] }}
              transition={{
                duration: 5 + i,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.3,
              }}
            >
              {glyph}
            </motion.span>
          )
        )}

        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white">
              <Languages className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-white">
              BLLP<span className="text-white/70">-AI</span>
            </span>
          </Link>

          {/* Message */}
          <div>
            <h2 className="font-display text-4xl font-bold leading-tight text-white">
              Start something
              <br />
              <span className="text-white/70">extraordinary.</span>
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/50">
              Join thousands of learners mastering new languages with
              AI-powered personalized lessons. Your bilingual future starts here.
            </p>
          </div>

          <div />
        </div>
      </div>

      {/* Right form panel */}
      <div className="relative flex flex-1 items-center justify-center bg-background grain-overlay">
        <div className="absolute inset-0 gradient-mesh-amber opacity-40" />

        <div className="relative z-10 w-full max-w-md px-6 py-12 sm:px-12">
          {/* Back link (mobile) */}
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground lg:hidden"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to home
          </Link>

          {/* Mobile logo */}
          <Link
            href="/"
            className="mb-10 flex items-center gap-2.5 lg:hidden"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Languages className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-foreground">
              BLLP<span className="text-primary">-AI</span>
            </span>
          </Link>

          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={fadeUp}>
              <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
                Create Account
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Sign up to begin your language learning journey
              </p>
            </motion.div>

            <motion.form
              variants={fadeUp}
              className="mt-8 space-y-5"
              onSubmit={handleSignUp}
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="first-name"
                      type="text"
                      placeholder="First Name"
                      className="h-11 pl-10"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last Name</Label>
                  <Input
                    id="last-name"
                    type="text"
                    placeholder="Last Name"
                    className="h-11"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email Address"
                    className="h-11 pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="h-11 pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Must be at least 8 characters with one uppercase and one number
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    className="h-11 pl-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button
                type="submit"
                className="h-11 w-full bg-primary text-base font-semibold text-primary-foreground shadow-md shadow-primary/15 transition-all duration-300 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5" 
                disabled={loading}
              > {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </motion.form>

            <motion.div variants={fadeUp} className="mt-6">
              <div className="relative flex items-center gap-4">
                <Separator className="flex-1" />
                <span className="text-xs font-medium text-muted-foreground">
                  or sign up with
                </span>
                <Separator className="flex-1" />
              </div>

              <div className="mt-4">
                <Button
                  variant="outline"
                  className="h-11 w-full gap-2 text-sm font-medium"
                  onClick={handleGoogleSignUp}
                  disabled={loading}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </Button>
              </div>
            </motion.div>

            <motion.div variants={fadeUp}>
              <p className="mt-6 text-center text-[11px] leading-relaxed text-muted-foreground/70">
                By creating an account, you agree to our{" "}
                <Link href="/terms-privacy" className="underline underline-offset-2 hover:text-foreground">
                  Terms & Privacy Policy
                </Link>
              </p>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/sign-in"
                  className="font-semibold text-primary transition-colors hover:text-primary/80"
                >
                  Sign In
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
