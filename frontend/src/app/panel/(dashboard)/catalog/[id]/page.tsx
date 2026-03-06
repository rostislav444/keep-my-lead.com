"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useItem, useCategories, useDeleteItem, useUpdateItem } from "@/lib/hooks";
import type { Item, Category } from "@/lib/types";
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
  const [editing, setEditing] = useState(false);

  const { data: item, isLoading } = useItem(id);
  const { data: categories } = useCategories();
  const deleteItem = useDeleteItem();

  if (isLoading) return <p className="text-zinc-400">Loading...</p>;
  if (!item) return <p className="text-zinc-400">Product not found</p>;

  return (
    <div className="p-6">
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
          onSaved={() => setEditing(false)}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <ViewMode
          item={item}
          onEdit={() => setEditing(true)}
          onDelete={() => {
            if (confirm("Delete this product?")) deleteItem.mutate(Number(id), { onSuccess: () => router.push("/panel/catalog") });
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

        {item.short_description && (
          <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 p-3">
            <h3 className="mb-1 text-xs font-medium text-blue-600">Short description (always visible to bot)</h3>
            <p className="text-sm text-blue-900">{item.short_description}</p>
          </div>
        )}

        <div className="rounded-lg bg-zinc-50 p-4">
          <h3 className="mb-2 text-sm font-medium text-zinc-500">Full description (sent when user shows interest)</h3>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-800">
            {item.context}
          </p>
        </div>

        {item.bot_instructions && (
          <div className="mt-4 rounded-lg border border-amber-100 bg-amber-50 p-4">
            <h3 className="mb-2 text-xs font-medium text-amber-600">Bot instructions for this product</h3>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-amber-900">
              {item.bot_instructions}
            </p>
          </div>
        )}

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
  const [shortDescription, setShortDescription] = useState(item.short_description);
  const [context, setContext] = useState(item.context);
  const [botInstructions, setBotInstructions] = useState(item.bot_instructions);
  const [categoryId, setCategoryId] = useState(item.category?.toString() ?? "");

  const save = useUpdateItem(item.id);

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
              short_description: shortDescription,
              context,
              bot_instructions: botInstructions,
              category: categoryId ? Number(categoryId) : null,
            }, { onSuccess: onSaved });
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
            <label className="mb-1 block text-sm font-medium text-zinc-600">Short description</label>
            <Input
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="1-2 sentences (always visible to bot)"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-600">Full description</label>
            <Textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={15}
              required
              className="font-mono text-sm"
            />
            <p className="mt-1 text-xs text-zinc-400">Sent when user shows interest in this product</p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-600">Bot instructions</label>
            <Textarea
              value={botInstructions}
              onChange={(e) => setBotInstructions(e.target.value)}
              rows={6}
              className="font-mono text-sm"
              placeholder="What to emphasize, avoid, which questions to ask..."
            />
            <p className="mt-1 text-xs text-zinc-400">Specific instructions for the bot about this product</p>
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
