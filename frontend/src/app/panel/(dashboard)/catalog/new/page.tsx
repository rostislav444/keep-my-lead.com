"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Category, PaginatedResponse } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function NewItemPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [context, setContext] = useState("");
  const [botInstructions, setBotInstructions] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get<PaginatedResponse<Category>>("/catalog/categories"),
  });

  const create = useMutation({
    mutationFn: (data: {
      name: string;
      short_description: string;
      context: string;
      bot_instructions: string;
      category: number | null;
    }) => api.post<{ id: number }>("/catalog/items", data),
    onSuccess: (item) => {
      qc.invalidateQueries({ queryKey: ["items"] });
      router.push(`/panel/catalog/${item.id}`);
    },
  });

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/panel/catalog">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900">New product</h1>
      </div>

      <Card>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              create.mutate({
                name,
                short_description: shortDescription,
                context,
                bot_instructions: botInstructions,
                category: categoryId ? Number(categoryId) : null,
              });
            }}
            className="space-y-4"
          >
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-600">Name</label>
              <Input
                placeholder="Product or service name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-600">Category</label>
              <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">No category</option>
                {(categories?.results ?? []).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-600">Short description</label>
              <Input
                placeholder="1-2 sentences: what is this product/service (bot always sees this)"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
              />
              <p className="mt-1 text-xs text-zinc-400">Always sent to the bot as part of the catalog overview</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-600">Full description</label>
              <Textarea
                placeholder="Prices, tariffs, FAQ, conditions, details — everything the bot needs to answer questions"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={12}
                required
                className="font-mono text-sm"
              />
              <p className="mt-1 text-xs text-zinc-400">Sent to the bot only when a user shows interest in this product</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-600">Bot instructions</label>
              <Textarea
                placeholder="What to emphasize, what to avoid, which questions to ask, how to handle objections for this product"
                value={botInstructions}
                onChange={(e) => setBotInstructions(e.target.value)}
                rows={6}
                className="font-mono text-sm"
              />
              <p className="mt-1 text-xs text-zinc-400">Specific instructions for the bot when talking about this product</p>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={create.isPending}>
                <Save className="mr-1 h-4 w-4" />
                {create.isPending ? "Creating..." : "Create"}
              </Button>
              <Link href="/panel/catalog">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
