import { useQuery } from "@tanstack/react-query";
import { generateWorkout } from "@/functions/generators";
import { Workout } from "@/types/workouts";

export function useGenerateWorkout(prompt: string) {
  return useQuery<Workout, Error>({
    queryKey: ["generate-workout", prompt],
    queryFn: () => generateWorkout(prompt),
    enabled: !!prompt,
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
