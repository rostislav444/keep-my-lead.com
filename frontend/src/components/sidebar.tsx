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

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-zinc-200 bg-white">
      <div className="flex h-14 items-center border-b border-zinc-200 px-4">
        <span className="text-lg font-bold text-zinc-900">LeadBot</span>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <div className="mb-2 px-2 text-xs font-semibold uppercase text-zinc-400">
          Main
        </div>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "mb-0.5 flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              pathname === item.href || pathname.startsWith(item.href + "/")
                ? "bg-zinc-100 font-medium text-zinc-900"
                : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}

        {user?.role === "owner" && (
          <>
            <div className="mb-2 mt-6 px-2 text-xs font-semibold uppercase text-zinc-400">
              Settings
            </div>
            {settingsItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "mb-0.5 flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  pathname === item.href || pathname.startsWith(item.href + "/")
                    ? "bg-zinc-100 font-medium text-zinc-900"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </>
        )}
      </nav>

      <div className="border-t border-zinc-200 p-3">
        <div className="mb-2 px-3 text-sm text-zinc-600">
          {user?.username}
        </div>
        <button
          onClick={() => logout.mutate()}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
