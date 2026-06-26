"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function LoginForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "");
    const password = String(fd.get("password") ?? "");
    setLoading(true);
    const supabase = createClient();
    const { error } =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (mode === "signup") {
      toast.success("Account created. Check your email if confirmation is on.");
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-sm bg-card border-amber-800/30 shadow-xl">
      <CardHeader className="items-center text-center">
        <img src="/logo.png" alt="RMG Suite" className="mb-2 size-12" />
        <CardTitle className="text-xl text-amber-50">
          {mode === "signin" ? "Sign in" : "Create account"}
        </CardTitle>
        <CardDescription className="text-amber-400/60">RMG Suite — inventory & operations</CardDescription>
      </CardHeader>

      {!configured ? (
        <CardContent className="space-y-4">
          <div className="rounded-md border border-amber-700/40 bg-amber-500/10 p-3 text-sm text-amber-300">
            Authentication is disabled in <strong>preview mode</strong>. Add your
            Supabase keys to <code className="font-mono">.env.local</code> to
            enable login.
          </div>
          <Button className="w-full bg-gold-metallic text-black font-semibold" render={<Link href="/dashboard" />}>
            Continue to preview →
          </Button>
        </CardContent>
      ) : (
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-amber-200">Email</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-amber-200">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full bg-gold-metallic text-black font-semibold hover:brightness-110 shadow-lg" disabled={loading}>
              {loading
                ? "Please wait…"
                : mode === "signin"
                  ? "Sign in"
                  : "Sign up"}
            </Button>
            <button
              type="button"
              className="text-sm text-amber-400/60 hover:text-amber-300"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            >
              {mode === "signin"
                ? "Need an account? Sign up"
                : "Have an account? Sign in"}
            </button>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}
