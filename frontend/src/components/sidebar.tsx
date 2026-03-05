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
    <aside className="flex h-screen w-[260px] flex-col border-r border-zinc-100 bg-white/70 backdrop-blur-xl">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500 shadow-sm">
          <Bot className="h-5 w-5 text-white" />
        </div>
        <span className="text-[15px] font-semibold text-zinc-900">Keep My Lead</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 pt-2">
        <div className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          Main
        </div>
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group mb-0.5 flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
                active
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
              )}
            >
              <item.icon
                className={cn(
                  "h-[18px] w-[18px] transition-colors",
                  active ? "text-indigo-500" : "text-zinc-400 group-hover:text-zinc-600"
                )}
              />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="h-3.5 w-3.5 text-indigo-400" />}
            </Link>
          );
        })}

        {user?.role === "owner" && (
          <>
            <div className="mb-1.5 mt-6 px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Settings
            </div>
            {settingsItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group mb-0.5 flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
                    active
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-[18px] w-[18px] transition-colors",
                      active ? "text-indigo-500" : "text-zinc-400 group-hover:text-zinc-600"
                    )}
                  />
                  <span className="flex-1">{item.label}</span>
                  {active && <ChevronRight className="h-3.5 w-3.5 text-indigo-400" />}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* User section */}
      <div className="border-t border-zinc-100 p-3">
        <div className="mb-1 flex items-center gap-3 rounded-xl px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-xs font-semibold text-zinc-600">
            {user?.username?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="truncate text-[13px] font-medium text-zinc-900">
              {user?.username}
            </div>
            <div className="text-[11px] text-zinc-400 capitalize">{user?.role}</div>
          </div>
        </div>
        <button
          onClick={() => logout.mutate()}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-all duration-200 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
