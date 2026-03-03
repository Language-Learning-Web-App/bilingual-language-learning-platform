"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Languages,
  LayoutDashboard,
  BookOpen,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/app/lib/firebase-config";
import { signOut } from "firebase/auth";
import { CoursesProvider } from "./courses-context";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/courses", label: "My Courses", icon: BookOpen },
  { href: "#", label: "Progress", icon: BarChart3 },
  { href: "#", label: "Settings", icon: Settings },
];

function SidebarContent({
  onNavigate,
  pathname,
  onLogOut,
}: {
  onNavigate?: () => void;
  pathname: string;
  onLogOut: () => void;
}) {
  return (
    <>
      <Link
        href="/dashboard"
        className="mb-10 flex items-center gap-2.5"
        onClick={onNavigate}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Languages className="h-5 w-5" />
        </div>
        <span className="font-display text-xl font-bold tracking-tight">
          BLLP<span className="text-primary">-AI</span>
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-2 text-sm">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href) && item.href !== "#";

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 font-medium transition-colors ${isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted"
                }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Separator className="my-6" />

      <Button
        variant="ghost"
        className="justify-start gap-2 text-muted-foreground"
        onClick={onLogOut}
      >
        <LogOut className="h-4 w-4" />
        Log Out
      </Button>
    </>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogOut = async () => {
    try {
      await signOut(auth);
    } catch {
      /* ignore */
    }
    router.push("/sign-in");
  };

  return (
    <CoursesProvider>
      <div className="flex min-h-screen bg-background">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 border-r bg-muted/40 p-6 lg:flex lg:flex-col">
          <SidebarContent pathname={pathname} onLogOut={handleLogOut} />
        </aside>

        {/* Mobile sidebar drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black lg:hidden"
                onClick={() => setMobileOpen(false)}
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 250 }}
                className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-background p-6 lg:hidden"
              >
                <button
                  onClick={() => setMobileOpen(false)}
                  className="mb-4 self-end text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
                <SidebarContent
                  pathname={pathname}
                  onNavigate={() => setMobileOpen(false)}
                  onLogOut={handleLogOut}
                />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className="flex-1 p-6 lg:p-10">
          {/* Top bar */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden text-muted-foreground hover:text-foreground"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <Bell className="h-5 w-5 cursor-pointer text-muted-foreground hover:text-foreground" />

              <Link href="/dashboard/profile">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground cursor-pointer hover:opacity-90 transition">
                  <User className="h-4 w-4" />
                </div>
              </Link>
            </div>
          </div>

          {children}
        </main>
      </div>
    </CoursesProvider>
  );
}
