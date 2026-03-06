"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  useDialogs,
  useDialog,
  useLeads,
  useSendMessage,
  useHandoff,
  useReturnToBot,
} from "@/lib/hooks";
import type { Dialog, Lead, Message } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  MessageCircle,
  AtSign,
  Send,
  UserCheck,
  Bot,
  Phone,
  User,
  Package,
  Flame,
  Search,
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
  const searchParams = useSearchParams();
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(() => {
    const id = searchParams.get("id");
    return id ? Number(id) : null;
  });
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: allDialogsData } = useDialogs("");
  const { data: dialogsData, isLoading } = useDialogs(statusFilter);
  const { data: dialog } = useDialog(selectedId);
  const { data: leadsData } = useLeads();

  const lead = leadsData?.results.find((l) => l.dialog_id === selectedId);

  const sendMessage = useSendMessage(selectedId);
  const handoff = useHandoff(selectedId);
  const returnToBot = useReturnToBot(selectedId);

  // Count dialogs per status for tab badges
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    if (allDialogsData?.results) {
      for (const d of allDialogsData.results) {
        counts[d.status] = (counts[d.status] || 0) + 1;
      }
    }
    return counts;
  }, [allDialogsData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [dialog?.messages]);

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
    <div className="flex h-screen flex-col bg-white">
      {/* Top: Header + Status filter bar */}
      <div className="flex h-14 items-center gap-4 border-b border-zinc-200 bg-white px-6 shrink-0">
        <h1 className="text-lg font-semibold text-[#351E1C] shrink-0">Dialogs</h1>
        <div className="flex items-center gap-1">
        {STATUS_TABS.map((tab) => {
          const count = tab.value === ""
            ? allDialogsData?.count ?? 0
            : statusCounts[tab.value] ?? 0;
          return (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all cursor-pointer",
                statusFilter === tab.value
                  ? "bg-[#351E1C] text-white shadow-sm"
                  : "text-[#9E8E8C] hover:bg-[#351E1C]/5 hover:text-[#351E1C]"
              )}
            >
              {tab.label}
              <span className={cn(
                "rounded-md px-1.5 py-px text-[11px] font-semibold tabular-nums",
                statusFilter === tab.value
                  ? "bg-white/20 text-white"
                  : "bg-zinc-100 text-[#9E8E8C]"
              )}>
                {count}
              </span>
            </button>
          );
        })}
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Dialog list */}
        <div className="flex w-[340px] shrink-0 flex-col border-r border-zinc-200">
          {/* Search */}
          <div className="border-b border-zinc-100 px-3 py-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9E8E8C]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations..."
                className="h-8 w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-9 pr-3 text-sm text-[#351E1C] placeholder:text-[#9E8E8C] focus:border-[#FF6037] focus:outline-none focus:ring-2 focus:ring-[#FF6037]/20 transition-all"
              />
            </div>
          </div>

          {/* Dialog list */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#FF6037]/20 border-t-[#FF6037]" />
              </div>
            ) : !filteredDialogs?.length ? (
              <div className="flex flex-col items-center justify-center py-16 px-6">
                <MessageSquare className="mb-2 h-8 w-8 text-zinc-300" />
                <p className="text-sm font-medium text-[#9E8E8C]">No conversations</p>
              </div>
            ) : (
              filteredDialogs.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelectedId(d.id)}
                  className={cn(
                    "flex w-full items-start gap-3 px-4 py-3 text-left transition-all cursor-pointer border-b border-zinc-100",
                    selectedId === d.id
                      ? "bg-[#FF6037]/5 border-l-2 border-l-[#FF6037]"
                      : "hover:bg-zinc-50 border-l-2 border-l-transparent"
                  )}
                >
                  <div className="relative">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#351E1C] to-[#4A2B28] text-sm font-semibold text-white">
                      {(d.instagram_username || "U").charAt(0).toUpperCase()}
                    </div>
                    <StatusDot status={d.status} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "text-[13px] font-semibold truncate",
                        selectedId === d.id ? "text-[#351E1C]" : "text-zinc-900"
                      )}>
                        @{d.instagram_username || `user_${d.id}`}
                      </span>
                      <span className="shrink-0 text-[11px] font-medium text-[#9E8E8C] tabular-nums">
                        {formatTime(d.updated_at)}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      {d.source === "dm" ? (
                        <MessageCircle className="h-3 w-3 text-[#9E8E8C]" />
                      ) : (
                        <AtSign className="h-3 w-3 text-[#9E8E8C]" />
                      )}
                      <span className="text-[11px] font-medium text-[#9E8E8C] capitalize">{d.status.replace("_", " ")}</span>
                      {!d.is_bot_active && (
                        <span className="rounded bg-amber-100 px-1 py-px text-[10px] font-semibold text-amber-700">MANUAL</span>
                      )}
                    </div>
                    {d.last_message && (
                      <p className="mt-1 truncate text-xs text-zinc-500 leading-relaxed">
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
              <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#351E1C] to-[#4A2B28] text-sm font-semibold text-white">
                    {(dialog.instagram_username || "U").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#351E1C]">
                      @{dialog.instagram_username || dialog.instagram_user_id}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StatusBadge status={dialog.status} />
                      {dialog.source === "comment" && (
                        <span className="text-[11px] text-[#9E8E8C]">from comment</span>
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
              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 bg-[#F5F4ED]/30">
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
                    if (text.trim()) sendMessage.mutate(text.trim(), { onSuccess: () => setText("") });
                  }}
                  className="flex items-center gap-2 border-t border-zinc-200 bg-white p-3"
                >
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 h-10 rounded-lg border border-zinc-200 bg-zinc-50 px-4 text-sm text-[#351E1C] placeholder:text-[#9E8E8C] focus:border-[#FF6037] focus:outline-none focus:ring-2 focus:ring-[#FF6037]/20 transition-all"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={sendMessage.isPending || !text.trim()}
                    className="h-10 w-10 shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              ) : (
                <div className="flex items-center justify-center border-t border-zinc-200 bg-zinc-50 py-3.5 text-xs font-medium text-[#9E8E8C]">
                  <Bot className="mr-1.5 h-3.5 w-3.5" />
                  Bot is handling this conversation
                </div>
              )}
            </div>

            {/* Right: Contact card */}
            <div className="w-[280px] shrink-0 border-l border-zinc-200 overflow-y-auto bg-white">
              <div className="p-5">
                {/* Profile */}
                <div className="flex flex-col items-center pb-5 border-b border-zinc-200">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#351E1C] to-[#4A2B28] text-xl font-bold text-white mb-3">
                    {(dialog.instagram_username || "U").charAt(0).toUpperCase()}
                  </div>
                  <div className="text-sm font-bold text-[#351E1C]">
                    @{dialog.instagram_username || dialog.instagram_user_id}
                  </div>
                  <div className="mt-1 text-xs text-[#9E8E8C]">
                    Started {new Date(dialog.started_at).toLocaleDateString()}
                  </div>
                </div>

                {/* Lead info */}
                {lead ? (
                  <div className="mt-4 space-y-4">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#9E8E8C]">
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
                      <div className="mb-1 text-[11px] font-medium text-[#9E8E8C]">Temperature</div>
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
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#351E1C]/5 mb-2">
                      <User className="h-5 w-5 text-[#9E8E8C]" />
                    </div>
                    <p className="text-xs font-medium text-[#9E8E8C]">No lead data yet</p>
                    <p className="mt-1 text-[11px] text-zinc-400">Bot is collecting info</p>
                  </div>
                )}

                {/* Dialog meta */}
                <div className="mt-5 border-t border-zinc-200 pt-4">
                  <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-[#9E8E8C]">
                    Details
                  </h4>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#9E8E8C]">Source</span>
                      <span className="font-medium text-[#351E1C] capitalize">{dialog.source}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#9E8E8C]">Messages</span>
                      <span className="font-medium text-[#351E1C]">{dialog.messages.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#9E8E8C]">Bot active</span>
                      <span className={cn(
                        "font-semibold",
                        dialog.is_bot_active ? "text-emerald-600" : "text-amber-600"
                      )}>
                        {dialog.is_bot_active ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center bg-[#F5F4ED]/30">
            <MessageSquare className="mb-3 h-12 w-12 text-[#9E8E8C]/40" />
            <p className="text-sm font-medium text-[#9E8E8C]">Select a conversation</p>
          </div>
        )}
      </div>
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
          "max-w-[70%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed",
          isUser
            ? "bg-white border border-zinc-200 text-[#351E1C] shadow-sm rounded-bl-md"
            : isBot
            ? "bg-[#351E1C] text-[#F5F4ED] shadow-md rounded-br-md"
            : "bg-[#FF6037] text-white shadow-md rounded-br-md"
        )}
      >
        <p className="whitespace-pre-wrap">{message.text}</p>
        <div
          className={cn(
            "mt-1 flex items-center justify-end gap-1 text-[10px] tabular-nums",
            isUser ? "text-[#9E8E8C]" : isBot ? "text-[#F5F4ED]/50" : "text-white/60"
          )}
        >
          <span>{new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          {isBot && <Bot className="h-3 w-3" />}
          {message.role === "manager" && <UserCheck className="h-3 w-3" />}
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
    new: "bg-[#FF6037]",
    active: "bg-emerald-500",
    qualified: "bg-purple-500",
    lead: "bg-emerald-600",
    handed_off: "bg-amber-500",
    closed: "bg-[#9E8E8C]",
  };
  return (
    <span className={cn(
      "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white",
      colors[status] || "bg-[#9E8E8C]"
    )} />
  );
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
      <div className="mb-0.5 flex items-center gap-1.5 text-[11px] font-medium text-[#9E8E8C]">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      {href && value ? (
        <a href={href} className="text-sm font-semibold text-[#FF6037] hover:underline">
          {value}
        </a>
      ) : (
        <p className="text-sm font-semibold text-[#351E1C]">{value || "—"}</p>
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
