"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { PaginatedResponse, Dialog, Lead } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { MessageSquare, Users, Flame } from "lucide-react";

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
  const totalDialogs = dialogs?.count ?? 0;
  const totalLeads = leads?.count ?? 0;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">Dashboard</h1>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="rounded-lg bg-blue-50 p-3">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-zinc-500">Total Dialogs</p>
              <p className="text-2xl font-bold">{totalDialogs}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="rounded-lg bg-green-50 p-3">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-zinc-500">Total Leads</p>
              <p className="text-2xl font-bold">{totalLeads}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="rounded-lg bg-red-50 p-3">
              <Flame className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-zinc-500">Hot Leads</p>
              <p className="text-2xl font-bold">{hotLeads.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hot leads */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Hot Leads (need attention)</CardTitle>
        </CardHeader>
        <CardContent>
          {hotLeads.length === 0 ? (
            <p className="text-sm text-zinc-400">No hot leads yet</p>
          ) : (
            <div className="space-y-3">
              {hotLeads.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/dialogs/${lead.dialog_id}`}
                  className="flex items-center justify-between rounded-md border border-zinc-100 p-3 hover:bg-zinc-50"
                >
                  <div>
                    <span className="font-medium">{lead.name || "Unknown"}</span>
                    <span className="ml-3 text-sm text-zinc-500">{lead.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {lead.product_name && (
                      <Badge variant="blue">{lead.product_name}</Badge>
                    )}
                    <Badge variant="destructive">HOT</Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent dialogs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Dialogs</CardTitle>
        </CardHeader>
        <CardContent>
          {!dialogs?.results.length ? (
            <p className="text-sm text-zinc-400">No dialogs yet. Connect Instagram to get started.</p>
          ) : (
            <div className="space-y-2">
              {dialogs.results.slice(0, 10).map((d) => (
                <Link
                  key={d.id}
                  href={`/dialogs/${d.id}`}
                  className="flex items-center justify-between rounded-md border border-zinc-100 p-3 hover:bg-zinc-50"
                >
                  <div>
                    <span className="font-medium">
                      @{d.instagram_username || d.id}
                    </span>
                    {d.last_message && (
                      <p className="mt-0.5 text-sm text-zinc-500 truncate max-w-md">
                        {d.last_message.text}
                      </p>
                    )}
                  </div>
                  <StatusBadge status={d.status} />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
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
