"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import type { PaginatedResponse, InstagramAccount } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Instagram, Trash2, Plus, CheckCircle, AlertCircle } from "lucide-react";

export default function AccountsPage() {
  const qc = useQueryClient();
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const error = searchParams.get("error");

  const { data, isLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => api.get<PaginatedResponse<InstagramAccount>>("/settings/accounts"),
  });

  const disconnect = useMutation({
    mutationFn: (id: number) => api.delete(`/settings/accounts/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["accounts"] }),
  });

  const handleConnect = async () => {
    try {
      const resp = await api.get<{ auth_url: string }>("/settings/accounts/connect");
      window.location.href = resp.auth_url;
    } catch {
      alert("Failed to get Instagram auth URL. Check Meta App configuration.");
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Instagram Accounts</h1>
        <Button onClick={handleConnect}>
          <Plus className="mr-1 h-4 w-4" />
          Connect account
        </Button>
      </div>

      {success && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          <CheckCircle className="h-4 w-4" />
          Account {success} successfully!
        </div>
      )}

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          Connection error: {error}
        </div>
      )}

      {isLoading ? (
        <p className="text-zinc-400">Loading...</p>
      ) : !data?.results.length ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <Instagram className="mb-3 h-12 w-12 text-zinc-300" />
            <p className="mb-1 font-medium text-zinc-600">No accounts connected</p>
            <p className="text-sm text-zinc-400">Connect your Instagram Business account to start</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {data.results.map((acc) => (
            <Card key={acc.id}>
              <CardContent className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Instagram className="h-5 w-5 text-pink-500" />
                  <div>
                    <span className="font-medium">@{acc.username}</span>
                    <p className="text-xs text-zinc-400">
                      Connected {new Date(acc.connected_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={acc.is_active ? "success" : "destructive"}>
                    {acc.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-red-500"
                    onClick={() => {
                      if (confirm("Disconnect this account?")) disconnect.mutate(acc.id);
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
