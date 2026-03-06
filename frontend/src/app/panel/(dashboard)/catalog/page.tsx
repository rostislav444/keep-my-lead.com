"use client";

import { useState } from "react";
import {
  useItems,
  useCategories,
  useDeleteItem,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/lib/hooks";
import type { Item, Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Plus,
  Trash2,
  Pencil,
  X,
  Check,
  FolderOpen,
  Package,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CatalogPage() {
  const router = useRouter();
  const [showCategories, setShowCategories] = useState(false);

  const { data: items, isLoading } = useItems();
  const { data: categories } = useCategories();
  const deleteItem = useDeleteItem();

  const grouped = groupByCategory(items?.results ?? [], categories?.results ?? []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-6 shrink-0">
        <h1 className="text-lg font-semibold text-[#351E1C]">Catalog</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowCategories((v) => !v)}>
            <FolderOpen className="mr-1.5 h-4 w-4" />
            Categories
          </Button>
          <Button size="sm" onClick={() => router.push("/panel/catalog/new")}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add product
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">

      {showCategories && (
        <CategoriesManager categories={categories?.results ?? []} />
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#FF6037]/20 border-t-[#FF6037]" />
        </div>
      ) : !items?.results.length ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-200 bg-white py-20">
          <Package className="mb-3 h-12 w-12 text-[#9E8E8C]/40" />
          <p className="text-sm font-medium text-[#9E8E8C]">No products yet</p>
          <p className="mt-1 text-xs text-zinc-400">Add your first product to the catalog</p>
          <Button className="mt-4" onClick={() => router.push("/panel/catalog/new")}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add product
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map((group) => (
            <div key={group.name}>
              <div className="mb-3 flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-[#9E8E8C]" />
                <h2 className="text-sm font-semibold text-[#351E1C]">{group.name}</h2>
                <span className="text-xs text-[#9E8E8C]">{group.items.length}</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {group.items.map((item) => (
                  <Link key={item.id} href={`/panel/catalog/${item.id}`} className="group">
                    <div className="flex h-full rounded-lg border border-zinc-100 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-[#FF6037]/20">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <h3 className="text-[15px] font-semibold text-[#351E1C] truncate">
                              {item.name}
                            </h3>
                            {item.short_description && (
                              <p className="mt-0.5 text-xs text-[#9E8E8C] truncate">
                                {item.short_description}
                              </p>
                            )}
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 shrink-0 text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.preventDefault();
                              if (confirm("Delete this product?")) deleteItem.mutate(item.id);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>

                        {/* Context preview */}
                        <p className="mt-3 text-[13px] leading-relaxed text-zinc-500 line-clamp-4 whitespace-pre-wrap">
                          {item.context}
                        </p>

                        {/* Footer meta */}
                        <div className="mt-3 flex items-center gap-2 pt-3 border-t border-zinc-100">
                          {item.category_name && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-[#351E1C]/5 px-2 py-0.5 text-[11px] font-medium text-[#351E1C]">
                              <FolderOpen className="h-3 w-3" />
                              {item.category_name}
                            </span>
                          )}
                          {item.source_type && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-[#A0C9CB]/15 px-2 py-0.5 text-[11px] font-medium text-[#5A9A9D]">
                              <RefreshCw className="h-3 w-3" />
                              {item.source_type}
                            </span>
                          )}
                          <ChevronRight className="ml-auto h-3.5 w-3.5 text-zinc-300 group-hover:text-[#FF6037] transition-colors" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}

function CategoriesManager({ categories }: { categories: Category[] }) {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  const create = useCreateCategory();
  const update = useUpdateCategory();
  const remove = useDeleteCategory();

  return (
    <div className="mb-6 rounded-lg border border-zinc-100 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-[#351E1C]">Categories</h3>

      <div className="mb-3 space-y-2">
        {categories.length === 0 && (
          <p className="text-sm text-[#9E8E8C]">No categories yet</p>
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
                      update.mutate({ id: cat.id, name: editName.trim() }, { onSuccess: () => setEditingId(null) });
                    }
                    if (e.key === "Escape") setEditingId(null);
                  }}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => {
                    if (editName.trim()) update.mutate({ id: cat.id, name: editName.trim() }, { onSuccess: () => setEditingId(null) });
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
                <span className="flex-1 text-sm text-[#351E1C]">{cat.name}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-[#9E8E8C] hover:text-[#351E1C]"
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
                  className="h-7 w-7 text-zinc-300 hover:text-red-500"
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
          if (newName.trim()) create.mutate(newName.trim(), { onSuccess: () => setNewName("") });
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
    </div>
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
