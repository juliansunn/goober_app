import { useQuery } from "@tanstack/react-query";
import { getWorkoutsList } from "@/functions/workouts";
import { Workout } from "@/types/workouts";

interface UseGetWorkoutsParams {
  page?: number;
  limit?: number;
  type?: "authored" | "favorited" | null;
}

interface WorkoutsResponse {
  workouts: Workout[];
  total: number;
}

export function useGetWorkouts({
  page = 1,
  limit = 10,
  type = null,
}: UseGetWorkoutsParams = {}) {
  return useQuery<WorkoutsResponse>({
    queryKey: ["workouts", { page, limit, type }],
    queryFn: () => getWorkoutsList({ page, limit, type }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}
