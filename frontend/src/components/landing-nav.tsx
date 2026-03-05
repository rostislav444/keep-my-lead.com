"use client";

import Link from "next/link";
import { useUser } from "@/lib/hooks";

export function LandingNav() {
  const { data: user, isLoading } = useUser();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 nav-bar">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-decoration-none">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
              <path d="M4 2a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V4a2 2 0 00-2-2H4zM10 2a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V4a2 2 0 00-2-2h-2zM4 8a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H4zM10 8a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z" />
            </svg>
          </div>
          <span className="text-[0.95rem] font-bold text-[#1a1a1a]">Keep My Lead</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-[#6b7280]">
          <a href="#how" className="hover:text-[#1a1a1a] transition-colors">How it works</a>
          <a href="#features" className="hover:text-[#1a1a1a] transition-colors">Features</a>
          <a href="#pricing" className="hover:text-[#1a1a1a] transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-[#1a1a1a] transition-colors">FAQ</a>
        </div>
        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="w-28" />
          ) : user ? (
            <Link href="/panel/dashboard" className="btn-primary text-sm">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/panel/login" className="text-sm text-[#6b7280] hover:text-[#1a1a1a] transition-colors">
                Sign in
              </Link>
              <Link href="/panel/register" className="btn-primary text-sm">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
