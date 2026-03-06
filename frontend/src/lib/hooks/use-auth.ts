"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, setTokens, clearTokens } from "../api";
import type { User } from "../types";
import { useRouter } from "next/navigation";

interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export function useUser() {
  return useQuery<User>({
    queryKey: ["me"],
    queryFn: () => api.get("/auth/me"),
    retry: false,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (data: { username: string; password: string }) =>
      api.post<AuthResponse>("/auth/login", data),
    onSuccess: (data) => {
      setTokens(data.access, data.refresh);
      qc.invalidateQueries({ queryKey: ["me"] });
      router.push("/panel/dashboard");
    },
  });
}

export function useRegister() {
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (data: {
      company_name: string;
      industry: string;
      username: string;
      email: string;
      password: string;
    }) => api.post<AuthResponse>("/auth/register", data),
    onSuccess: (data) => {
      setTokens(data.access, data.refresh);
      qc.invalidateQueries({ queryKey: ["me"] });
      router.push("/panel/dashboard");
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: async () => {
      clearTokens();
    },
    onSuccess: () => {
      qc.clear();
      router.push("/panel/login");
    },
  });
}
