"use client";

import { useState } from "react";
import Link from "next/link";
import { useRegister } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function RegisterPage() {
  const [form, setForm] = useState({
    company_name: "",
    industry: "",
    username: "",
    email: "",
    password: "",
  });
  const register = useRegister();

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              register.mutate(form);
            }}
            className="space-y-4"
          >
            <Input
              placeholder="Company name"
              value={form.company_name}
              onChange={set("company_name")}
              required
            />
            <Input
              placeholder="Industry (e.g. cosmetology)"
              value={form.industry}
              onChange={set("industry")}
            />
            <Input
              placeholder="Username"
              value={form.username}
              onChange={set("username")}
              required
            />
            <Input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={set("email")}
              required
            />
            <Input
              type="password"
              placeholder="Password (min 8 chars)"
              value={form.password}
              onChange={set("password")}
              required
              minLength={8}
            />
            {register.isError && (
              <p className="text-sm text-red-600">Registration failed. Check fields.</p>
            )}
            <Button type="submit" className="w-full" disabled={register.isPending}>
              {register.isPending ? "Creating..." : "Register"}
            </Button>
            <p className="text-center text-sm text-zinc-500">
              Already have an account?{" "}
              <Link href="/panel/login" className="text-zinc-900 underline">
                Login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
