"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUser, useLogout } from "@/lib/hooks";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  ShoppingBag,
  Bot,
  Instagram,
  UserPlus,
  Plug,
  LogOut,
  ChevronRight,
} from "lucide-react";

function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className}>
      <path d="M2 2h5v5H2zM9 2h5v5H9zM2 9h5v5H2zM9 9h5v5H9z" opacity="0.8" />
      <rect x="6" y="6" width="4" height="4" />
    </svg>
  );
}

const navItems = [
  { href: "/panel/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/panel/dialogs", label: "Dialogs", icon: MessageSquare },
  { href: "/panel/leads", label: "Leads", icon: Users },
  { href: "/panel/catalog", label: "Catalog", icon: ShoppingBag },
];

const settingsItems = [
  { href: "/panel/settings/bot", label: "Bot Settings", icon: Bot },
  { href: "/panel/settings/accounts", label: "Instagram", icon: Instagram },
  { href: "/panel/settings/team", label: "Team", icon: UserPlus },
  { href: "/panel/settings/integrations", label: "Integrations", icon: Plug },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: user } = useUser();
  const logout = useLogout();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="flex h-screen w-[260px] flex-col bg-[#351E1C]">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 px-5 border-b border-white/10">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF6037]">
          <Logo className="h-4 w-4 text-white" />
        </div>
        <span className="text-[15px] font-bold tracking-tight text-[#F5F4ED]">Keep My Lead</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 pt-4">
        <div className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-[#9E8E8C]">
          Main
        </div>
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all",
                active
                  ? "bg-[#FF6037] text-white shadow-sm shadow-[#FF6037]/20"
                  : "text-[#ECECDC]/70 hover:bg-white/8 hover:text-[#F5F4ED]"
              )}
            >
              <item.icon
                className={cn(
                  "h-[18px] w-[18px] transition-colors",
                  active ? "text-white" : "text-[#9E8E8C] group-hover:text-[#ECECDC]"
                )}
              />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="h-3.5 w-3.5 text-white/50" />}
            </Link>
          );
        })}

        {user?.role === "owner" && (
          <>
            <div className="mb-1.5 mt-6 px-3 text-[11px] font-semibold uppercase tracking-wider text-[#9E8E8C]">
              Settings
            </div>
            {settingsItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all",
                    active
                      ? "bg-[#FF6037] text-white shadow-sm shadow-[#FF6037]/20"
                      : "text-[#ECECDC]/70 hover:bg-white/8 hover:text-[#F5F4ED]"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-[18px] w-[18px] transition-colors",
                      active ? "text-white" : "text-[#9E8E8C] group-hover:text-[#ECECDC]"
                    )}
                  />
                  <span className="flex-1">{item.label}</span>
                  {active && <ChevronRight className="h-3.5 w-3.5 text-white/50" />}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* User section */}
      <div className="border-t border-white/10 p-3">
        <div className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF6037]/20 text-xs font-bold text-[#FF6037]">
            {user?.username?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="truncate text-[13px] font-semibold text-[#F5F4ED]">
              {user?.username}
            </div>
            <div className="text-[11px] text-[#9E8E8C] capitalize">{user?.role}</div>
          </div>
        </div>
        <button
          onClick={() => logout.mutate()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-[#9E8E8C] hover:bg-red-500/10 hover:text-red-400 transition-all cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
