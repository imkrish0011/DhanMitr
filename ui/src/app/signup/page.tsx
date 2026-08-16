import { AuthCard } from "@/components/AuthCard";

export default function SignupPage() {
  return (
    <div className="min-h-[100dvh] bg-slate-50/50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <AuthCard initialMode="signup" />
    </div>
  );
}
