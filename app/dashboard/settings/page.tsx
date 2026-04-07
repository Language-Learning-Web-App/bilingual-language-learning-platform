"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { signOut, updateProfile, deleteUser } from "firebase/auth";
import { auth } from "@/app/lib/firebase-config";

import { updateUserProfile } from "@/app/lib/userProfileService";
import { useUserProfile } from "@/app/context/UserProfileContext";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Languages, ArrowLeft, LogOut, User } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const user = auth.currentUser;
  const { refreshProfile } = useUserProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.displayName) setDisplayName(user.displayName);
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/sign-in");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleChangeDisplayName = async () => {
    if (!user) return;
    if (!displayName.trim()) {
      alert("Display name cannot be empty");
      return;
    }

    try {
      setLoading(true);

      // 1. Update Firebase Auth
      await updateProfile(user, { displayName });

      // 2. Update Firestore
      await updateUserProfile(user.uid, { name: displayName });

      // 3. Refresh context
      await refreshProfile();

      setIsEditing(false);
    } catch (err) {
      console.error("Error updating display name:", err);
      alert("Failed to update display name");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    const confirmDelete = confirm(
      "Are you sure you want to delete your account? This cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      setLoading(true);
      await deleteUser(user);
      alert("Account deleted successfully");
      router.replace("/sign-up");
    } catch (err: any) {
      console.error("Error deleting account:", err);
      if (err.code === "auth/requires-recent-login") {
        alert("Please log in again before deleting your account.");
        router.replace("/sign-in");
      } else {
        alert("Failed to delete account");
      }
    } finally {
      setLoading(false);
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
              <Link href="/sign-up">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button variant="ghost" className="gap-2" onClick={handleLogout}>
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
                {user?.displayName || user?.email || "Unknown user"}
              </p>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Account Section */}
          <section>
            <h2 className="text-base font-semibold">Account</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Update your profile information.
            </p>

            <div className="mt-4 flex flex-col gap-3 max-w-sm">
              <input
                type="text"
                placeholder="Display name"
                value={displayName}
                disabled={!isEditing || loading}
                onChange={(e) => setDisplayName(e.target.value)}
                className="border rounded px-3 py-2 text-sm disabled:opacity-60"
              />

              {isEditing ? (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleChangeDisplayName}
                    disabled={loading}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDisplayName(user?.displayName || "");
                      setIsEditing(false);
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  disabled={loading}
                >
                  Edit Display Name
                </Button>
              )}
            </div>

            <div className="mt-3">
              <Button variant="outline" disabled>
                Change Password (coming soon)
              </Button>
            </div>
          </section>

          <Separator className="my-6" />

          {/* Preferences Section */}
          <section>
            <h2 className="text-base font-semibold">Preferences</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              App preferences like theme, notifications, or language.
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

          <Separator className="my-6" />

          {/* Danger Zone */}
          <section>
            <h2 className="text-base font-semibold text-destructive">
              Danger Zone
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sensitive actions.
            </p>

            <div className="mt-4">
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={loading}
              >
                Delete Account
              </Button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}