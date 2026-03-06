"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, setTokens } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-zinc-50"><p className="text-zinc-500">Loading...</p></div>}>
      <OnboardingContent />
    </Suspense>
  );
}

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qc = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [igToken, setIgToken] = useState("");
  const [form, setForm] = useState({
    company_name: "",
    email: "",
    password: "",
    industry: "",
  });

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      router.replace("/panel/login");
      return;
    }
    setIgToken(token);

    api
      .get<{ ig_username: string; ig_name: string; token: string }>(
        `/auth/onboarding?token=${encodeURIComponent(token)}`
      )
      .then((data) => {
        setForm((f) => ({
          ...f,
          company_name: data.ig_name || data.ig_username || "",
        }));
        setLoading(false);
      })
      .catch(() => {
        router.replace("/panel/login");
      });
  }, [searchParams, router]);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const data = await api.post<{ access: string; refresh: string }>("/auth/onboarding", {
        ...form,
        token: igToken,
      });
      setTokens(data.access, data.refresh);
      qc.invalidateQueries({ queryKey: ["me"] });
      router.push("/panel/dashboard");
    } catch (err: unknown) {
      const msg = (err as { error?: string })?.error || "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Set up your company</CardTitle>
          <p className="text-sm text-zinc-500">
            Almost done! Fill in a few details to complete your account.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-zinc-700">Company name</label>
              <Input
                placeholder="Your company name"
                value={form.company_name}
                onChange={set("company_name")}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700">Industry</label>
              <Input
                placeholder="e.g. cosmetology, fitness, real estate"
                value={form.industry}
                onChange={set("industry")}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700">Email</label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={set("email")}
              />
              <p className="mt-1 text-xs text-zinc-400">For account recovery and notifications</p>
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700">Backup password</label>
              <Input
                type="password"
                placeholder="Min 8 characters (optional)"
                value={form.password}
                onChange={set("password")}
                minLength={8}
              />
              <p className="mt-1 text-xs text-zinc-400">
                Optional. Allows signing in without Instagram.
              </p>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Creating account..." : "Complete setup"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
