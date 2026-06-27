import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-ink-50 px-4">
      <div className="mb-6 flex items-center gap-2 text-lg font-bold text-ink-900">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600">
          <span className="text-lg">📦</span>
        </div>
        ناجح العربي
      </div>
      <SignIn afterSignInUrl="/dashboard" />
    </div>
  );
}
