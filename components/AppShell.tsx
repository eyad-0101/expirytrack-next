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
} from "lucide-react";
import { useClerk, useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/lib/api-client";

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

  const isActive = (href: string) => pathname === href;

  const linkClass = (href: string) =>
    `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive(href)
        ? "bg-brand-600 text-white shadow-sm"
        : "text-ink-700 hover:bg-ink-100 hover:text-ink-900"
    }`;

  const NavContent = ({ onLinkClick }: { onLinkClick?: () => void }) => (
    <nav className="flex flex-col gap-1" aria-label="القائمة الرئيسية">
      <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-widest text-ink-400">
        نظرة عامة
      </p>
      <Link href="/dashboard" className={linkClass("/dashboard")} onClick={onLinkClick}>
        <LayoutDashboard className="h-4 w-4 shrink-0" aria-hidden="true" />
        العناصر المتابعة
      </Link>
      <Link href="/catalog" className={linkClass("/catalog")} onClick={onLinkClick}>
        <List className="h-4 w-4 shrink-0" aria-hidden="true" />
        الكتالوج
      </Link>

      <p className="mb-1 mt-5 px-3 text-[11px] font-semibold uppercase tracking-widest text-ink-400">
        الإجراءات
      </p>
      <Link href="/add" className={linkClass("/add")} onClick={onLinkClick}>
        <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
        إضافة عنصر
      </Link>

      {isAdmin && (
        <>
          <p className="mb-1 mt-5 px-3 text-[11px] font-semibold uppercase tracking-widest text-ink-400">
            الإدارة
          </p>
          <Link href="/admin/catalog" className={linkClass("/admin/catalog")} onClick={onLinkClick}>
            <Package className="h-4 w-4 shrink-0" aria-hidden="true" />
            المنتجات
          </Link>
          <Link href="/admin/users" className={linkClass("/admin/users")} onClick={onLinkClick}>
            <Users className="h-4 w-4 shrink-0" aria-hidden="true" />
            المستخدمون
          </Link>
        </>
      )}
    </nav>
  );

  const UserFooter = () => (
    <div className="border-t border-ink-200 p-3">
      <div className="flex items-center gap-2.5 rounded-lg p-2">
        {/* Avatar */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
          {user?.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.imageUrl}
              alt={displayName}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
        <div className="min-w-0 flex-1">
          {displayName && (
            <p className="truncate text-xs font-semibold text-ink-900">{displayName}</p>
          )}
          {displayEmail !== displayName && (
            <p className="truncate text-[11px] text-ink-500">{displayEmail}</p>
          )}
          {isAdmin && (
            <p className="mt-0.5 text-[11px] font-semibold text-brand-600">مشرف</p>
          )}
        </div>
        <button
          onClick={() => signOut({ redirectUrl: "/" })}
          aria-label="تسجيل الخروج"
          className="shrink-0 rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );

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

  return (
    /*
     * Layout strategy (mobile-first):
     *   mobile  → top header + bottom tab bar; content fills full width
     *   md+     → fixed sidebar on the right (RTL); content offset via pe-[220px]
     *
     * No inline styles — sidebar width is expressed as a Tailwind arbitrary value.
     */
    <div className="min-h-[100dvh] bg-ink-50">

      {/* ── Desktop sidebar (right side for RTL) ─────────────── */}
      <aside
        className="fixed inset-y-0 right-0 z-10 hidden w-[220px] flex-col border-s border-ink-200 bg-white md:flex"
        aria-label="الشريط الجانبي"
      >
        {/* Brand */}
        <div className="flex h-14 items-center gap-2 border-b border-ink-200 px-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600">
            <Package className="h-4 w-4 text-white" aria-hidden="true" />
          </div>
          <span className="text-sm font-bold leading-tight text-ink-900">
            ناجح العربي
            <br />
            <span className="text-xs font-normal text-ink-500">متابعة التواريخ</span>
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <NavContent />
        </div>
        <UserFooter />
      </aside>

      {/* ── Mobile overlay backdrop ───────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-ink-900/40 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile slide-over sidebar ─────────────────────────── */}
      <div
        className={`fixed inset-y-0 right-0 z-40 flex w-72 flex-col border-s border-ink-200 bg-white transition-transform duration-200 md:hidden ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="القائمة"
      >
        <div className="flex h-14 items-center justify-between border-b border-ink-200 px-4">
          <span className="font-bold text-ink-900">القائمة</span>
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="إغلاق القائمة"
            className="rounded-lg p-1.5 text-ink-500 transition-colors hover:bg-ink-100"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <NavContent onLinkClick={() => setMobileOpen(false)} />
        </div>
        <UserFooter />
      </div>

      {/* ── Mobile top bar ───────────────────────────────────── */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-ink-200 bg-white px-4 md:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="فتح القائمة"
          className="rounded-lg p-1.5 text-ink-600 transition-colors hover:bg-ink-100"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-600">
            <Package className="h-3.5 w-3.5 text-white" aria-hidden="true" />
          </div>
          <span className="text-sm font-bold text-ink-900">ناجح العربي</span>
        </div>
        {/* spacer keeps title visually centred */}
        <div className="w-8" aria-hidden="true" />
      </header>

      {/* ── Mobile bottom tab bar ─────────────────────────────── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-20 flex h-16 items-center justify-around border-t border-ink-200 bg-white md:hidden"
        aria-label="التنقل السريع"
      >
        {mobileNavItems.slice(0, 4).map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={isActive(href) ? "page" : undefined}
            className={`flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors ${
              isActive(href) ? "text-brand-600" : "text-ink-400 hover:text-ink-900"
            }`}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        ))}
      </nav>

      {/* ── Main content ─────────────────────────────────────── */}
      {/*
       * Mobile  : pt-14 (top bar height) + pb-20 (tab bar height + gap)
       * md+     : pe-[220px] (sidebar width offset, RTL-aware)
       */}
      <main className="min-h-[100dvh] pb-20 pt-14 md:pe-[220px] md:pb-8 md:pt-0">
        <div className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
