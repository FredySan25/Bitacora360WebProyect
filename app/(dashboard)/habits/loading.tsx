import { LoadingState, SkeletonControl, SkeletonList } from "@/core/components/Skeleton";

/** Shown at once when switching tabs, under the header and tabs that stay on screen. */
export default function TabLoading() {
  return (
    <LoadingState label="Cargando..." className="flex flex-col gap-8">
      <SkeletonControl className="w-56" />
      <SkeletonList rows={4} />
    </LoadingState>
  );
}
