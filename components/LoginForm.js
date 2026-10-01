"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthCard } from "@/components/AuthCard";
import { Button } from "@/components/ui";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    const next = searchParams.get("next");
    router.push(next || (profile?.role === "admin" ? "/admin/dashboard" : "/client/dashboard"));
    router.refresh();
  }

  return (
    <AuthCard
      title="Sign in"
      subtitle="Access your project workspace."
      footer={
        <>
          New here?{" "}
          <Link href="/register" className="text-accent hover:text-accentStrong">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="field-label">Email address</label>
          <input
            type="email"
            required
            className="field-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="field-label">Password</label>
          <input
            type="password"
            required
            className="field-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-rose-300">{error}</p>}
        <Button type="submit" variant="solid" className="w-full" disabled={loading}>
          {loading ? "Signing in\u2026" : "Sign in"}
        </Button>
        <div className="text-center">
          <Link href="/forgot-password" className="text-sm text-muted hover:text-fg">
            Forgot password?
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}
