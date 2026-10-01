"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthCard } from "@/components/AuthCard";
import { Button } from "@/components/ui";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/login"), 1500);
  }

  return (
    <AuthCard title="Set a new password" subtitle="Opened from the link emailed to you.">
      {done ? (
        <p className="text-sm text-emerald-300">Password updated. Redirecting to sign in\u2026</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="field-label">New password</label>
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
          <Button type="submit" variant="solid" className="w-full" disabled={loading}>
            {loading ? "Updating\u2026" : "Update password"}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
