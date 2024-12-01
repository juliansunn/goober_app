import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateWorkout } from "@/functions/workouts";
import { UpdateWorkoutInput } from "@/schemas/workout-schema";
import { toast } from "sonner";

export function useUpdateWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workoutId,
      workoutData,
    }: {
      workoutId: string;
      workoutData: UpdateWorkoutInput;
    }) => updateWorkout(workoutId, workoutData),
    onSuccess: () => {
      // Invalidate and refetch the workouts list
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      toast.success("Workout updated successfully");
    },
    onError: (error) => {
      console.error("Error updating workout:", error);
      toast.error("Failed to update the workout. Please try again.");
    },
  });
}
