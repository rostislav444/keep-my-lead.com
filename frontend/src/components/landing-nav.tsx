"use client";

import Link from "next/link";
import { useUser } from "@/lib/hooks";

export function LandingNav() {
  const { data: user, isLoading } = useUser();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 nav-bar">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="logo-mark">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
              <path d="M2 2h5v5H2zM9 2h5v5H9zM2 9h5v5H2zM9 9h5v5H9z" opacity="0.8" />
              <rect x="6" y="6" width="4" height="4" fill="white" />
            </svg>
          </div>
          <span style={{ fontFamily: "'Unbounded',sans-serif", fontSize: "0.95rem", fontWeight: 700, color: "var(--text)" }}>Keep My Lead</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm" style={{ color: "var(--muted2)" }}>
          <a href="#how" className="hover:text-white transition-colors">How it works</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </div>
        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="w-28" />
          ) : user ? (
            <Link href="/panel/dashboard" className="btn-primary text-xs py-3 px-5">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/panel/login" className="text-sm transition-colors hover:text-white no-underline" style={{ color: "var(--muted2)" }}>
                Sign in
              </Link>
              <Link href="/panel/register" className="btn-primary text-xs py-3 px-5">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
