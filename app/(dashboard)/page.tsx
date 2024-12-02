import { WorkoutBuilder } from "@/components/workoutBuilder/workout-builder";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const { userId } = auth();

  if (!userId) {
    redirect("/");
  }

  return (
    <div>
      <WorkoutBuilder />
    </div>
  );
}
