import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "./FormField";
import { WorkoutType } from "@/types/workouts";

interface RaceTypeSelectProps {
  value: WorkoutType;
  error?: string;
  onValueChange: (value: WorkoutType) => void;
}

export function RaceTypeSelect({
  value,
  error,
  onValueChange,
}: RaceTypeSelectProps) {
  return (
    <FormField id="raceType" label="Race Type" error={error}>
      <Select
        name="raceType"
        value={value}
        onValueChange={(value) => onValueChange(value as WorkoutType)}
        required
      >
        <SelectTrigger>
          <SelectValue placeholder="Select race type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={WorkoutType.RUN}>Running</SelectItem>
          <SelectItem value={WorkoutType.BIKE}>Cycling</SelectItem>
          <SelectItem value={WorkoutType.SWIM}>Swimming</SelectItem>
          <SelectItem value={WorkoutType.TRIATHLON}>Triathlon</SelectItem>
        </SelectContent>
      </Select>
    </FormField>
  );
}
