import { CreateScheduledWorkoutInput } from "@/app/api/scheduled-workouts/route";
import {
  CreateWorkoutInput,
  UpdateWorkoutInput,
} from "@/schemas/workout-schema";
import { Workout } from "@/types/workouts";

export async function getScheduledWorkoutById(
  scheduledWorkoutId: string
): Promise<Workout> {
  const response = await fetch(
    `/api/scheduled-workouts/${scheduledWorkoutId.toString()}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch workout");
  }

  return response.json();
}

export async function createScheduledWorkout(
  scheduledWorkoutData: CreateScheduledWorkoutInput
) {
  const response = await fetch("/api/scheduled-workouts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(scheduledWorkoutData),
  });

  if (!response.ok) {
    throw new Error("Failed to create scheduled workout");
  }

  return response.json();
}

export async function getScheduledWorkoutsList(params: {
  startDate: Date;
  endDate: Date;
}) {
  const searchParams = new URLSearchParams({
    startDate: params.startDate.toISOString(),
    endDate: params.endDate.toISOString(),
  });

  const response = await fetch(
    `/api/scheduled-workouts?${searchParams.toString()}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch scheduled workouts");
  }

  return response.json();
}

export async function deleteScheduledWorkout(scheduledWorkoutId: string) {
  const response = await fetch(
    `/api/scheduled-workouts/${scheduledWorkoutId}`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete scheduled workout");
  }

  return response.json();
}

export async function updateScheduledWorkout(
  scheduledWorkoutId: string,
  scheduledAt: Date
) {
  const response = await fetch(
    `/api/scheduled-workouts/${scheduledWorkoutId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheduledAt }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update workout");
  }

  return response.json();
}
