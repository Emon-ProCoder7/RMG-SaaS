import { LoginForm } from "@/components/auth/login-form";
import { supabaseConfigured } from "@/lib/supabase/config";

export default function LoginPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/30 p-4">
      <LoginForm configured={supabaseConfigured} />
    </main>
  );
}
