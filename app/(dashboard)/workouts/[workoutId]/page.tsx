import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import WorkoutDetails from "./workout-details";
import { getWorkoutById } from "@/functions/workouts";

export const revalidate = 60 * 1000; // 1 minute

export default async function WorkoutDetailsPage({
  params,
}: {
  params: { workoutId: string };
}) {
  const queryClient = new QueryClient();
  const { workoutId } = params;

  await queryClient.prefetchQuery({
    queryKey: ["workout", workoutId],
    queryFn: () => getWorkoutById(workoutId),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <WorkoutDetails workoutId={workoutId} />
    </HydrationBoundary>
  );
}
