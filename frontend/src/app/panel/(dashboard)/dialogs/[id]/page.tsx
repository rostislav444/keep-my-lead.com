"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import type { DialogDetail, Lead, PaginatedResponse } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Send, UserCheck, Bot } from "lucide-react";

export default function DialogDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: dialog, isLoading } = useQuery({
    queryKey: ["dialog", id],
    queryFn: () => api.get<DialogDetail>(`/dialogs/${id}`),
    refetchInterval: 5000,
  });

  const { data: leads } = useQuery({
    queryKey: ["leads"],
    queryFn: () => api.get<PaginatedResponse<Lead>>("/leads"),
  });

  const lead = leads?.results.find((l) => l.dialog_id === Number(id));

  const sendMessage = useMutation({
    mutationFn: (text: string) => api.post(`/dialogs/${id}/send`, { text }),
    onSuccess: () => {
      setText("");
      qc.invalidateQueries({ queryKey: ["dialog", id] });
    },
  });

  const handoff = useMutation({
    mutationFn: () => api.post(`/dialogs/${id}/handoff`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dialog", id] }),
  });

  const returnToBot = useMutation({
    mutationFn: () => api.post(`/dialogs/${id}/return-to-bot`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dialog", id] }),
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [dialog?.messages]);

  if (isLoading) return <p className="text-zinc-400">Loading...</p>;
  if (!dialog) return <p className="text-zinc-400">Dialog not found</p>;

  return (
    <div className="flex h-[calc(100vh-3rem)] gap-4">
      {/* Chat */}
      <div className="flex flex-1 flex-col rounded-lg border border-zinc-200 bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="font-medium">
              @{dialog.instagram_username || dialog.instagram_user_id}
            </span>
            <Badge>{dialog.status}</Badge>
            {!dialog.is_bot_active && <Badge variant="warning">Manual mode</Badge>}
          </div>
          <div className="flex gap-2">
            {dialog.is_bot_active ? (
              <Button size="sm" variant="outline" onClick={() => handoff.mutate()}>
                <UserCheck className="mr-1 h-4 w-4" />
                Take over
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={() => returnToBot.mutate()}>
                <Bot className="mr-1 h-4 w-4" />
                Return to bot
              </Button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {dialog.messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "max-w-[70%] rounded-lg px-4 py-2",
                msg.role === "user"
                  ? "bg-zinc-100 text-zinc-900"
                  : msg.role === "bot"
                  ? "ml-auto bg-blue-600 text-white"
                  : "ml-auto bg-green-600 text-white"
              )}
            >
              <div className="mb-1 text-xs opacity-70">
                {msg.role === "user" ? "User" : msg.role === "bot" ? "Bot" : "Manager"}
              </div>
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              <div className="mt-1 text-xs opacity-50">
                {new Date(msg.created_at).toLocaleTimeString()}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input (only when manager mode) */}
        {!dialog.is_bot_active && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (text.trim()) sendMessage.mutate(text.trim());
            }}
            className="flex gap-2 border-t border-zinc-200 p-3"
          >
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={sendMessage.isPending}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        )}
      </div>

      {/* Lead card sidebar */}
      {lead && (
        <Card className="w-72 shrink-0">
          <h3 className="mb-4 font-semibold">Lead Info</h3>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-zinc-400">Name</span>
              <p className="font-medium">{lead.name || "—"}</p>
            </div>
            <div>
              <span className="text-zinc-400">Phone</span>
              <p className="font-medium">
                {lead.phone ? (
                  <a href={`tel:${lead.phone}`} className="text-blue-600 underline">
                    {lead.phone}
                  </a>
                ) : (
                  "—"
                )}
              </p>
            </div>
            <div>
              <span className="text-zinc-400">Interest</span>
              <p>{lead.interest || "—"}</p>
            </div>
            <div>
              <span className="text-zinc-400">Product</span>
              <p>{lead.product_name || "—"}</p>
            </div>
            <div>
              <span className="text-zinc-400">Temperature</span>
              <p>
                <Badge
                  variant={
                    lead.temperature === "hot"
                      ? "destructive"
                      : lead.temperature === "warm"
                      ? "warning"
                      : "default"
                  }
                >
                  {lead.temperature.toUpperCase()}
                </Badge>
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
