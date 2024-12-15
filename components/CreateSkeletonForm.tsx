"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { WorkoutSkeleton } from "@/types";

interface CreateSkeletonFormProps {
  onSubmit: (data: WorkoutSkeleton) => void;
}

export function CreateSkeletonForm({ onSubmit }: CreateSkeletonFormProps) {
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const skeletonData: WorkoutSkeleton = {
      schedule: {
        startDate: formData.startDate,
        endDate: formData.endDate,
        description: formData.description,
        phases: [],
      },
    };
    onSubmit(skeletonData);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="startDate"
          className="block text-sm font-medium text-gray-700"
        >
          Start Date
        </label>
        <Input
          type="date"
          id="startDate"
          name="startDate"
          value={formData.startDate}
          onChange={handleInputChange}
          required
        />
      </div>
      <div>
        <label
          htmlFor="endDate"
          className="block text-sm font-medium text-gray-700"
        >
          End Date
        </label>
        <Input
          type="date"
          id="endDate"
          name="endDate"
          value={formData.endDate}
          onChange={handleInputChange}
          required
        />
      </div>
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description
        </label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          required
        />
      </div>
      <Button type="submit">Create Workout Skeleton</Button>
    </form>
  );
}
