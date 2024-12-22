import { WorkoutScheduleCreatorComponent } from "@/components/workoutScheduleCreator";

export default function CreateSchedulePage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Create Workout Schedule</h1>
      <WorkoutScheduleCreatorComponent />
    </div>
  );
}
