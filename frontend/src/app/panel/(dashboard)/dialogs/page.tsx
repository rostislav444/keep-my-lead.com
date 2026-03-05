"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { PaginatedResponse, Dialog } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { MessageSquare } from "lucide-react";

export default function DialogsPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");

  const params = new URLSearchParams();
  if (statusFilter) params.set("status", statusFilter);
  if (sourceFilter) params.set("source", sourceFilter);
  const qs = params.toString() ? `?${params}` : "";

  const { data, isLoading } = useQuery({
    queryKey: ["dialogs", statusFilter, sourceFilter],
    queryFn: () => api.get<PaginatedResponse<Dialog>>(`/dialogs/${qs}`),
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">Dialogs</h1>

      {/* Filters */}
      <div className="mb-4 flex gap-3">
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-40"
        >
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="active">Active</option>
          <option value="qualified">Qualified</option>
          <option value="lead">Lead</option>
          <option value="handed_off">Manager</option>
          <option value="closed">Closed</option>
        </Select>
        <Select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="w-40"
        >
          <option value="">All sources</option>
          <option value="dm">DM</option>
          <option value="comment">Comment</option>
        </Select>
      </div>

      {/* List */}
      {isLoading ? (
        <p className="text-zinc-400">Loading...</p>
      ) : !data?.results.length ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 py-16">
          <MessageSquare className="mb-3 h-10 w-10 text-zinc-300" />
          <p className="text-zinc-400">No dialogs yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {data.results.map((d) => (
            <Link
              key={d.id}
              href={`/dialogs/${d.id}`}
              className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4 hover:bg-zinc-50"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    @{d.instagram_username || `user_${d.id}`}
                  </span>
                  <Badge variant={d.source === "dm" ? "blue" : "default"}>
                    {d.source}
                  </Badge>
                  {!d.is_bot_active && (
                    <Badge variant="warning">Manual</Badge>
                  )}
                </div>
                {d.last_message && (
                  <p className="mt-1 truncate text-sm text-zinc-500">
                    <span className="font-medium">{d.last_message.role}:</span>{" "}
                    {d.last_message.text}
                  </p>
                )}
              </div>
              <div className="ml-4 flex items-center gap-3">
                <StatusBadge status={d.status} />
                <span className="text-xs text-zinc-400">
                  {new Date(d.updated_at).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: Dialog["status"] }) {
  const map: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "blue" }> = {
    new: { label: "New", variant: "blue" },
    active: { label: "Active", variant: "default" },
    qualified: { label: "Qualified", variant: "warning" },
    lead: { label: "Lead", variant: "success" },
    handed_off: { label: "Manager", variant: "warning" },
    closed: { label: "Closed", variant: "default" },
  };
  const { label, variant } = map[status] ?? { label: status, variant: "default" as const };
  return <Badge variant={variant}>{label}</Badge>;
}
