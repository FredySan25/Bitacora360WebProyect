import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/core/lib/supabase-server";
import { LogoutButton } from "@/core/components/LogoutButton";
import { LogoMark } from "@/core/components/LogoMark";
import { BottomTabs, SidebarNav, type NavItem } from "@/core/components/AppNav";
import { FinanceIcon, HabitsIcon, TodayIcon, WatchlistIcon } from "@/core/components/icons";

const NAV_ITEMS: NavItem[] = [
  { href: "/today", label: "Hoy", icon: <TodayIcon /> },
  { href: "/habits", label: "Hábitos", icon: <HabitsIcon /> },
  { href: "/finance", label: "Finanzas", icon: <FinanceIcon /> },
  { href: "/watchlist", label: "Watchlist", icon: <WatchlistIcon /> },
];

function Brand() {
  return (
    <Link href="/today" className="flex items-center gap-2.5">
      <LogoMark />
      <span className="font-display text-[1.3125rem] font-bold text-ink">Bitácora360</span>
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
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col gap-7 border-r border-rule px-5 py-8 md:flex">
        <Brand />
        <SidebarNav items={NAV_ITEMS} />
        <div className="mt-auto flex flex-col gap-1 text-sm">
          <Link
            href="/about"
            className="px-2.5 py-1 text-ink-muted transition hover:text-ink"
          >
            Acerca de
          </Link>
          <p className="truncate px-2.5 py-1 text-ink-muted" title={user.email}>
            {user.email}
          </p>
          <LogoutButton />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-rule bg-paper/95 py-2 pr-2 pl-4 backdrop-blur md:hidden">
          <Brand />
          <LogoutButton compact />
        </header>

        <div className="bg-margin-rule flex flex-1 flex-col">
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-28 md:pt-11 md:pr-14 md:pb-16 md:pl-24">
            {children}
            {/* The sidebar has it on desktop; the bottom tabs keep their four modules */}
            <footer className="mt-12 border-t border-rule pt-4 text-center md:hidden">
              <Link href="/about" className="text-sm text-ink-muted transition hover:text-ink">
                Acerca de
              </Link>
            </footer>
          </main>
        </div>
      </div>

      <BottomTabs items={NAV_ITEMS} />
    </div>
  );
}
