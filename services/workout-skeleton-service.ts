import { WorkoutSkeleton } from "@/types";
import { WorkoutSkeletonFormData } from "@/types/skeleton";

export const workoutSkeletonService = {
  async getAll(): Promise<WorkoutSkeleton[]> {
    const response = await fetch("/api/workout-skeletons");
    if (!response.ok) {
      throw new Error("Failed to fetch workout skeletons");
    }
    return response.json();
  },

  async getById(id: string): Promise<WorkoutSkeleton> {
    const response = await fetch(`/api/workout-skeletons/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch workout skeleton");
    }
    return response.json();
  },

  async create(data: WorkoutSkeletonFormData): Promise<WorkoutSkeleton> {
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
  },

  async update(
    id: string,
    data: Partial<WorkoutSkeleton>
  ): Promise<WorkoutSkeleton> {
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
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`/api/workout-skeletons/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete workout skeleton");
    }
  },
};
