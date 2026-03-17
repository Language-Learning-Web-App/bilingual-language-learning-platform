"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/app/lib/firebase-config";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Languages, ArrowLeft, LogOut, User } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();

  const user = auth.currentUser;

  const handleLogout = async () => {
    try{
      await signOut(auth);
      router.replace("/sign-in");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Languages className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-lg font-bold tracking-tight">
                Settings
              </p>
              <p className="text-sm text-muted-foreground">
                Manage your account preferences
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="gap-2">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button 
            variant="ghost" 
            className="gap-2" 
            onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-5xl p-6">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Signed in as</p>
              <p className="font-medium">
                {user?.email ?? "Unknown user"}
              </p>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Basic settings placeholders */}
          <div className="space-y-6">
            <section>
              <h2 className="text-base font-semibold">Account</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Profile edits can go here (display name, photo, etc.).
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" disabled>
                  Change Display Name (coming soon)
                </Button>
                <Button variant="outline" disabled>
                  Change Password (coming soon)
                </Button>
              </div>
            </section>

            <section>
              <h2 className="text-base font-semibold">Preferences</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                App preferences like theme, notifications, or language can go here.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" disabled>
                  Notifications (coming soon)
                </Button>
                <Button variant="outline" disabled>
                  Theme (coming soon)
                </Button>
              </div>
            </section>

            <section>
              <h2 className="text-base font-semibold text-destructive">Danger Zone</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Sensitive actions.
              </p>

              <div className="mt-4">
                <Button variant="destructive" disabled>
                  Delete Account (coming soon)
                </Button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}