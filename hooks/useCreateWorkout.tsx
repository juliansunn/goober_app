import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createWorkout } from "@/functions/workouts";
import { CreateWorkoutInput } from "@/schemas/workout-schema";
import { toast } from "sonner";

export function useCreateWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workoutData: CreateWorkoutInput) => createWorkout(workoutData),
    onSuccess: () => {
      // Invalidate and refetch the workouts list
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      toast.success("Workout created successfully");
    },
    onError: (error) => {
      console.error("Error creating workout:", error);
      toast.error("Failed to create the workout. Please try again.");
    },
  });
}
