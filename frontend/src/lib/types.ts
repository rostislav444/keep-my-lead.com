export interface User {
  id: number;
  username: string;
  email: string;
  role: "owner" | "manager";
  telegram_chat_id: string;
}

export interface Tenant {
  id: number;
  name: string;
  slug: string;
  industry: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  order: number;
}

export interface Item {
  id: number;
  category: number | null;
  category_name: string | null;
  name: string;
  short_description: string;
  context: string;
  bot_instructions: string;
  is_active: boolean;
  source_type: string;
  source_id: string;
  synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Dialog {
  id: number;
  instagram_username: string;
  status: "new" | "active" | "qualified" | "lead" | "handed_off" | "closed";
  source: "comment" | "dm";
  is_bot_active: boolean;
  started_at: string;
  updated_at: string;
  last_message?: {
    role: string;
    text: string;
    created_at: string;
  } | null;
}

export interface DialogDetail extends Dialog {
  instagram_user_id: string;
  messages: Message[];
}

export interface Message {
  id: number;
  role: "user" | "bot" | "manager";
  text: string;
  created_at: string;
}

export interface Lead {
  id: number;
  name: string;
  phone: string;
  interest: string;
  product: number | null;
  product_name: string | null;
  temperature: "hot" | "warm" | "cold";
  manager_notified: boolean;
  dialog_id: number;
  created_at: string;
}

export interface BotConfig {
  id: number;
  bot_name: string;
  tone: "friendly" | "professional" | "expert";
  goal: string;
  greeting_template: string;
  escalation_trigger: string;
  forbidden_topics: string;
  additional_instructions: string;
}

export interface InstagramAccount {
  id: number;
  username: string;
  instagram_user_id: string;
  is_active: boolean;
  connected_at: string;
  token_expires_at: string | null;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
