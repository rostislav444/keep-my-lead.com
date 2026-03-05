"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import type { User } from "./types";
import { useRouter } from "next/navigation";

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
      api.post<User>("/auth/login", data),
    onSuccess: () => {
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
    }) => api.post<User>("/auth/register", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      router.push("/panel/dashboard");
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: () => api.post("/auth/logout"),
    onSuccess: () => {
      qc.clear();
      router.push("/panel/login");
    },
  });
}
