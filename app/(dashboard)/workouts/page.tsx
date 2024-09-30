import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import Workouts from "./workouts";
import { getWorkoutsList } from "@/functions/workouts";

export const revalidate = 60 * 1000; // 1 minute

export default async function WorkoutsPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["workouts", { page: 1, limit: 10, type: null }],
    queryFn: () => getWorkoutsList({ page: 1, limit: 10, type: null }),
  });

  return (
    // Neat! Serialization is now as easy as passing props.
    // HydrationBoundary is a Client Component, so hydration will happen there.
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Workouts />
    </HydrationBoundary>
  );
}
