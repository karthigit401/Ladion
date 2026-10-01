"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthCard } from "@/components/AuthCard";
import { Button } from "@/components/ui";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone } },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      router.push("/client/dashboard");
      router.refresh();
      return;
    }

    setNotice("Account created. Check your email to confirm it, then sign in.");
    setLoading(false);
  }

  return (
    <AuthCard
      title="Create an account"
      subtitle="Sign up to submit a project request."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:text-accentStrong">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="field-label">Full name</label>
          <input
            required
            className="field-input"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
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
          <label className="field-label">Phone (for WhatsApp updates)</label>
          <input
            className="field-input"
            placeholder="+91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div>
          <label className="field-label">Password</label>
          <input
            type="password"
            required
            minLength={6}
            className="field-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-rose-300">{error}</p>}
        {notice && <p className="text-sm text-emerald-300">{notice}</p>}
        <Button type="submit" variant="solid" className="w-full" disabled={loading}>
          {loading ? "Creating account\u2026" : "Create account"}
        </Button>
      </form>
    </AuthCard>
  );
}
