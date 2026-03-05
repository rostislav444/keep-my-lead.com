"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api";
import type { PaginatedResponse, Item, Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Pencil, X, Check, FolderOpen } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CatalogPage() {
  const qc = useQueryClient();
  const router = useRouter();
  const [showCategories, setShowCategories] = useState(false);

  const { data: items, isLoading } = useQuery({
    queryKey: ["items"],
    queryFn: () => api.get<PaginatedResponse<Item>>("/catalog/items"),
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get<PaginatedResponse<Category>>("/catalog/categories"),
  });

  const deleteItem = useMutation({
    mutationFn: (id: number) => api.delete(`/catalog/items/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["items"] }),
  });

  const grouped = groupByCategory(items?.results ?? [], categories?.results ?? []);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Catalog</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowCategories((v) => !v)}>
            <FolderOpen className="mr-1 h-4 w-4" />
            Categories
          </Button>
          <Button onClick={() => router.push("/panel/catalog/new")}>
            <Plus className="mr-1 h-4 w-4" />
            Add product
          </Button>
        </div>
      </div>

      {showCategories && (
        <CategoriesManager categories={categories?.results ?? []} />
      )}

      {isLoading ? (
        <p className="text-zinc-400">Loading...</p>
      ) : !items?.results.length ? (
        <p className="text-zinc-400">No products yet. Add your first product.</p>
      ) : (
        <div className="space-y-8">
          {grouped.map((group) => (
            <div key={group.name}>
              <h2 className="mb-3 text-lg font-semibold text-zinc-700">{group.name}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((item) => (
                  <Link key={item.id} href={`/panel/catalog/${item.id}`}>
                    <Card className="h-full cursor-pointer transition-shadow hover:shadow-md">
                      <CardContent>
                        <div className="mb-2 flex items-start justify-between">
                          <h3 className="font-semibold">{item.name}</h3>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 shrink-0 text-red-400 hover:text-red-600"
                            onClick={(e) => {
                              e.preventDefault();
                              if (confirm("Delete this product?")) deleteItem.mutate(item.id);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <p className="line-clamp-3 text-sm text-zinc-500 whitespace-pre-wrap">
                          {item.context}
                        </p>
                        {item.source_type && (
                          <Badge className="mt-2" variant="default">
                            synced: {item.source_type}
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CategoriesManager({ categories }: { categories: Category[] }) {
  const qc = useQueryClient();
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  const create = useMutation({
    mutationFn: (name: string) => api.post("/catalog/categories", { name }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      setNewName("");
    },
  });

  const update = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      api.put(`/catalog/categories/${id}`, { name }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      qc.invalidateQueries({ queryKey: ["items"] });
      setEditingId(null);
    },
  });

  const remove = useMutation({
    mutationFn: (id: number) => api.delete(`/catalog/categories/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      qc.invalidateQueries({ queryKey: ["items"] });
    },
  });

  return (
    <Card className="mb-6">
      <CardContent>
        <h3 className="mb-3 font-semibold text-zinc-700">Categories</h3>

        <div className="mb-3 space-y-2">
          {categories.length === 0 && (
            <p className="text-sm text-zinc-400">No categories yet</p>
          )}
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-2">
              {editingId === cat.id ? (
                <>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-8 flex-1 text-sm"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && editName.trim()) {
                        update.mutate({ id: cat.id, name: editName.trim() });
                      }
                      if (e.key === "Escape") setEditingId(null);
                    }}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => {
                      if (editName.trim()) update.mutate({ id: cat.id, name: editName.trim() });
                    }}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => setEditingId(null)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm">{cat.name}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => {
                      setEditingId(cat.id);
                      setEditName(cat.name);
                    }}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-red-400 hover:text-red-600"
                    onClick={() => {
                      if (confirm(`Delete category "${cat.name}"? Products will become uncategorized.`))
                        remove.mutate(cat.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (newName.trim()) create.mutate(newName.trim());
          }}
          className="flex gap-2"
        >
          <Input
            placeholder="New category name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="h-8 text-sm"
          />
          <Button type="submit" size="sm" disabled={!newName.trim() || create.isPending}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function groupByCategory(items: Item[], categories: Category[]) {
  const catMap = new Map(categories.map((c) => [c.id, c.name]));
  const groups = new Map<string, Item[]>();

  for (const item of items) {
    const name = item.category_name ?? catMap.get(item.category!) ?? "Uncategorized";
    if (!groups.has(name)) groups.set(name, []);
    groups.get(name)!.push(item);
  }

  return Array.from(groups.entries()).map(([name, items]) => ({ name, items }));
}
