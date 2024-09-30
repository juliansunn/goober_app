import { WorkoutCalendarComponent } from "@/components/workout-calendar";

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getWorkoutsList } from "@/functions/workouts";
import { getScheduledWorkoutsList } from "@/functions/scheduled-workouts";
import { CalendarComponent } from "./calendar";

export const revalidate = 60 * 1000; // 1 minute

export default async function CalendarPage() {
  const queryClient = new QueryClient();

  const today = new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
  const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  await queryClient.prefetchQuery({
    queryKey: ["scheduled-workouts", { startDate, endDate }],
    queryFn: () => getScheduledWorkoutsList({ startDate, endDate }),
  });

  return (
    // Neat! Serialization is now as easy as passing props.
    // HydrationBoundary is a Client Component, so hydration will happen there.
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CalendarComponent />
    </HydrationBoundary>
  );
}
