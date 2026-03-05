"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { api } from "@/lib/api";
import type {
  PaginatedResponse,
  Dialog,
  DialogDetail,
  Lead,
  Message,
} from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  Send,
  UserCheck,
  Bot,
  Phone,
  User,
  Package,
  Flame,
  Search,
  Circle,
} from "lucide-react";

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "new", label: "New" },
  { value: "active", label: "Active" },
  { value: "qualified", label: "Qualified" },
  { value: "lead", label: "Lead" },
  { value: "handed_off", label: "Manager" },
  { value: "closed", label: "Closed" },
] as const;

export default function DialogsPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const params = new URLSearchParams();
  if (statusFilter) params.set("status", statusFilter);
  const qs = params.toString() ? `?${params}` : "";

  const { data: dialogsData, isLoading } = useQuery({
    queryKey: ["dialogs", statusFilter],
    queryFn: () => api.get<PaginatedResponse<Dialog>>(`/dialogs/${qs}`),
  });

  const { data: dialog } = useQuery({
    queryKey: ["dialog", selectedId],
    queryFn: () => api.get<DialogDetail>(`/dialogs/${selectedId}`),
    enabled: !!selectedId,
    refetchInterval: 5000,
  });

  const { data: leadsData } = useQuery({
    queryKey: ["leads"],
    queryFn: () => api.get<PaginatedResponse<Lead>>("/leads"),
  });

  const lead = leadsData?.results.find((l) => l.dialog_id === selectedId);

  const sendMessage = useMutation({
    mutationFn: (t: string) => api.post(`/dialogs/${selectedId}/send`, { text: t }),
    onSuccess: () => {
      setText("");
      qc.invalidateQueries({ queryKey: ["dialog", selectedId] });
      qc.invalidateQueries({ queryKey: ["dialogs"] });
    },
  });

  const handoff = useMutation({
    mutationFn: () => api.post(`/dialogs/${selectedId}/handoff`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dialog", selectedId] });
      qc.invalidateQueries({ queryKey: ["dialogs"] });
    },
  });

  const returnToBot = useMutation({
    mutationFn: () => api.post(`/dialogs/${selectedId}/return-to-bot`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dialog", selectedId] });
      qc.invalidateQueries({ queryKey: ["dialogs"] });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [dialog?.messages]);

  // Auto-select first dialog
  useEffect(() => {
    if (!selectedId && dialogsData?.results.length) {
      setSelectedId(dialogsData.results[0].id);
    }
  }, [dialogsData, selectedId]);

  const filteredDialogs = dialogsData?.results.filter((d) =>
    search
      ? (d.instagram_username || "").toLowerCase().includes(search.toLowerCase())
      : true
  );

  return (
    <div className="flex h-[calc(100vh-3rem)] gap-0 overflow-hidden rounded-2xl border border-zinc-100 bg-white/80 backdrop-blur-sm shadow-sm">
      {/* Left: Dialog list */}
      <div className="flex w-[320px] shrink-0 flex-col border-r border-zinc-100">
        {/* Search */}
        <div className="p-3 pb-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dialogs..."
              className="h-9 w-full rounded-xl border border-zinc-100 bg-zinc-50/80 pl-9 pr-3 text-sm placeholder:text-zinc-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
            />
          </div>
        </div>

        {/* Status tabs */}
        <div className="flex gap-1 overflow-x-auto px-3 py-2.5 scrollbar-none">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                "shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer",
                statusFilter === tab.value
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dialog list */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-500" />
            </div>
          ) : !filteredDialogs?.length ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <MessageSquare className="mb-2 h-8 w-8 text-zinc-200" />
              <p className="text-sm text-zinc-400">No dialogs</p>
            </div>
          ) : (
            filteredDialogs.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedId(d.id)}
                className={cn(
                  "flex w-full items-start gap-3 px-4 py-3 text-left transition-all cursor-pointer border-b border-zinc-50",
                  selectedId === d.id
                    ? "bg-indigo-50/60"
                    : "hover:bg-zinc-50/80"
                )}
              >
                {/* Avatar */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-sm font-semibold text-white">
                  {(d.instagram_username || "U").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-zinc-900 truncate">
                      @{d.instagram_username || `user_${d.id}`}
                    </span>
                    <span className="shrink-0 text-[11px] text-zinc-400">
                      {formatTime(d.updated_at)}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <StatusDot status={d.status} />
                    <span className="text-[11px] text-zinc-400 capitalize">{d.status.replace("_", " ")}</span>
                    {!d.is_bot_active && (
                      <span className="text-[11px] text-amber-500 font-medium">manual</span>
                    )}
                  </div>
                  {d.last_message && (
                    <p className="mt-1 truncate text-xs text-zinc-500">
                      {d.last_message.text}
                    </p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Center: Chat */}
      {selectedId && dialog ? (
        <>
          <div className="flex flex-1 flex-col">
            {/* Chat header */}
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-sm font-semibold text-white">
                  {(dialog.instagram_username || "U").charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-semibold text-zinc-900">
                    @{dialog.instagram_username || dialog.instagram_user_id}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <StatusBadge status={dialog.status} />
                    {dialog.source === "comment" && (
                      <span className="text-zinc-300">from comment</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {dialog.is_bot_active ? (
                  <Button size="sm" variant="soft" onClick={() => handoff.mutate()}>
                    <UserCheck className="mr-1.5 h-3.5 w-3.5" />
                    Take over
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => returnToBot.mutate()}>
                    <Bot className="mr-1.5 h-3.5 w-3.5" />
                    Return to bot
                  </Button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-zinc-50/30">
              {dialog.messages.map((msg) => (
                <ChatBubble key={msg.id} message={msg} />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {!dialog.is_bot_active ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (text.trim()) sendMessage.mutate(text.trim());
                }}
                className="flex items-center gap-2 border-t border-zinc-100 p-3"
              >
                <Input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 border-zinc-100 bg-zinc-50/50"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={sendMessage.isPending || !text.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <div className="flex items-center justify-center border-t border-zinc-100 py-3 text-xs text-zinc-400">
                <Bot className="mr-1.5 h-3.5 w-3.5" />
                Bot is handling this conversation
              </div>
            )}
          </div>

          {/* Right: Contact card */}
          <div className="w-[280px] shrink-0 border-l border-zinc-100 overflow-y-auto">
            <div className="p-5">
              {/* Profile */}
              <div className="flex flex-col items-center pb-5 border-b border-zinc-100">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-xl font-bold text-white mb-3">
                  {(dialog.instagram_username || "U").charAt(0).toUpperCase()}
                </div>
                <div className="text-sm font-semibold text-zinc-900">
                  @{dialog.instagram_username || dialog.instagram_user_id}
                </div>
                <div className="mt-1 text-xs text-zinc-400">
                  Started {new Date(dialog.started_at).toLocaleDateString()}
                </div>
              </div>

              {/* Lead info */}
              {lead ? (
                <div className="mt-4 space-y-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Lead info
                  </h4>
                  <InfoRow icon={User} label="Name" value={lead.name} />
                  <InfoRow
                    icon={Phone}
                    label="Phone"
                    value={lead.phone}
                    href={lead.phone ? `tel:${lead.phone}` : undefined}
                  />
                  <InfoRow icon={Package} label="Interest" value={lead.interest} />
                  <InfoRow icon={Package} label="Product" value={lead.product_name} />
                  <div>
                    <div className="mb-1 text-[11px] text-zinc-400">Temperature</div>
                    <Badge
                      variant={
                        lead.temperature === "hot"
                          ? "destructive"
                          : lead.temperature === "warm"
                          ? "warning"
                          : "default"
                      }
                    >
                      <Flame className="mr-1 h-3 w-3" />
                      {lead.temperature.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="mt-6 flex flex-col items-center py-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 mb-2">
                    <User className="h-5 w-5 text-zinc-300" />
                  </div>
                  <p className="text-xs text-zinc-400">No lead data yet</p>
                  <p className="mt-1 text-[11px] text-zinc-300">Bot is collecting info</p>
                </div>
              )}

              {/* Dialog meta */}
              <div className="mt-6 border-t border-zinc-100 pt-4">
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Details
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Source</span>
                    <span className="text-zinc-700 capitalize">{dialog.source}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Messages</span>
                    <span className="text-zinc-700">{dialog.messages.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Bot active</span>
                    <span className={dialog.is_bot_active ? "text-emerald-600" : "text-amber-600"}>
                      {dialog.is_bot_active ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center text-zinc-300">
          <MessageSquare className="mb-3 h-12 w-12" />
          <p className="text-sm">Select a dialog to view</p>
        </div>
      )}
    </div>
  );
}

/* ---- Sub-components ---- */

function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const isBot = message.role === "bot";

  return (
    <div className={cn("flex", !isUser && "justify-end")}>
      <div
        className={cn(
          "max-w-[70%] rounded-2xl px-4 py-2.5 text-sm",
          isUser
            ? "bg-white border border-zinc-100 text-zinc-900 shadow-sm rounded-tl-md"
            : isBot
            ? "bg-indigo-500 text-white shadow-sm rounded-tr-md"
            : "bg-emerald-500 text-white shadow-sm rounded-tr-md"
        )}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
        <div
          className={cn(
            "mt-1 flex items-center gap-1.5 text-[10px]",
            isUser ? "text-zinc-400" : "text-white/60"
          )}
        >
          <span>{isBot ? "Bot" : message.role === "manager" ? "Manager" : ""}</span>
          <span>{new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Dialog["status"] }) {
  const map: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "blue" | "purple" }> = {
    new: { label: "New", variant: "blue" },
    active: { label: "Active", variant: "default" },
    qualified: { label: "Qualified", variant: "purple" },
    lead: { label: "Lead", variant: "success" },
    handed_off: { label: "Manager", variant: "warning" },
    closed: { label: "Closed", variant: "default" },
  };
  const { label, variant } = map[status] ?? { label: status, variant: "default" as const };
  return <Badge variant={variant}>{label}</Badge>;
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    new: "text-indigo-400",
    active: "text-emerald-400",
    qualified: "text-purple-400",
    lead: "text-emerald-500",
    handed_off: "text-amber-400",
    closed: "text-zinc-300",
  };
  return <Circle className={cn("h-2 w-2 fill-current", colors[status] || "text-zinc-300")} />;
}

function InfoRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof User;
  label: string;
  value: string | null | undefined;
  href?: string;
}) {
  return (
    <div>
      <div className="mb-0.5 flex items-center gap-1.5 text-[11px] text-zinc-400">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      {href && value ? (
        <a href={href} className="text-sm font-medium text-indigo-600 hover:underline">
          {value}
        </a>
      ) : (
        <p className="text-sm font-medium text-zinc-800">{value || "—"}</p>
      )}
    </div>
  );
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return date.toLocaleDateString([], { day: "numeric", month: "short" });
}
