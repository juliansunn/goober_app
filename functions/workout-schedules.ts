import { WorkoutScheduleFormData } from "@/types/workout";

export const getAll = async (): Promise<WorkoutScheduleFormData[]> => {
  const response = await fetch("/api/workout-skeletons");
  console.log("response", response);
  if (!response.ok) {
    throw new Error("Failed to fetch workout skeletons");
  }
  return response.json();
};

export const getById = async (id: number): Promise<WorkoutScheduleFormData> => {
  const response = await fetch(`/api/workout-skeletons/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch workout skeleton");
  }
  return response.json();
};

export const create = async (
  data: WorkoutScheduleFormData
): Promise<WorkoutScheduleFormData> => {
  console.log("data", data);

  const response = await fetch("/api/workout-skeletons", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to create workout skeleton");
  }
  return response.json();
};

export const update = async (
  id: number,
  data: Partial<WorkoutScheduleFormData>
): Promise<WorkoutScheduleFormData> => {
  console.log("data", data);
  const response = await fetch(`/api/workout-skeletons/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to update workout skeleton");
  }
  return response.json();
};

export const deleteScheduledWorkout = async (id: string): Promise<void> => {
  const response = await fetch(`/api/workout-skeletons/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete workout skeleton");
  }
};
