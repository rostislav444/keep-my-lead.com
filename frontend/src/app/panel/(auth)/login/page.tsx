"use client";

import { useState } from "react";
import { useLogin } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showManagerLogin, setShowManagerLogin] = useState(false);
  const login = useLogin();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-zinc-100 p-4">
      <div className="w-full max-w-sm">
        {/* Logo + Brand */}
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900">
            <svg width="36" height="36" viewBox="0 0 16 16" fill="white">
              <path d="M2 2h5v5H2zM9 2h5v5H9zM2 9h5v5H2zM9 9h5v5H9z" opacity="0.8" />
              <rect x="6" y="6" width="4" height="4" fill="white" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            Keep My Lead
          </h1>
          <p className="mt-2 text-center text-base text-zinc-500 leading-relaxed">
            Automate your Instagram DMs.
            <br />
            Never lose a lead again.
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl border border-zinc-200 bg-white px-7 py-7 shadow-sm">
          {/* Instagram CTA */}
          <a
            href="/api/auth/instagram"
            className="flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl px-5 py-4 text-base font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #833AB4, #C13584, #E1306C, #F77737)" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white" className="shrink-0">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
            Continue with Instagram
          </a>

          <p className="mt-4 text-center text-sm text-zinc-400">
            New or existing account — one click to sign in
          </p>

          {/* Manager section */}
          <div className="mt-6 border-t border-zinc-100 pt-5">
            {!showManagerLogin ? (
              <button
                onClick={() => setShowManagerLogin(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                Team member? Sign in with email
              </button>
            ) : (
              <>
                <div className="mb-4 flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-zinc-400">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  <span className="text-sm font-medium text-zinc-700">Team member login</span>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    login.mutate({ username, password });
                  }}
                  className="space-y-3"
                >
                  <Input
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  {login.isError && (
                    <p className="text-sm text-red-600">Invalid credentials</p>
                  )}
                  <Button type="submit" variant="outline" className="w-full" disabled={login.isPending}>
                    {login.isPending ? "Signing in..." : "Sign in"}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-zinc-400">
          By continuing, you agree to our{" "}
          <a href="/terms" className="underline hover:text-zinc-600">Terms</a>
          {" "}and{" "}
          <a href="/privacy" className="underline hover:text-zinc-600">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}
