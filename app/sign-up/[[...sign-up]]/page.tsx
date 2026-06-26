import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-ink-50 px-4">
      <SignUp />
    </div>
  );
}
