"use client";

import { useState, useEffect } from "react";
import { useBotConfig, useUpdateBotConfig } from "@/lib/hooks";
import type { BotConfig } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function BotSettingsPage() {
  const { data: config, isLoading } = useBotConfig();
  const [form, setForm] = useState<Partial<BotConfig>>({});

  useEffect(() => {
    if (config) setForm(config);
  }, [config]);

  const save = useUpdateBotConfig();

  const set = (key: keyof BotConfig) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  if (isLoading) return <p className="text-zinc-400">Loading...</p>;

  return (
    <div className="flex flex-col h-full">
      <div className="flex h-14 items-center px-6 border-b border-zinc-200 bg-white shrink-0">
        <h1 className="text-lg font-semibold text-[#351E1C]">Bot Settings</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Configure your sales bot</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate(form);
            }}
            className="space-y-4 max-w-2xl"
          >
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">Bot name</label>
              <Input
                placeholder='e.g. "Alina, Beauty Expert assistant"'
                value={form.bot_name ?? ""}
                onChange={set("bot_name")}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">Tone</label>
              <Select value={form.tone ?? "friendly"} onChange={set("tone")}>
                <option value="friendly">Friendly</option>
                <option value="professional">Professional</option>
                <option value="expert">Expert</option>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">Goal</label>
              <Textarea
                placeholder="What should the bot achieve?"
                value={form.goal ?? ""}
                onChange={set("goal")}
                rows={2}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">Greeting template</label>
              <Textarea
                placeholder="First message template when someone comments..."
                value={form.greeting_template ?? ""}
                onChange={set("greeting_template")}
                rows={3}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">Escalation trigger</label>
              <Textarea
                placeholder="When should the bot hand off to a manager?"
                value={form.escalation_trigger ?? ""}
                onChange={set("escalation_trigger")}
                rows={2}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">Forbidden topics</label>
              <Textarea
                placeholder="What should the bot NOT discuss?"
                value={form.forbidden_topics ?? ""}
                onChange={set("forbidden_topics")}
                rows={2}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">Additional instructions</label>
              <Textarea
                placeholder="Any extra instructions for the bot..."
                value={form.additional_instructions ?? ""}
                onChange={set("additional_instructions")}
                rows={3}
              />
            </div>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Saving..." : save.isSuccess ? "Saved!" : "Save settings"}
            </Button>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
