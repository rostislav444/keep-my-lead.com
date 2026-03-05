"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { PaginatedResponse, Lead } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Download, Phone } from "lucide-react";

export default function LeadsPage() {
  const [tempFilter, setTempFilter] = useState("");

  const qs = tempFilter ? `?temperature=${tempFilter}` : "";

  const { data, isLoading } = useQuery({
    queryKey: ["leads", tempFilter],
    queryFn: () => api.get<PaginatedResponse<Lead>>(`/leads${qs}`),
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Leads</h1>
        <a href="/api/leads/export/csv" download>
          <Button variant="outline" size="sm">
            <Download className="mr-1 h-4 w-4" />
            Export CSV
          </Button>
        </a>
      </div>

      <div className="mb-4">
        <Select
          value={tempFilter}
          onChange={(e) => setTempFilter(e.target.value)}
          className="w-40"
        >
          <option value="">All temperatures</option>
          <option value="hot">Hot</option>
          <option value="warm">Warm</option>
          <option value="cold">Cold</option>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-zinc-400">Loading...</p>
      ) : !data?.results.length ? (
        <p className="text-zinc-400">No leads yet</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50">
              <tr>
                <th className="px-4 py-3 font-medium text-zinc-500">Name</th>
                <th className="px-4 py-3 font-medium text-zinc-500">Phone</th>
                <th className="px-4 py-3 font-medium text-zinc-500">Interest</th>
                <th className="px-4 py-3 font-medium text-zinc-500">Product</th>
                <th className="px-4 py-3 font-medium text-zinc-500">Temp</th>
                <th className="px-4 py-3 font-medium text-zinc-500">Date</th>
                <th className="px-4 py-3 font-medium text-zinc-500"></th>
              </tr>
            </thead>
            <tbody>
              {data.results.map((lead) => (
                <tr key={lead.id} className="border-b border-zinc-100 last:border-0">
                  <td className="px-4 py-3 font-medium">{lead.name || "—"}</td>
                  <td className="px-4 py-3">
                    {lead.phone ? (
                      <a
                        href={`tel:${lead.phone}`}
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <Phone className="h-3 w-3" />
                        {lead.phone}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">{lead.interest || "—"}</td>
                  <td className="px-4 py-3 text-zinc-500">{lead.product_name || "—"}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        lead.temperature === "hot"
                          ? "destructive"
                          : lead.temperature === "warm"
                          ? "warning"
                          : "default"
                      }
                    >
                      {lead.temperature}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dialogs/${lead.dialog_id}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Dialog
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
