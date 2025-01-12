import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getById } from "@/functions/workout-schedules"; // You'll need to create this function
import WorkoutScheduleDetails from "./schedule-details";

export const revalidate = 60 * 1000; // 1 minute

export default async function ScheduleDetailsPage({
  params,
}: {
  params: { skeletonId: number };
}) {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["schedule", params.skeletonId],
    queryFn: () => getById(params.skeletonId),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <WorkoutScheduleDetails skeletonId={params.skeletonId} />
    </HydrationBoundary>
  );
}
