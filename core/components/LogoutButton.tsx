"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/core/lib/auth";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button onClick={handleLogout} className="underline">
      Cerrar sesión
    </button>
  );
}
