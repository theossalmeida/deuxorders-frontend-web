"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

export function MobileHeader() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Sessão encerrada.");
    router.replace("/login");
  }

  return (
    <header
      className="flex md:hidden items-center justify-between px-4 py-3 border-b border-white/10"
      style={{ backgroundColor: "#581629" }}
    >
      <img src="/logo.jpeg" alt="Deuxcerie" className="h-7 w-auto object-contain" />
      <button
        onClick={handleLogout}
        className="text-white/70 hover:text-white p-1 transition-colors"
        aria-label="Sair"
      >
        <LogOut className="h-5 w-5" />
      </button>
    </header>
  );
}
