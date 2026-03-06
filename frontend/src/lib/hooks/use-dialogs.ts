"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type { PaginatedResponse, Dialog, DialogDetail } from "../types";

export function useDialogs(statusFilter?: string) {
  const params = new URLSearchParams();
  if (statusFilter) params.set("status", statusFilter);
  const qs = params.toString() ? `?${params}` : "";

  return useQuery({
    queryKey: ["dialogs", statusFilter ?? ""],
    queryFn: () => api.get<PaginatedResponse<Dialog>>(`/dialogs/${qs}`),
  });
}

export function useDialog(id: number | null) {
  return useQuery({
    queryKey: ["dialog", id],
    queryFn: () => api.get<DialogDetail>(`/dialogs/${id}`),
    enabled: !!id,
    refetchInterval: 5000,
  });
}

export function useSendMessage(dialogId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (text: string) =>
      api.post(`/dialogs/${dialogId}/send`, { text }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dialog", dialogId] });
      qc.invalidateQueries({ queryKey: ["dialogs"] });
    },
  });
}

export function useHandoff(dialogId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post(`/dialogs/${dialogId}/handoff`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dialog", dialogId] });
      qc.invalidateQueries({ queryKey: ["dialogs"] });
    },
  });
}

export function useReturnToBot(dialogId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post(`/dialogs/${dialogId}/return-to-bot`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dialog", dialogId] });
      qc.invalidateQueries({ queryKey: ["dialogs"] });
    },
  });
}
