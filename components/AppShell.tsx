"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Package, Plus, List, Users, LayoutDashboard, Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useClerk, useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/lib/api-client";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const { user } = useUser();
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: getMe });
  const isAdmin = me?.role === "admin";

  const initials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user?.emailAddresses?.[0]?.emailAddress?.slice(0, 2).toUpperCase() ?? "?";

  const displayName = user?.fullName || user?.emailAddresses?.[0]?.emailAddress || "";
  const displayEmail = user?.emailAddresses?.[0]?.emailAddress ?? "";

  const linkClass = (href: string) =>
    `flex items-center gap-2 px-2 py-2 rounded-md transition-colors text-sm font-medium ${
      pathname === href
        ? "bg-brand-50 text-brand-700"
        : "text-ink-700 hover:bg-ink-100 hover:text-ink-900"
    }`;

  const UserFooter = () => (
    <div className="p-4 border-t flex items-center gap-3 bg-ink-50">
      <Avatar className="w-9 h-9 border border-ink-200">
        {user?.imageUrl && <AvatarImage src={user.imageUrl} alt={displayName} />}
        <AvatarFallback className="bg-brand-100 text-brand-700 text-xs font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        {displayName && <p className="text-sm font-medium text-ink-900 truncate">{displayName}</p>}
        {displayEmail !== displayName && <p className="text-xs text-ink-500 truncate">{displayEmail}</p>}
        {isAdmin && <p className="text-xs font-semibold text-brand-600 mt-0.5">مشرف</p>}
      </div>
      <Button
        variant="ghost" size="icon"
        className="shrink-0 text-ink-400 hover:text-ink-700"
        onClick={() => signOut({ redirectUrl: "/" })}
        title="تسجيل الخروج"
      >
        <LogOut className="w-4 h-4" />
      </Button>
    </div>
  );

  const NavLinks = () => (
    <>
      <div className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2 px-2">نظرة عامة</div>
      <Link href="/dashboard" className={linkClass("/dashboard")}><LayoutDashboard className="w-4 h-4" /> العناصر</Link>
      <Link href="/catalog" className={linkClass("/catalog")}><List className="w-4 h-4" /> الكتالوج</Link>
      <div className="text-xs font-semibold text-ink-500 uppercase tracking-wider mt-6 mb-2 px-2">الإجراءات</div>
      <Link href="/add" className={linkClass("/add")}><Plus className="w-4 h-4" /> متابعة عنصر جديد</Link>
      {isAdmin && (
        <>
          <div className="text-xs font-semibold text-ink-500 uppercase tracking-wider mt-6 mb-2 px-2">الإدارة</div>
          <Link href="/admin/catalog" className={linkClass("/admin/catalog")}><Package className="w-4 h-4" /> المنتجات</Link>
          <Link href="/admin/users" className={linkClass("/admin/users")}><Users className="w-4 h-4" /> المستخدمون</Link>
        </>
      )}
    </>
  );

  const mobileLinks = [
    { href: "/dashboard", label: "العناصر", icon: LayoutDashboard },
    { href: "/catalog", label: "الكتالوج", icon: List },
    { href: "/add", label: "متابعة", icon: Plus },
    ...(isAdmin ? [
      { href: "/admin/catalog", label: "المنتجات", icon: Package },
      { href: "/admin/users", label: "المستخدمون", icon: Users },
    ] : []),
  ];

  return (
    <div className="min-h-[100dvh] bg-background md:pr-[220px] flex flex-col">
      {/* Desktop sidebar (right side for RTL) */}
      <div className="hidden md:flex w-[220px] flex-col fixed inset-y-0 right-0 bg-sidebar border-l z-10">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-ink-900 tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-brand-600" />
            ناجح العربي لمتابعة التواريخ
          </h1>
        </div>
        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-2">
          <NavLinks />
        </div>
        <UserFooter />
      </div>

      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 left-0 right-0 h-14 bg-background border-b z-20 flex items-center justify-between px-4">
        <h1 className="text-lg font-bold text-ink-900 tracking-tight flex items-center gap-2">
          <Package className="w-5 h-5 text-brand-600" /> ناجح العربي
        </h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon"><Menu className="w-5 h-5 text-ink-700" /></Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] p-0 flex flex-col">
            <div className="p-4 border-b"><h2 className="font-bold text-ink-900">القائمة</h2></div>
            <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-2"><NavLinks /></div>
            <UserFooter />
          </SheetContent>
        </Sheet>
      </div>

      {/* Mobile bottom tab bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background border-t z-20 flex items-center justify-around px-2">
        {mobileLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${
              pathname === link.href ? "text-brand-600" : "text-ink-500 hover:text-ink-900"
            }`}
          >
            <link.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium truncate w-full text-center px-1">{link.label}</span>
          </Link>
        ))}
      </div>

      <main className="flex-1 w-full max-w-[1080px] mx-auto p-4 md:p-8 pb-24 md:pb-8">
        {children}
      </main>
    </div>
  );
}
