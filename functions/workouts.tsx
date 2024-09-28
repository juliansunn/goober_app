import {
  CreateWorkoutInput,
  UpdateWorkoutInput,
} from "@/schemas/workout-schema";
import { Workout } from "@/types/workouts";

export async function getWorkoutById(workoutId: string): Promise<Workout> {
  const response = await fetch(`/api/workouts/${workoutId.toString()}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch workout");
  }

  return response.json();
}

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

export async function deleteWorkout(workoutId: string) {
  const response = await fetch(`/api/workouts/${workoutId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Failed to delete workout");
  }

  return response.json();
}

export async function updateWorkout(
  workoutId: string,
  workoutData: UpdateWorkoutInput
) {
  const response = await fetch(`/api/workouts/${workoutId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(workoutData),
  });

  if (!response.ok) {
    throw new Error("Failed to update workout");
  }

  return response.json();
}
