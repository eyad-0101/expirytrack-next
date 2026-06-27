import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { Package } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center bg-gradient-to-b from-ink-50 to-white px-4 dark:from-ink-900 dark:to-ink-800">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-brand-100/40 blur-3xl" />
      </div>
      <div className="relative mb-8 flex items-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 shadow-lg shadow-brand-600/25 ring-1 ring-white/20">
          <Package className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-lg font-bold text-ink-900 dark:text-ink-100">ناجح العربي</p>
          <p className="text-xs text-ink-500 dark:text-ink-400">متابعة تواريخ الصلاحية</p>
        </div>
      </div>
      <div className="relative">
        <SignIn fallbackRedirectUrl="/dashboard" />
      </div>
      <p className="relative mt-6 text-xs text-ink-400">
        ليس لديك حساب؟{' '}
        <Link href="/sign-up" className="font-medium text-brand-600 hover:text-brand-700 transition-colors dark:text-brand-400 dark:hover:text-brand-300">
          سجّل الآن
        </Link>
      </p>
    </div>
  );
}
