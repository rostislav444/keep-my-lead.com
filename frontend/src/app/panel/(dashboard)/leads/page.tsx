"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useLeads } from "@/lib/hooks";
import type { Lead } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Download,
  Phone,
  Flame,
  Users,
  MessageSquare,
  Thermometer,
} from "lucide-react";

const TEMP_ORDER = { hot: 0, warm: 1, cold: 2 } as const;

const TEMP_STYLES = {
  hot: {
    badge: "bg-[#FF6037]/10 text-[#FF6037]",
    dot: "bg-[#FF6037]",
    row: "bg-[#FF6037]/[0.03]",
  },
  warm: {
    badge: "bg-amber-50 text-amber-700",
    dot: "bg-amber-400",
    row: "",
  },
  cold: {
    badge: "bg-[#A0C9CB]/15 text-[#5A9A9D]",
    dot: "bg-[#A0C9CB]",
    row: "",
  },
} as const;

const FILTERS = [
  { key: "", label: "All" },
  { key: "hot", label: "Hot" },
  { key: "warm", label: "Warm" },
  { key: "cold", label: "Cold" },
] as const;

export default function LeadsPage() {
  const [filter, setFilter] = useState("");
  const { data, isLoading } = useLeads();

  const sorted = useMemo(() => {
    if (!data?.results) return [];
    const filtered = filter
      ? data.results.filter((l) => l.temperature === filter)
      : data.results;
    return [...filtered].sort(
      (a, b) => TEMP_ORDER[a.temperature] - TEMP_ORDER[b.temperature]
    );
  }, [data, filter]);

  const counts = useMemo(() => {
    if (!data?.results) return { "": 0, hot: 0, warm: 0, cold: 0 };
    const r = data.results;
    return {
      "": r.length,
      hot: r.filter((l) => l.temperature === "hot").length,
      warm: r.filter((l) => l.temperature === "warm").length,
      cold: r.filter((l) => l.temperature === "cold").length,
    };
  }, [data]);

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-6 shrink-0">
        <div className="flex items-center gap-6">
          <h1 className="text-lg font-semibold text-[#351E1C]">Leads</h1>
          {/* Filter tabs */}
          <div className="flex items-center gap-1 rounded-lg bg-zinc-100 p-1">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all cursor-pointer",
                  filter === f.key
                    ? "bg-white text-[#351E1C] shadow-sm"
                    : "text-zinc-500 hover:text-zinc-700"
                )}
              >
                {f.key && (
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      f.key === "hot"
                        ? "bg-[#FF6037]"
                        : f.key === "warm"
                        ? "bg-amber-400"
                        : "bg-[#A0C9CB]"
                    )}
                  />
                )}
                {f.label}
                <span className="ml-0.5 text-[10px] text-zinc-400">
                  {counts[f.key as keyof typeof counts]}
                </span>
              </button>
            ))}
          </div>
        </div>
        <a href="/api/leads/export/csv/" download>
          <button className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors cursor-pointer">
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
        </a>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#FF6037]/20 border-t-[#FF6037]" />
        </div>
      ) : !sorted.length ? (
        <div className="flex flex-1 flex-col items-center justify-center">
          <Users className="mb-3 h-10 w-10 text-zinc-200" />
          <p className="text-sm text-zinc-400">
            {filter ? `No ${filter} leads` : "No leads yet"}
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-zinc-50/95 backdrop-blur-sm z-10">
              <tr className="border-b border-zinc-200">
                <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#9E8E8C]">
                  Name
                </th>
                <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#9E8E8C]">
                  Phone
                </th>
                <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#9E8E8C]">
                  Interest / Product
                </th>
                <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#9E8E8C]">
                  Temperature
                </th>
                <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#9E8E8C]">
                  Date
                </th>
                <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#9E8E8C]">
                  Dialog
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((lead) => (
                <LeadRow key={lead.id} lead={lead} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function LeadRow({ lead }: { lead: Lead }) {
  const style = TEMP_STYLES[lead.temperature];

  return (
    <tr
      className={cn(
        "border-b border-zinc-100 last:border-0 transition-colors hover:bg-zinc-50",
        style.row
      )}
    >
      {/* Name */}
      <td className="px-6 py-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
              lead.temperature === "hot"
                ? "bg-[#FF6037]"
                : lead.temperature === "warm"
                ? "bg-amber-400"
                : "bg-[#A0C9CB]"
            )}
          >
            {(lead.name || "?").charAt(0).toUpperCase()}
          </div>
          <span className="font-medium text-[#351E1C]">
            {lead.name || "Unknown"}
          </span>
        </div>
      </td>

      {/* Phone */}
      <td className="px-6 py-3">
        {lead.phone ? (
          <a
            href={`tel:${lead.phone}`}
            className="inline-flex items-center gap-1.5 text-[#FF6037] hover:text-[#e04e28] font-medium transition-colors"
          >
            <Phone className="h-3.5 w-3.5" />
            {lead.phone}
          </a>
        ) : (
          <span className="text-zinc-300">--</span>
        )}
      </td>

      {/* Interest / Product */}
      <td className="px-6 py-3">
        {lead.product_name ? (
          <span className="inline-flex items-center rounded-md bg-[#351E1C]/5 px-2 py-0.5 text-xs font-medium text-[#351E1C]">
            {lead.product_name}
          </span>
        ) : lead.interest ? (
          <span className="text-zinc-500 text-[13px]">{lead.interest}</span>
        ) : (
          <span className="text-zinc-300">--</span>
        )}
      </td>

      {/* Temperature */}
      <td className="px-6 py-3">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
            style.badge
          )}
        >
          <Flame className="h-3 w-3" />
          {lead.temperature}
        </span>
      </td>

      {/* Date */}
      <td className="px-6 py-3 text-xs text-[#9E8E8C]">
        {new Date(lead.created_at).toLocaleDateString()}
      </td>

      {/* Dialog link */}
      <td className="px-6 py-3">
        <Link
          href={`/panel/dialogs?id=${lead.dialog_id}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-[#FF6037] hover:text-[#e04e28] transition-colors"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Open
        </Link>
      </td>
    </tr>
  );
}
