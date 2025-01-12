import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getScheduledWorkoutsList } from "@/functions/scheduled-workouts";
import { getStravaActivities, isStravaAuthenticated } from "@/functions/strava";
import { WeeklyCalendarComponent } from "./weekly-calendar";

export const revalidate = 60 * 1000; // 1 minute

export default async function CalendarPage() {
  const queryClient = new QueryClient();

  const today = new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
  const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const page = 1;
  const perPage = 30;

  await queryClient.prefetchQuery({
    queryKey: [
      "scheduledWorkouts",
      startDate.toISOString(),
      endDate.toISOString(),
    ],
    queryFn: () => getScheduledWorkoutsList({ startDate, endDate }),
  });

  // Check if user is authenticated with Strava before prefetching
  const isAuthenticated = await isStravaAuthenticated();

  if (isAuthenticated) {
    await queryClient.prefetchQuery({
      queryKey: [
        "stravaActivities",
        startDate.toISOString(),
        endDate.toISOString(),
        page,
        perPage,
      ],
      queryFn: () =>
        getStravaActivities({
          after: Math.floor(startDate.getTime() / 1000),
          before: Math.floor(endDate.getTime() / 1000),
          page,
          per_page: perPage,
        }),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <WeeklyCalendarComponent />
    </HydrationBoundary>
  );
}
