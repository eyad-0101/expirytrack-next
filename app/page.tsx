import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-ink-50 px-6 text-center">
      <div className="mb-6 flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-600 shadow-lg">
        <span className="text-2xl">📦</span>
      </div>
      <h1 className="text-3xl font-bold text-ink-900 mb-2">ناجح العربي لمتابعة التواريخ</h1>
      <p className="text-ink-500 mb-8 max-w-sm">
        تتبع تواريخ صلاحية مخزونك، ثلاجتك، ومنزلك — حتى لا يضيع شيء.
      </p>
      <div className="flex gap-3">
        <Link href="/sign-in" className="px-5 py-2.5 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700 transition-colors">
          تسجيل الدخول
        </Link>
        <Link href="/sign-up" className="px-5 py-2.5 rounded-lg border border-ink-200 bg-white text-ink-800 font-medium hover:bg-ink-50 transition-colors">
          إنشاء حساب
        </Link>
      </div>
    </div>
  );
}
