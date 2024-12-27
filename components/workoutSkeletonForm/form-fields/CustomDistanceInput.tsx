import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "./FormField";

interface CustomDistanceInputProps {
  distance: string;
  unit: string;
  error?: string;
  onDistanceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUnitChange: (value: string) => void;
}

export function CustomDistanceInput({
  distance,
  unit,
  error,
  onDistanceChange,
  onUnitChange,
}: CustomDistanceInputProps) {
  return (
    <FormField id="customDistance" label="Custom Distance" error={error}>
      <div className="flex space-x-2">
        <Input
          id="customDistance"
          name="customDistance"
          value={distance}
          onChange={onDistanceChange}
          placeholder="Enter distance"
          type="number"
          className="flex-grow"
          required
        />
        <Select
          name="customDistanceUnit"
          value={unit}
          onValueChange={onUnitChange}
          required
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Unit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="km">km</SelectItem>
            <SelectItem value="mi">mi</SelectItem>
            <SelectItem value="m">m</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </FormField>
  );
}
