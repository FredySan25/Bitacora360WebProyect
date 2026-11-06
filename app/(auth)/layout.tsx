import { CompassRose } from "@/core/components/CompassRose";
import { LogoMark } from "@/core/components/LogoMark";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <div className="relative flex flex-col justify-between gap-10 overflow-hidden border-b border-rule px-6 pt-10 pb-8 lg:flex-1 lg:border-r lg:border-b-0 lg:px-16 lg:py-14">
        <div className="flex flex-col gap-3">
          <LogoMark size={36} />
          <h1 className="font-display text-6xl leading-[0.9] font-bold text-ink lg:text-[5.5rem]">
            <span className="highlight-mark">Bitácora360</span>
          </h1>
          <p className="max-w-[30ch] text-[1.1875rem] text-ink">
            Tu registro personal: hábitos, finanzas y watchlist.
          </p>
        </div>
        <CompassRose className="-mr-10 -mb-24 hidden w-[440px] max-w-full self-end lg:block" />
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
