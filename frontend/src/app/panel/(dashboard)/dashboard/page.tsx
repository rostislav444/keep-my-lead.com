"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { PaginatedResponse, Dialog, Lead } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  MessageSquare,
  Users,
  Flame,
  TrendingUp,
  ArrowRight,
  Circle,
} from "lucide-react";

export default function DashboardPage() {
  const { data: dialogs } = useQuery({
    queryKey: ["dialogs"],
    queryFn: () => api.get<PaginatedResponse<Dialog>>("/dialogs"),
  });

  const { data: leads } = useQuery({
    queryKey: ["leads"],
    queryFn: () => api.get<PaginatedResponse<Lead>>("/leads"),
  });

  const hotLeads = leads?.results.filter((l) => l.temperature === "hot") ?? [];
  const warmLeads = leads?.results.filter((l) => l.temperature === "warm") ?? [];
  const totalDialogs = dialogs?.count ?? 0;
  const totalLeads = leads?.count ?? 0;
  const activeDialogs =
    dialogs?.results.filter((d) => d.status === "active" || d.status === "new").length ?? 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-400">Overview of your conversations and leads</p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={MessageSquare}
          label="Total Dialogs"
          value={totalDialogs}
          color="indigo"
        />
        <StatCard
          icon={TrendingUp}
          label="Active Now"
          value={activeDialogs}
          color="emerald"
        />
        <StatCard
          icon={Users}
          label="Total Leads"
          value={totalLeads}
          color="blue"
        />
        <StatCard
          icon={Flame}
          label="Hot Leads"
          value={hotLeads.length}
          color="rose"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Hot leads */}
        <div className="rounded-2xl border border-zinc-100 bg-white/80 backdrop-blur-sm p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900">Hot Leads</h2>
            <Link
              href="/panel/leads"
              className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-600 transition-colors"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {hotLeads.length === 0 ? (
            <div className="flex flex-col items-center py-8">
              <Flame className="mb-2 h-8 w-8 text-zinc-200" />
              <p className="text-sm text-zinc-400">No hot leads yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {hotLeads.slice(0, 5).map((lead) => (
                <Link
                  key={lead.id}
                  href={`/panel/dialogs`}
                  className="flex items-center justify-between rounded-xl p-3 hover:bg-zinc-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-orange-400 text-xs font-bold text-white">
                      {(lead.name || "?").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900">
                        {lead.name || "Unknown"}
                      </p>
                      <p className="text-xs text-zinc-400">{lead.phone || "No phone"}</p>
                    </div>
                  </div>
                  {lead.product_name && (
                    <Badge variant="blue">{lead.product_name}</Badge>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent dialogs */}
        <div className="rounded-2xl border border-zinc-100 bg-white/80 backdrop-blur-sm p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900">Recent Dialogs</h2>
            <Link
              href="/panel/dialogs"
              className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-600 transition-colors"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {!dialogs?.results.length ? (
            <div className="flex flex-col items-center py-8">
              <MessageSquare className="mb-2 h-8 w-8 text-zinc-200" />
              <p className="text-sm text-zinc-400">No dialogs yet</p>
              <p className="mt-1 text-xs text-zinc-300">
                Connect Instagram to get started
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {dialogs.results.slice(0, 7).map((d) => (
                <Link
                  key={d.id}
                  href="/panel/dialogs"
                  className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-zinc-50 transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-xs font-semibold text-white">
                    {(d.instagram_username || "U").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-zinc-900 truncate">
                        @{d.instagram_username || `user_${d.id}`}
                      </span>
                      <StatusDot status={d.status} />
                    </div>
                    {d.last_message && (
                      <p className="truncate text-xs text-zinc-400">
                        {d.last_message.text}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-[11px] text-zinc-300">
                    {formatTime(d.updated_at)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof MessageSquare;
  label: string;
  value: number;
  color: "indigo" | "emerald" | "blue" | "rose";
}) {
  const colorMap = {
    indigo: "from-indigo-500 to-indigo-600 shadow-indigo-500/20",
    emerald: "from-emerald-500 to-emerald-600 shadow-emerald-500/20",
    blue: "from-blue-500 to-blue-600 shadow-blue-500/20",
    rose: "from-rose-500 to-rose-600 shadow-rose-500/20",
  };
  return (
    <div className="rounded-2xl border border-zinc-100 bg-white/80 backdrop-blur-sm p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-zinc-400">{label}</p>
          <p className="mt-1 text-3xl font-bold text-zinc-900">{value}</p>
        </div>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${colorMap[color]} shadow-lg`}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    new: "text-indigo-400",
    active: "text-emerald-400",
    qualified: "text-purple-400",
    lead: "text-emerald-500",
    handed_off: "text-amber-400",
    closed: "text-zinc-300",
  };
  return (
    <Circle
      className={`h-2 w-2 fill-current ${colors[status] || "text-zinc-300"}`}
    />
  );
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return date.toLocaleDateString([], { day: "numeric", month: "short" });
}
