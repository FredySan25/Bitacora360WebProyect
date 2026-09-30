import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/core/lib/supabase-server";
import { LogoutButton } from "@/core/components/LogoutButton";
import { BottomTabs, SidebarNav, type NavItem } from "@/core/components/AppNav";
import {
  BookIcon,
  FinanceIcon,
  HabitsIcon,
  TodayIcon,
  WatchlistIcon,
} from "@/core/components/icons";

const NAV_ITEMS: NavItem[] = [
  { href: "/today", label: "Hoy", icon: <TodayIcon /> },
  { href: "/habits", label: "Hábitos", icon: <HabitsIcon /> },
  { href: "/finance", label: "Finanzas", icon: <FinanceIcon /> },
  { href: "/watchlist", label: "Watchlist", icon: <WatchlistIcon /> },
];

function Brand() {
  return (
    <Link href="/today" className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-paper text-accent">
        <BookIcon className="h-[18px] w-[18px]" />
      </span>
      <span className="font-display text-lg font-semibold tracking-tight text-ink">
        Bitácora360
      </span>
    </Link>
  );
}

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
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-paper-elevated px-4 py-6 md:flex">
        <div className="mb-8 px-2">
          <Brand />
        </div>
        <SidebarNav items={NAV_ITEMS} />
        <div className="mt-auto border-t border-border pt-4">
          <p className="mb-2 truncate px-3 text-xs text-ink-muted" title={user.email}>
            {user.email}
          </p>
          <LogoutButton />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-paper-elevated/95 px-4 py-3 backdrop-blur md:hidden">
          <Brand />
          <LogoutButton compact />
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-6 md:px-10 md:pb-12 md:pt-10">
          {children}
        </main>
      </div>

      <BottomTabs items={NAV_ITEMS} />
    </div>
  );
}
