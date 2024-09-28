import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteWorkout } from "@/functions/workouts";
import { toast } from "sonner";

export function useDeleteWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workoutId: string) => deleteWorkout(workoutId),
    onSuccess: () => {
      // Invalidate and refetch the workouts list
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      toast.success("Workout deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting workout:", error);
      toast.error("Failed to delete the workout. Please try again.");
    },
  });
}
