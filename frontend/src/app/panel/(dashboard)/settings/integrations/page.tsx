"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plug, Trash2, RefreshCw, Plus, X } from "lucide-react";

interface CRMConfig {
  id: number;
  source_type: string;
  api_url: string;
  sync_interval_minutes: number;
  last_synced_at: string | null;
  is_active: boolean;
}

export default function IntegrationsPage() {
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ source_type: "moami", api_key: "", api_url: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["integrations"],
    queryFn: () => api.get<{ results: CRMConfig[] }>("/integrations"),
  });

  const addIntegration = useMutation({
    mutationFn: (data: typeof form) => api.post("/integrations", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["integrations"] });
      setAdding(false);
    },
  });

  const removeIntegration = useMutation({
    mutationFn: (id: number) => api.delete(`/integrations/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["integrations"] }),
  });

  const syncNow = useMutation({
    mutationFn: (id: number) => api.post(`/integrations/${id}/sync`),
  });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Integrations</h1>
        <Button onClick={() => setAdding(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Add integration
        </Button>
      </div>

      {adding && (
        <Card className="mb-6">
          <CardContent>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">New integration</h3>
              <Button size="icon" variant="ghost" onClick={() => setAdding(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addIntegration.mutate(form);
              }}
              className="space-y-3"
            >
              <Select value={form.source_type} onChange={set("source_type")}>
                <option value="moami">Moami CRM</option>
              </Select>
              <Input placeholder="API Key" value={form.api_key} onChange={set("api_key")} required type="password" />
              <Input placeholder="API URL (optional)" value={form.api_url} onChange={set("api_url")} />
              <Button type="submit" disabled={addIntegration.isPending}>
                {addIntegration.isPending ? "Connecting..." : "Connect"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <p className="text-zinc-400">Loading...</p>
      ) : !data?.results.length ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <Plug className="mb-3 h-12 w-12 text-zinc-300" />
            <p className="text-zinc-400">No integrations connected</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {data.results.map((cfg) => (
            <Card key={cfg.id}>
              <CardContent className="flex items-center justify-between">
                <div>
                  <span className="font-medium capitalize">{cfg.source_type}</span>
                  <p className="text-xs text-zinc-400">
                    Last synced: {cfg.last_synced_at ? new Date(cfg.last_synced_at).toLocaleString() : "never"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={cfg.is_active ? "success" : "default"}>
                    {cfg.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={() => syncNow.mutate(cfg.id)}>
                    <RefreshCw className="mr-1 h-3 w-3" />
                    Sync
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-red-500"
                    onClick={() => {
                      if (confirm("Remove integration?")) removeIntegration.mutate(cfg.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
