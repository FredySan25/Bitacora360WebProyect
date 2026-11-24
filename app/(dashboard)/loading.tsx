import {
  LoadingState,
  SkeletonControl,
  SkeletonList,
  SkeletonPageHeader,
} from "@/core/components/Skeleton";

/** Shown at once when moving to another module, while its page comes from the server. */
export default function DashboardLoading() {
  return (
    <LoadingState label="Cargando..." className="flex flex-col gap-8">
      <SkeletonPageHeader />
      <SkeletonControl className="w-56" />
      <SkeletonList rows={4} />
    </LoadingState>
  );
}
