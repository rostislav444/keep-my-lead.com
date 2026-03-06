"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setTokens } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-zinc-50"><p className="text-zinc-500">Signing in...</p></div>}>
      <AuthCallbackContent />
    </Suspense>
  );
}

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qc = useQueryClient();

  useEffect(() => {
    const access = searchParams.get("access");
    const refresh = searchParams.get("refresh");

    if (access && refresh) {
      setTokens(access, refresh);
      qc.invalidateQueries({ queryKey: ["me"] });
      router.replace("/panel/dashboard");
    } else {
      router.replace("/panel/login?error=no_tokens");
    }
  }, [searchParams, router, qc]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <p className="text-zinc-500">Signing in...</p>
    </div>
  );
}
