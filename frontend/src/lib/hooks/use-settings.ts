"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type { PaginatedResponse, BotConfig, InstagramAccount, User } from "../types";

// Bot config
export function useBotConfig() {
  return useQuery({
    queryKey: ["botConfig"],
    queryFn: () => api.get<BotConfig>("/settings/bot"),
  });
}

export function useUpdateBotConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<BotConfig>) => api.put("/settings/bot", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["botConfig"] }),
  });
}

// Instagram accounts
export function useAccounts() {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: () =>
      api.get<PaginatedResponse<InstagramAccount>>("/settings/accounts"),
  });
}

export function useDisconnectAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/settings/accounts/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["accounts"] }),
  });
}

// Team
export function useTeam() {
  return useQuery({
    queryKey: ["team"],
    queryFn: () => api.get<User[]>("/auth/team"),
  });
}

export function useAddTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { username: string; email: string; password: string }) =>
      api.post("/auth/team", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["team"] }),
  });
}

export function useRemoveTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/auth/team/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["team"] }),
  });
}

// Telegram
export function useTelegramLink() {
  return useQuery({
    queryKey: ["telegram-link"],
    queryFn: () =>
      api.get<{ link: string; bot_username: string; connected: boolean }>(
        "/auth/telegram/link"
      ),
  });
}

export function useDisconnectTelegram() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete("/auth/telegram/link"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      qc.invalidateQueries({ queryKey: ["telegram-link"] });
    },
  });
}

// Integrations
interface CRMConfig {
  id: number;
  source_type: string;
  api_url: string;
  sync_interval_minutes: number;
  last_synced_at: string | null;
  is_active: boolean;
}

export function useIntegrations() {
  return useQuery({
    queryKey: ["integrations"],
    queryFn: () => api.get<{ results: CRMConfig[] }>("/integrations"),
  });
}

export function useAddIntegration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { source_type: string; api_key: string; api_url: string }) =>
      api.post("/integrations", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["integrations"] }),
  });
}

export function useRemoveIntegration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/integrations/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["integrations"] }),
  });
}

export function useSyncIntegration() {
  return useMutation({
    mutationFn: (id: number) => api.post(`/integrations/${id}/sync`),
  });
}

export type { CRMConfig };
