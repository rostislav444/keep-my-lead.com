"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { PaginatedResponse, Lead } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Download,
  Phone,
  Flame,
  Users,
  LayoutList,
  Columns3,
} from "lucide-react";

export default function LeadsPage() {
  const [view, setView] = useState<"table" | "kanban">("kanban");

  const { data, isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: () => api.get<PaginatedResponse<Lead>>("/leads"),
  });

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)]">
      <div className="mb-5 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Leads</h1>
          <p className="mt-1 text-sm text-zinc-400">
            {data?.count ?? 0} total leads collected
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-xl border border-zinc-100 bg-white/80 p-1">
            <button
              onClick={() => setView("kanban")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer",
                view === "kanban"
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              <Columns3 className="h-3.5 w-3.5" />
              Board
            </button>
            <button
              onClick={() => setView("table")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer",
                view === "table"
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              <LayoutList className="h-3.5 w-3.5" />
              Table
            </button>
          </div>
          <a href="/api/leads/export/csv" download>
            <Button variant="outline" size="sm">
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Export
            </Button>
          </a>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-500" />
        </div>
      ) : !data?.results.length ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200">
          <Users className="mb-3 h-10 w-10 text-zinc-200" />
          <p className="text-sm text-zinc-400">No leads yet</p>
        </div>
      ) : view === "kanban" ? (
        <KanbanView leads={data.results} />
      ) : (
        <TableView leads={data.results} />
      )}
    </div>
  );
}

/* ---- Kanban View ---- */

const COLUMNS = [
  {
    key: "cold" as const,
    label: "Cold",
    gradient: "from-blue-400 to-cyan-400",
    bg: "bg-blue-50/50",
    border: "border-blue-100",
    dot: "bg-blue-400",
  },
  {
    key: "warm" as const,
    label: "Warm",
    gradient: "from-amber-400 to-yellow-400",
    bg: "bg-amber-50/50",
    border: "border-amber-100",
    dot: "bg-amber-400",
  },
  {
    key: "hot" as const,
    label: "Hot",
    gradient: "from-rose-400 to-orange-400",
    bg: "bg-rose-50/50",
    border: "border-rose-100",
    dot: "bg-rose-400",
  },
];

function KanbanView({ leads }: { leads: Lead[] }) {
  return (
    <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const items = leads.filter((l) => l.temperature === col.key);
        return (
          <div
            key={col.key}
            className={cn(
              "flex w-[320px] shrink-0 flex-col rounded-2xl border p-3",
              col.bg,
              col.border
            )}
          >
            {/* Column header */}
            <div className="mb-3 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className={cn("h-2.5 w-2.5 rounded-full", col.dot)} />
                <span className="text-sm font-semibold text-zinc-700">
                  {col.label}
                </span>
              </div>
              <span className="rounded-lg bg-white/80 px-2 py-0.5 text-xs font-medium text-zinc-500">
                {items.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex-1 space-y-2 overflow-y-auto">
              {items.map((lead) => (
                <LeadCard key={lead.id} lead={lead} gradient={col.gradient} />
              ))}
              {items.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-zinc-300">
                  <Users className="mb-1 h-6 w-6" />
                  <span className="text-xs">No leads</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LeadCard({
  lead,
  gradient,
}: {
  lead: Lead;
  gradient: string;
}) {
  return (
    <Link href="/panel/dialogs" className="block">
      <div className="rounded-xl border border-white/60 bg-white p-3.5 shadow-sm hover:shadow-md transition-all cursor-pointer">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white",
              gradient
            )}
          >
            {(lead.name || "?").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-zinc-900 truncate">
              {lead.name || "Unknown"}
            </p>
            {lead.phone && (
              <a
                href={`tel:${lead.phone}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-600 mt-0.5"
              >
                <Phone className="h-3 w-3" />
                {lead.phone}
              </a>
            )}
          </div>
        </div>
        {(lead.interest || lead.product_name) && (
          <div className="mt-2.5 flex flex-wrap gap-1">
            {lead.product_name && (
              <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-600">
                {lead.product_name}
              </span>
            )}
            {lead.interest && !lead.product_name && (
              <span className="truncate text-[11px] text-zinc-400">
                {lead.interest}
              </span>
            )}
          </div>
        )}
        <div className="mt-2 text-[10px] text-zinc-300">
          {new Date(lead.created_at).toLocaleDateString()}
        </div>
      </div>
    </Link>
  );
}

/* ---- Table View ---- */

function TableView({ leads }: { leads: Lead[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white/80 backdrop-blur-sm shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-100">
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Name
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Phone
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Interest
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Product
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Temp
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Date
              </th>
              <th className="px-5 py-3.5"></th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr
                key={lead.id}
                className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50/50 transition-colors"
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white",
                        lead.temperature === "hot"
                          ? "bg-gradient-to-br from-rose-400 to-orange-400"
                          : lead.temperature === "warm"
                          ? "bg-gradient-to-br from-amber-400 to-yellow-400"
                          : "bg-gradient-to-br from-blue-400 to-cyan-400"
                      )}
                    >
                      {(lead.name || "?").charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-zinc-900">
                      {lead.name || "—"}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  {lead.phone ? (
                    <a
                      href={`tel:${lead.phone}`}
                      className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 transition-colors"
                    >
                      <Phone className="h-3 w-3" />
                      {lead.phone}
                    </a>
                  ) : (
                    <span className="text-zinc-300">—</span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-zinc-500">
                  {lead.interest || <span className="text-zinc-300">—</span>}
                </td>
                <td className="px-5 py-3.5">
                  {lead.product_name ? (
                    <Badge variant="blue">{lead.product_name}</Badge>
                  ) : (
                    <span className="text-zinc-300">—</span>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <Badge
                    variant={
                      lead.temperature === "hot"
                        ? "destructive"
                        : lead.temperature === "warm"
                        ? "warning"
                        : "default"
                    }
                  >
                    <Flame className="mr-1 h-3 w-3" />
                    {lead.temperature}
                  </Badge>
                </td>
                <td className="px-5 py-3.5 text-xs text-zinc-400">
                  {new Date(lead.created_at).toLocaleDateString()}
                </td>
                <td className="px-5 py-3.5">
                  <Link
                    href="/panel/dialogs"
                    className="text-xs font-medium text-indigo-500 hover:text-indigo-600 transition-colors"
                  >
                    View dialog
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
