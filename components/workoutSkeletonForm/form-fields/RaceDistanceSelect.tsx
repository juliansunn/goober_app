import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "./FormField";
import { raceDistances } from "@/constants/workout-distances";
import { WorkoutType } from "@/types/workouts";

interface RaceDistanceSelectProps {
  raceType: WorkoutType;
  value: string;
  error?: string;
  onValueChange: (value: string) => void;
}

export function RaceDistanceSelect({
  raceType,
  value,
  error,
  onValueChange,
}: RaceDistanceSelectProps) {
  if (!raceType) return null;

  return (
    <FormField id="raceDistance" label="Race Distance" error={error}>
      <Select
        name="raceDistance"
        value={value}
        onValueChange={onValueChange}
        required
      >
        <SelectTrigger>
          <SelectValue placeholder="Select race distance" />
        </SelectTrigger>
        <SelectContent>
          {raceDistances[raceType].map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
}
