"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/core/lib/auth";
import { LogoutIcon } from "./icons";

export function LogoutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();

  async function handleLogout() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      aria-label="Cerrar sesión"
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-muted transition hover:bg-ink/5 hover:text-ink"
    >
      <LogoutIcon className="h-5 w-5" />
      {!compact && "Cerrar sesión"}
    </button>
  );
}
