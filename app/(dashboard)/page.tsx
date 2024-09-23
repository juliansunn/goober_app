import { WorkoutBuilder } from "@/components/workout-builder";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const { userId } = auth();

  if (!userId) {
    redirect("/");
  }

  return (
    <div>
      <h1>Welcome to your dashboard</h1>
      <WorkoutBuilder />
    </div>
  );
}
