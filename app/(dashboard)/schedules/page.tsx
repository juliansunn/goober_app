import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import Schedules from "./schedules";
import { getAll } from "@/functions/workout-schedules";

export const revalidate = 60 * 1000; // 1 minute

export default async function SchedulesPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["schedules", { page: 1, limit: 100 }],
    queryFn: () => getAll(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Schedules />
    </HydrationBoundary>
  );
}
