import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createWorkout } from "@/functions/workouts";
import { CreateWorkoutInput } from "@/schemas/workout-schema";
import { useToast } from "@/hooks/use-toast";

export function useCreateWorkout() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (workoutData: CreateWorkoutInput) => createWorkout(workoutData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      toast({
        title: "Success",
        description: "Workout created successfully",
      });
    },
    onError: (error) => {
      console.error("Error creating workout:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create the workout. Please try again.",
      });
    },
  });
}
