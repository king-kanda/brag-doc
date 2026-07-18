"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/lib/store";
import { Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    login(email || "you@example.com");
    router.push("/");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-6">
      <div className="absolute -top-40 -right-16 h-[520px] w-[520px] rounded-full bg-electric opacity-10 blur-[90px]" />
      <div className="absolute -bottom-32 -left-12 h-[340px] w-[340px] rounded-full bg-coral opacity-10 blur-[90px]" />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-electric/15">
            <Sparkles className="h-5 w-5 text-electric" />
          </div>
          <h1 className="text-2xl font-light text-white">Brag Doc</h1>
          <p className="mt-2 max-w-[300px] text-[13px] font-light leading-relaxed text-smoke">
            Track status, wins, and priorities across every area of your life — work, side projects, and everything else.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/8 bg-white/[0.03] p-7 backdrop-blur-sm"
        >
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[11px] font-medium uppercase tracking-wider text-smoke">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-white/10 bg-white/5 text-white placeholder:text-smoke/60"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[11px] font-medium uppercase tracking-wider text-smoke">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-white/10 bg-white/5 text-white placeholder:text-smoke/60"
              />
            </div>
          </div>

          <Button type="submit" className="mt-6 w-full bg-electric text-white hover:bg-electric/90">
            Sign in
          </Button>

          <p className="mt-4 text-center text-[11px] font-light text-smoke">
            No account system wired up yet — sign in with any email to continue.
          </p>
        </form>
      </div>
    </div>
  );
}
