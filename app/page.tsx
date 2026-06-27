import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, ShieldCheck, Bell, BarChart3, ArrowLeft } from "lucide-react";

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  const features = [
    {
      icon: Bell,
      title: "تنبيهات ذكية",
      desc: "اعرف قبل فوات الأوان — تحذيرات على 30 يوم و7 أيام من الانتهاء",
    },
    {
      icon: BarChart3,
      title: "لوحة تحكم واضحة",
      desc: "نظرة فورية على كل ما ينتهي قريبًا مرتّبًا حسب الأولوية",
    },
    {
      icon: ShieldCheck,
      title: "إدارة كاملة",
      desc: "كتالوج منتجات، مستخدمون، وأدوار — كل شيء في مكان واحد",
    },
  ];

  return (
    <div className="flex min-h-[100dvh] flex-col bg-gradient-to-b from-ink-50 to-white dark:from-ink-900 dark:to-ink-800">
      {/* ── Decorative background blobs ─────────────────────── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-brand-100/40 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-brand-50/50 blur-3xl" />
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-10 border-b border-ink-200 bg-white/80 backdrop-blur-md dark:border-ink-700 dark:bg-ink-800/80">
        <div className="relative mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <span className="flex items-center gap-2 font-bold text-ink-900 dark:text-ink-100">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600">
              <Package className="h-4 w-4 text-white" />
            </div>
            ناجح العربي
          </span>
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="rounded-lg px-4 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900 dark:text-ink-400 dark:hover:bg-ink-700 dark:hover:text-ink-200"
            >
              تسجيل الدخول
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-brand-700 hover:shadow-md active:scale-[0.97] dark:bg-brand-500 dark:hover:bg-brand-600"
            >
              ابدأ مجانًا
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="relative flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 shadow-lg shadow-brand-600/25 ring-1 ring-white/20">
          <Package className="h-8 w-8 text-white" />
        </div>
        <h1 className="mb-4 max-w-2xl text-4xl font-bold leading-tight text-ink-900 sm:text-5xl sm:leading-tight dark:text-ink-100">
          لا تدع شيئًا ينتهي صلاحيته بدون أن تعلم
        </h1>
        <p className="mb-10 max-w-lg text-lg text-ink-500 dark:text-ink-400">
          تتبع تواريخ صلاحية مخزونك، ثلاجتك، ومنزلك — حتى لا يضيع شيء.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/sign-up"
            className="group inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white shadow-sm transition-all hover:bg-brand-700 hover:shadow-md active:scale-[0.97]"
          >
            ابدأ مجانًا
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
          </Link>
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-6 py-3 font-semibold text-ink-800 shadow-sm transition-all hover:bg-ink-50 hover:shadow-md active:scale-[0.97] dark:border-ink-600 dark:bg-ink-800 dark:text-ink-200 dark:hover:bg-ink-700"
          >
            لديك حساب؟ ادخل
          </Link>
        </div>

        {/* Feature cards */}
        <div className="mt-20 grid w-full max-w-3xl grid-cols-1 gap-5 sm:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-xl border border-ink-200 bg-white p-5 text-right shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md dark:border-ink-700 dark:bg-ink-800 dark:hover:border-brand-600"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 transition-colors group-hover:bg-brand-100 dark:bg-brand-900/50 dark:group-hover:bg-brand-900">
                <f.icon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              </div>
              <h3 className="mb-1.5 font-semibold text-ink-900 dark:text-ink-100">{f.title}</h3>
              <p className="text-sm leading-relaxed text-ink-500 dark:text-ink-400">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Stats bar */}
        <div className="mt-16 grid w-full max-w-2xl grid-cols-3 gap-px overflow-hidden rounded-xl border border-ink-200 bg-ink-200 dark:border-ink-700 dark:bg-ink-700">
          {[
            { label: "عنصر متابع", value: "+١٠٠" },
            { label: "منتج في الكتالوج", value: "+٥٠٠" },
            { label: "مستخدم نشط", value: "+٣٠" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white px-4 py-5 text-center dark:bg-ink-800">
              <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">{stat.value}</p>
              <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-ink-200 py-6 text-center text-sm text-ink-400 dark:border-ink-700 dark:text-ink-500">
        © {new Date().getFullYear()} ناجح العربي لمتابعة التواريخ
      </footer>
    </div>
  );
}
