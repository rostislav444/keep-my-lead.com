"use client";

import { useDialogs, useLeads } from "@/lib/hooks";
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
  const { data: dialogs } = useDialogs();
  const { data: leads } = useLeads();

  const hotLeads = leads?.results.filter((l) => l.temperature === "hot") ?? [];
  const warmLeads = leads?.results.filter((l) => l.temperature === "warm") ?? [];
  const totalDialogs = dialogs?.count ?? 0;
  const totalLeads = leads?.count ?? 0;
  const activeDialogs =
    dialogs?.results.filter((d) => d.status === "active" || d.status === "new").length ?? 0;

  return (
    <div className="p-6">
      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={MessageSquare}
          label="Total Dialogs"
          value={totalDialogs}
          color="brand"
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
          color="aqua"
        />
        <StatCard
          icon={Flame}
          label="Hot Leads"
          value={hotLeads.length}
          color="accent"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Hot leads */}
        <div className="rounded-lg border border-zinc-100 bg-white/80 backdrop-blur-sm p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#351E1C]">Hot Leads</h2>
            <Link
              href="/panel/leads"
              className="flex items-center gap-1 text-xs text-[#FF6037] hover:text-[#e04e28] transition-colors"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {hotLeads.length === 0 ? (
            <div className="flex flex-col items-center py-8">
              <Flame className="mb-2 h-8 w-8 text-zinc-200" />
              <p className="text-sm text-[#9E8E8C]">No hot leads yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {hotLeads.slice(0, 5).map((lead) => (
                <Link
                  key={lead.id}
                  href={`/panel/dialogs?id=${lead.dialog_id}`}
                  className="flex items-center justify-between rounded-xl p-3 hover:bg-[#FF6037]/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FF6037] text-xs font-bold text-white">
                      {(lead.name || "?").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#351E1C]">
                        {lead.name || "Unknown"}
                      </p>
                      <p className="text-xs text-[#9E8E8C]">{lead.phone || "No phone"}</p>
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
        <div className="rounded-lg border border-zinc-100 bg-white/80 backdrop-blur-sm p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#351E1C]">Recent Dialogs</h2>
            <Link
              href="/panel/dialogs"
              className="flex items-center gap-1 text-xs text-[#FF6037] hover:text-[#e04e28] transition-colors"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {!dialogs?.results.length ? (
            <div className="flex flex-col items-center py-8">
              <MessageSquare className="mb-2 h-8 w-8 text-zinc-200" />
              <p className="text-sm text-[#9E8E8C]">No dialogs yet</p>
              <p className="mt-1 text-xs text-zinc-300">
                Connect Instagram to get started
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {dialogs.results.slice(0, 7).map((d) => (
                <Link
                  key={d.id}
                  href={`/panel/dialogs?id=${d.id}`}
                  className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-zinc-50 transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#351E1C] to-[#4A2B28] text-xs font-semibold text-white">
                    {(d.instagram_username || "U").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#351E1C] truncate">
                        @{d.instagram_username || `user_${d.id}`}
                      </span>
                      <StatusDot status={d.status} />
                    </div>
                    {d.last_message && (
                      <p className="truncate text-xs text-[#9E8E8C]">
                        {d.last_message.text}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-[11px] text-[#9E8E8C]">
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
  color: "brand" | "emerald" | "aqua" | "accent";
}) {
  const colorMap = {
    brand: "from-[#351E1C] to-[#4A2B28] shadow-[#351E1C]/20",
    emerald: "from-emerald-500 to-emerald-600 shadow-emerald-500/20",
    aqua: "from-[#A0C9CB] to-[#7FB3B5] shadow-[#A0C9CB]/20",
    accent: "from-[#FF6037] to-[#e04e28] shadow-[#FF6037]/20",
  };
  return (
    <div className="rounded-lg border border-zinc-100 bg-white/80 backdrop-blur-sm p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-[#9E8E8C]">{label}</p>
          <p className="mt-1 text-3xl font-bold text-[#351E1C]">{value}</p>
        </div>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br ${colorMap[color]} shadow-lg`}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    new: "text-[#FF6037]",
    active: "text-emerald-400",
    qualified: "text-purple-400",
    lead: "text-emerald-500",
    handed_off: "text-amber-400",
    closed: "text-[#9E8E8C]",
  };
  return (
    <Circle
      className={`h-2 w-2 fill-current ${colors[status] || "text-[#9E8E8C]"}`}
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
