import { WorkoutCalendarComponent } from "@/components/workout-calendar";
import { ScheduledWorkout } from "@/types/workouts";
import { useQuery } from "@tanstack/react-query";

interface ScheduledWorkoutResponse {
  scheduledWorkouts: ScheduledWorkout[];
}

export default function CalendarPage() {
  return <WorkoutCalendarComponent initialWorkouts={[]} />;
}
