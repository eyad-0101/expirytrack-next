"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Package,
  Plus,
  List,
  Users,
  LayoutDashboard,
  Menu,
  LogOut,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { useClerk, useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/lib/api-client";
import { useTheme } from "@/lib/use-theme";

// ── Helpers (module scope — pure functions, no closures needed) ──
function isActivePath(pathname: string, href: string) {
  return pathname === href;
}

function linkClass(pathname: string, href: string) {
  const active = isActivePath(pathname, href);
  return `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-ink-800 ${
    active
      ? "font-bold text-brand-700 dark:text-brand-300"
      : "font-medium text-ink-700 hover:bg-ink-100 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-ink-800 dark:hover:text-ink-100 active:scale-[0.98]"
  }`;
}

function iconClass(pathname: string, href: string) {
  const active = isActivePath(pathname, href);
  return `h-4 w-4 shrink-0 ${active ? "text-brand-600 dark:text-brand-400" : "text-ink-400 dark:text-ink-500"}`;
}

// ── NavContent — top-level component, reads pathname itself ──
function NavContent({ isAdmin, onLinkClick }: { isAdmin: boolean; onLinkClick?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1" aria-label="القائمة الرئيسية">
      <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-widest text-ink-400 dark:text-ink-500">
        نظرة عامة
      </p>
      <Link href="/dashboard" className={linkClass(pathname, "/dashboard")} onClick={onLinkClick} aria-current={isActivePath(pathname, "/dashboard") ? "page" : undefined}>
        <LayoutDashboard className={iconClass(pathname, "/dashboard")} aria-hidden="true" />
        العناصر المتابعة
      </Link>
      <Link href="/catalog" className={linkClass(pathname, "/catalog")} onClick={onLinkClick} aria-current={isActivePath(pathname, "/catalog") ? "page" : undefined}>
        <List className={iconClass(pathname, "/catalog")} aria-hidden="true" />
        الكتالوج
      </Link>

      <div className="my-4 border-t border-ink-100 dark:border-ink-700" />
      <Link href="/add" className={linkClass(pathname, "/add")} onClick={onLinkClick} aria-current={isActivePath(pathname, "/add") ? "page" : undefined}>
        <Plus className={iconClass(pathname, "/add")} aria-hidden="true" />
        إضافة عنصر
      </Link>

      {isAdmin && (
        <>
          <div className="my-4 border-t border-ink-100 dark:border-ink-700" />
          <Link href="/admin/catalog" className={linkClass(pathname, "/admin/catalog")} onClick={onLinkClick} aria-current={isActivePath(pathname, "/admin/catalog") ? "page" : undefined}>
            <Package className={iconClass(pathname, "/admin/catalog")} aria-hidden="true" />
            المنتجات
          </Link>
          <Link href="/admin/users" className={linkClass(pathname, "/admin/users")} onClick={onLinkClick} aria-current={isActivePath(pathname, "/admin/users") ? "page" : undefined}>
            <Users className={iconClass(pathname, "/admin/users")} aria-hidden="true" />
            المستخدمون
          </Link>
        </>
      )}
    </nav>
  );
}

// ── ThemeToggle — fully self-contained, no props needed ──
function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label={theme === "dark" ? "تفعيل الوضع النهاري" : "تفعيل الوضع الليلي"}
      className="shrink-0 rounded-lg p-1.5 text-ink-400 transition-all hover:bg-ink-100 hover:text-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 dark:text-ink-500 dark:hover:bg-ink-700 dark:hover:text-ink-200"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}

// ── UserFooter — top-level component, takes user data as props ──
function UserFooter({
  imageUrl,
  displayName,
  displayEmail,
  initials,
  isAdmin,
  onSignOut,
}: {
  imageUrl?: string | null;
  displayName: string;
  displayEmail: string;
  initials: string;
  isAdmin: boolean;
  onSignOut: () => void;
}) {
  return (
    <div className="border-t border-ink-200 bg-ink-50/50 p-3 dark:border-ink-700 dark:bg-ink-800/50">
      <div className="flex items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-ink-100/50 dark:hover:bg-ink-700/50">
        {/* Avatar */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 ring-1 ring-white dark:bg-brand-900 dark:text-brand-200 dark:ring-ink-700">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={displayName}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
        <div className="min-w-0 flex-1">
          {displayName && (
            <p className="truncate text-xs font-semibold text-ink-900 dark:text-ink-100">{displayName}</p>
          )}
          {displayEmail !== displayName && (
            <p className="truncate text-[11px] text-ink-500 dark:text-ink-400">{displayEmail}</p>
          )}
          {isAdmin && (
            <p className="mt-0.5 text-[11px] font-semibold text-brand-600 dark:text-brand-400">مشرف</p>
          )}
        </div>
        <ThemeToggle />
        <button
          onClick={onSignOut}
          aria-label="تسجيل الخروج"
          className="shrink-0 rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50 dark:text-ink-500 dark:hover:bg-red-950 dark:hover:text-red-400"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

// ── AppShell ──
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const { user } = useUser();
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: getMe });
  const isAdmin = me?.role === "admin";
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials =
    user?.firstName && user?.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`
      : user?.emailAddresses?.[0]?.emailAddress?.slice(0, 2).toUpperCase() ?? "?";

  const displayName = user?.fullName || user?.emailAddresses?.[0]?.emailAddress || "";
  const displayEmail = user?.emailAddresses?.[0]?.emailAddress ?? "";

  const isActive = (href: string) => isActivePath(pathname, href);

  const mobileNavItems = [
    { href: "/dashboard", label: "العناصر", Icon: LayoutDashboard },
    { href: "/catalog", label: "الكتالوج", Icon: List },
    { href: "/add", label: "إضافة", Icon: Plus },
    ...(isAdmin
      ? [
          { href: "/admin/catalog", label: "المنتجات", Icon: Package },
          { href: "/admin/users", label: "المستخدمون", Icon: Users },
        ]
      : []),
  ];

  const handleSignOut = () => signOut({ redirectUrl: "/" });

  return (
    <div className="min-h-[100dvh] bg-ink-50 dark:bg-ink-900">

      {/* ── Desktop sidebar (right side for RTL) ─────────────── */}
      <aside
        className="fixed inset-y-0 right-0 z-10 hidden w-[220px] flex-col border-s border-ink-200 bg-white shadow-sm dark:border-ink-700 dark:bg-ink-800 md:flex"
        aria-label="الشريط الجانبي"
      >
        {/* Brand */}
        <div className="flex h-14 items-center gap-3 border-b border-ink-200 px-4 dark:border-ink-700">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-600 dark:bg-brand-500">
            <Package className="h-4 w-4 text-white" aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-tight text-ink-900 dark:text-ink-100">
              ناجح العربي
            </span>
            <span className="text-[11px] font-normal text-ink-400 leading-tight dark:text-ink-500">متابعة التواريخ</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <NavContent isAdmin={isAdmin} />
        </div>
        <UserFooter
          imageUrl={user?.imageUrl}
          displayName={displayName}
          displayEmail={displayEmail}
          initials={initials}
          isAdmin={isAdmin}
          onSignOut={handleSignOut}
        />
      </aside>

      {/* ── Mobile overlay backdrop ───────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-ink-900/40 dark:bg-ink-950/60 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile slide-over sidebar ─────────────────────────── */}
      <div
        className={`fixed inset-y-0 right-0 z-40 flex w-72 flex-col border-s border-ink-200 bg-white transition-transform duration-200 dark:border-ink-700 dark:bg-ink-800 md:hidden ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="القائمة"
      >
        <div className="flex h-14 items-center justify-between border-b border-ink-200 px-4 dark:border-ink-700">
          <span className="font-bold text-ink-900 dark:text-ink-100">القائمة</span>
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="إغلاق القائمة"
            className="rounded-lg p-1.5 text-ink-500 transition-colors hover:bg-ink-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 dark:text-ink-400 dark:hover:bg-ink-700"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <NavContent isAdmin={isAdmin} onLinkClick={() => setMobileOpen(false)} />
        </div>
        <UserFooter
          imageUrl={user?.imageUrl}
          displayName={displayName}
          displayEmail={displayEmail}
          initials={initials}
          isAdmin={isAdmin}
          onSignOut={handleSignOut}
        />
      </div>

      {/* ── Mobile top bar ───────────────────────────────────── */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-ink-200 bg-white/95 backdrop-blur-sm px-4 dark:border-ink-700 dark:bg-ink-800/95 md:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="فتح القائمة"
          className="rounded-lg p-1.5 text-ink-600 transition-colors hover:bg-ink-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 dark:text-ink-400 dark:hover:bg-ink-700"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-600 dark:bg-brand-500">
            <Package className="h-3.5 w-3.5 text-white" aria-hidden="true" />
          </div>
          <span className="text-sm font-bold text-ink-900 dark:text-ink-100">ناجح العربي</span>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
        </div>
      </header>

      {/* ── Mobile bottom tab bar ─────────────────────────────── */}
      <nav
        className="bottom-tab-bar fixed bottom-0 left-0 right-0 z-20 flex h-16 items-center justify-around border-t border-ink-200 bg-white/95 backdrop-blur-sm dark:border-ink-700 dark:bg-ink-800/95 md:hidden"
        aria-label="التنقل السريع"
      >
        {mobileNavItems.slice(0, 4).map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={isActive(href) ? "page" : undefined}
            className={`relative flex flex-col items-center justify-center gap-1 px-3 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-ink-800 ${
              isActive(href) ? "font-bold text-brand-600 dark:text-brand-400" : "text-ink-400 hover:text-ink-700 dark:text-ink-500 dark:hover:text-ink-300"
            }`}
          >
            {isActive(href) && (
              <span className="absolute -top-px left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-brand-600 dark:bg-brand-400" aria-hidden="true" />
            )}
            <Icon className="h-5 w-5" aria-hidden="true" />
            <span className={`text-[10px] ${isActive(href) ? "font-bold" : "font-medium"}`}>{label}</span>
          </Link>
        ))}
      </nav>

      {/* ── Main content with page transition animation ─────── */}
      <main className="min-h-[100dvh] pb-20 pt-14 md:pr-[220px] md:pb-8 md:pt-0">
        {/*
         * Using pathname as key triggers the slide-up animation on every route change.
         * React unmounts and remounts this div when the path changes.
         */}
        <div
          key={pathname}
          className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-8 animate-slide-up"
        >
          {children}
        </div>
      </main>
    </div>
  );
}