import { redirect } from "next/navigation";
import { createClient } from "@/core/lib/supabase-server";
import { LogoutButton } from "@/core/components/LogoutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-black/10 px-6 py-4">
        <nav className="flex gap-4 text-sm font-medium">
          <a href="/habits">Hábitos</a>
          <a href="/finance">Finanzas</a>
          <a href="/watchlist">Watchlist</a>
        </nav>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-black/60">{user.email}</span>
          <LogoutButton />
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
