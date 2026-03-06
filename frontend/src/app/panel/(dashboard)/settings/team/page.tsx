"use client";

import { useState } from "react";
import {
  useUser,
  useTeam,
  useAddTeamMember,
  useRemoveTeamMember,
  useTelegramLink,
  useDisconnectTelegram,
} from "@/lib/hooks";
import type { User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus, X, Send, Unlink } from "lucide-react";

export default function TeamPage() {
  const { data: me } = useUser();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", password: "" });

  const { data: members, isLoading } = useTeam();
  const addMember = useAddTeamMember();
  const removeMember = useRemoveTeamMember();

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const memberList = Array.isArray(members) ? members : (members as any)?.results ?? [];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Team</h1>
        <Button onClick={() => setAdding(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Add manager
        </Button>
      </div>

      {/* Your own Telegram connection */}
      {me && (
        <TelegramConnect />
      )}

      {adding && (
        <Card className="mb-6">
          <CardContent>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">New manager</h3>
              <Button size="icon" variant="ghost" onClick={() => setAdding(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addMember.mutate(form, { onSuccess: () => { setAdding(false); setForm({ username: "", email: "", password: "" }); } });
              }}
              className="space-y-3"
            >
              <Input placeholder="Username" value={form.username} onChange={set("username")} required />
              <Input type="email" placeholder="Email" value={form.email} onChange={set("email")} required />
              <Input type="password" placeholder="Password" value={form.password} onChange={set("password")} required minLength={8} />
              <Button type="submit" disabled={addMember.isPending}>
                {addMember.isPending ? "Adding..." : "Add"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <p className="text-zinc-400">Loading...</p>
      ) : !memberList.length ? (
        <p className="text-zinc-400">No managers yet</p>
      ) : (
        <div className="space-y-2">
          {memberList.map((m: User) => (
            <Card key={m.id}>
              <CardContent className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <span className="font-medium">{m.username}</span>
                    <span className="ml-2 text-sm text-zinc-400">{m.email}</span>
                  </div>
                  {m.telegram_chat_id ? (
                    <Badge variant="success">TG connected</Badge>
                  ) : (
                    <Badge variant="default">TG not connected</Badge>
                  )}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-red-500"
                  onClick={() => {
                    if (confirm("Remove this manager?")) removeMember.mutate(m.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function TelegramConnect() {
  const { data: me } = useUser();
  const { data: tgData } = useTelegramLink();
  const disconnect = useDisconnectTelegram();

  const connected = me?.telegram_chat_id || tgData?.connected;

  return (
    <Card className="mb-6">
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Telegram Notifications</h3>
            <p className="text-sm text-zinc-500">
              {connected
                ? "You will receive lead notifications in Telegram"
                : "Connect Telegram to receive lead notifications"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {connected ? (
              <>
                <Badge variant="success">Connected</Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => disconnect.mutate()}
                >
                  <Unlink className="mr-1 h-3.5 w-3.5" />
                  Disconnect
                </Button>
              </>
            ) : tgData?.link ? (
              <a href={tgData.link} target="_blank" rel="noopener noreferrer">
                <Button size="sm">
                  <Send className="mr-1 h-3.5 w-3.5" />
                  Connect Telegram
                </Button>
              </a>
            ) : (
              <Button size="sm" disabled>
                Bot not configured
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
