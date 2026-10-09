import { Suspense } from "react";
import { PageHeader } from "@/core/components/PageHeader";
import { FinanceTabs } from "@/features/finance/components/FinanceTabs";

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageHeader title="Finanzas" description="Tus ingresos y gastos del mes." />
      {/* The tabs and the views read the selected month from the URL (useSearchParams) */}
      <Suspense>
        <FinanceTabs />
      </Suspense>
      <Suspense>{children}</Suspense>
    </>
  );
}
