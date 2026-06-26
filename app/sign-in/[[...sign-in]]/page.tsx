import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-ink-50 px-4">
      <SignIn />
    </div>
  );
}
