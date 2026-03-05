"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Item, Category, PaginatedResponse } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Pencil, Trash2, X, Save } from "lucide-react";
import Link from "next/link";

export default function CatalogDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);

  const { data: item, isLoading } = useQuery({
    queryKey: ["item", id],
    queryFn: () => api.get<Item>(`/catalog/items/${id}`),
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get<PaginatedResponse<Category>>("/catalog/categories"),
  });

  const deleteItem = useMutation({
    mutationFn: () => api.delete(`/catalog/items/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["items"] });
      router.push("/panel/catalog");
    },
  });

  if (isLoading) return <p className="text-zinc-400">Loading...</p>;
  if (!item) return <p className="text-zinc-400">Product not found</p>;

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/panel/catalog">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900">{item.name}</h1>
        {item.category_name && (
          <Badge variant="blue">{item.category_name}</Badge>
        )}
      </div>

      {editing ? (
        <EditForm
          item={item}
          categories={categories?.results ?? []}
          onSaved={() => {
            setEditing(false);
            qc.invalidateQueries({ queryKey: ["item", id] });
            qc.invalidateQueries({ queryKey: ["items"] });
          }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <ViewMode
          item={item}
          onEdit={() => setEditing(true)}
          onDelete={() => {
            if (confirm("Delete this product?")) deleteItem.mutate();
          }}
        />
      )}
    </div>
  );
}

function ViewMode({
  item,
  onEdit,
  onDelete,
}: {
  item: Item;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card>
      <CardContent>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {item.source_type && (
              <Badge variant="default">synced: {item.source_type}</Badge>
            )}
            {!item.is_active && (
              <Badge variant="destructive">Inactive</Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Pencil className="mr-1 h-3.5 w-3.5" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-500 hover:text-red-700"
              onClick={onDelete}
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        </div>

        <div className="rounded-lg bg-zinc-50 p-4">
          <h3 className="mb-2 text-sm font-medium text-zinc-500">Bot context</h3>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-800">
            {item.context}
          </p>
        </div>

        <div className="mt-4 flex gap-6 text-xs text-zinc-400">
          <span>Created: {new Date(item.created_at).toLocaleDateString()}</span>
          <span>Updated: {new Date(item.updated_at).toLocaleDateString()}</span>
          {item.synced_at && (
            <span>Last sync: {new Date(item.synced_at).toLocaleString()}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function EditForm({
  item,
  categories,
  onSaved,
  onCancel,
}: {
  item: Item;
  categories: Category[];
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(item.name);
  const [context, setContext] = useState(item.context);
  const [categoryId, setCategoryId] = useState(item.category?.toString() ?? "");

  const save = useMutation({
    mutationFn: (data: { name: string; context: string; category: number | null }) =>
      api.put(`/catalog/items/${item.id}`, data),
    onSuccess: onSaved,
  });

  return (
    <Card>
      <CardContent>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-zinc-700">Editing</h2>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate({
              name,
              context,
              category: categoryId ? Number(categoryId) : null,
            });
          }}
          className="space-y-4"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-600">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-600">Category</label>
            <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-600">Bot context</label>
            <Textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={20}
              required
              className="font-mono text-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={save.isPending}>
              <Save className="mr-1 h-4 w-4" />
              {save.isPending ? "Saving..." : "Save"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
