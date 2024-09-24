// import { Workout } from "@/types/workouts";

import { CreateWorkoutInput } from "@/schemas/workout-schema";

export async function createWorkout(workoutData: CreateWorkoutInput) {
  const response = await fetch("/api/workouts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(workoutData),
  });

  if (!response.ok) {
    throw new Error("Failed to create workout");
  }

  return response.json();
}

export async function getWorkoutsList(params: {
  page: number;
  limit: number;
  type: "authored" | "favorited" | null;
}) {
  const searchParams = new URLSearchParams({
    page: params.page.toString(),
    limit: params.limit.toString(),
    ...(params.type && { type: params.type }),
  });

  const response = await fetch(`/api/workouts?${searchParams.toString()}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch workouts");
  }

  return response.json();
}
