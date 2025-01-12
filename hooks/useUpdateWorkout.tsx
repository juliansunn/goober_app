import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateWorkout } from "@/functions/workouts";
import { UpdateWorkoutInput } from "@/schemas/workout-schema";
import { useToast } from "@/hooks/use-toast";

export function useUpdateWorkout() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      workoutId,
      workoutData,
    }: {
      workoutId: string;
      workoutData: UpdateWorkoutInput;
    }) => updateWorkout(workoutId, workoutData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      toast({
        title: "Success",
        description: "Workout updated successfully",
      });
    },
    onError: (error) => {
      console.error("Error updating workout:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update the workout. Please try again.",
      });
    },
  });
}
