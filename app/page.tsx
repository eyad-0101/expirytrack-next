import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, ShieldCheck, Bell, BarChart3 } from "lucide-react";

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
    <div className="flex min-h-[100dvh] flex-col bg-ink-50">
      {/* Nav */}
      <header className="sticky top-0 z-10 border-b border-ink-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <span className="flex items-center gap-2 font-bold text-ink-900">
            <Package className="h-5 w-5 text-brand-600" />
            ناجح العربي
          </span>
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="text-sm font-medium text-ink-600 hover:text-ink-900 transition-colors"
            >
              تسجيل الدخول
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
            >
              ابدأ مجانًا
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 shadow-lg shadow-brand-600/30">
          <Package className="h-8 w-8 text-white" />
        </div>
        <h1 className="mb-4 max-w-xl text-4xl font-bold leading-tight text-ink-900">
          لا تدع شيئًا ينتهي صلاحيته بدون أن تعلم
        </h1>
        <p className="mb-10 max-w-md text-lg text-ink-500">
          تتبع تواريخ صلاحية مخزونك، ثلاجتك، ومنزلك — حتى لا يضيع شيء.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/sign-up"
            className="rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
          >
            ابدأ مجانًا
          </Link>
          <Link
            href="/sign-in"
            className="rounded-lg border border-ink-200 bg-white px-6 py-3 font-semibold text-ink-800 hover:bg-ink-50 transition-colors"
          >
            لديك حساب؟ ادخل
          </Link>
        </div>

        {/* Feature cards */}
        <div className="mt-20 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-ink-200 bg-white p-5 text-right shadow-sm"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50">
                <f.icon className="h-5 w-5 text-brand-600" />
              </div>
              <h3 className="mb-1 font-semibold text-ink-900">{f.title}</h3>
              <p className="text-sm text-ink-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-ink-200 py-6 text-center text-sm text-ink-400">
        © {new Date().getFullYear()} ناجح العربي لمتابعة التواريخ
      </footer>
    </div>
  );
}
