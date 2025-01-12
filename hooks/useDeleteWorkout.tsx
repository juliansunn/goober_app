import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteWorkout } from "@/functions/workouts";
import { useToast } from "@/hooks/use-toast";

export function useDeleteWorkout() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (workoutId: string) => deleteWorkout(workoutId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      toast({
        title: "Success",
        description: "Workout deleted successfully",
      });
    },
    onError: (error) => {
      console.error("Error deleting workout:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete the workout. Please try again.",
      });
    },
  });
}
