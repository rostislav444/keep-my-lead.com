"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import type { PaginatedResponse, Lead } from "../types";

export function useLeads() {
  return useQuery({
    queryKey: ["leads"],
    queryFn: () => api.get<PaginatedResponse<Lead>>("/leads"),
  });
}
