import { PageHeader } from "@/core/components/PageHeader";
import { WatchlistBoard } from "@/features/watchlist/components/WatchlistBoard";

export default function WatchlistPage() {
  return (
    <>
      <PageHeader title="Watchlist" description="Películas, series y libros por ver y leer." />
      <WatchlistBoard />
    </>
  );
}
