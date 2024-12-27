import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "./form-fields/FormField";
import { DatePickerField } from "./form-fields/DatePickerField";
import { RaceTypeSelect } from "./form-fields/RaceTypeSelect";
import { RaceDistanceSelect } from "./form-fields/RaceDistanceSelect";
import { CustomDistanceInput } from "./form-fields/CustomDistanceInput";
import { WorkoutScheduleFormData, FormErrors } from "@/types/workout";
import { WorkoutType } from "@/types/workouts";

interface RaceDetailsStepProps {
  formData: WorkoutScheduleFormData;
  errors: FormErrors;
  showCustomDistance: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (name: string, value: WorkoutType | string) => void;
  onDateChange: (name: string, date: Date | null) => void;
  onNext: () => void;
}

export function RaceDetailsStep({
  formData,
  errors,
  showCustomDistance,
  onInputChange,
  onSelectChange,
  onDateChange,
  onNext,
}: RaceDetailsStepProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Race Details</h3>

      <FormField
        id="scheduleTitle"
        label="Schedule Title"
        error={errors.scheduleTitle}
      >
        <Input
          id="scheduleTitle"
          name="scheduleTitle"
          value={formData.scheduleTitle}
          onChange={onInputChange}
          placeholder="Enter schedule title"
          required
        />
      </FormField>

      <DatePickerField
        id="startDate"
        label="Start Date"
        date={formData.startDate}
        onDateChange={onDateChange}
        fieldName="startDate"
      />

      <FormField id="raceName" label="Race Name" error={errors.raceName}>
        <Input
          id="raceName"
          name="raceName"
          value={formData.raceName}
          onChange={onInputChange}
          placeholder="Enter race name"
          required
        />
      </FormField>

      <RaceTypeSelect
        value={formData.raceType as WorkoutType}
        error={errors.raceType}
        onValueChange={(value: WorkoutType) =>
          onSelectChange("raceType", value)
        }
      />

      <RaceDistanceSelect
        raceType={formData.raceType as WorkoutType}
        value={formData.raceDistance}
        error={errors.raceDistance}
        onValueChange={(value) => onSelectChange("raceDistance", value)}
      />

      {showCustomDistance && (
        <CustomDistanceInput
          distance={formData.customDistance}
          unit={formData.customDistanceUnit}
          error={errors.customDistance}
          onDistanceChange={onInputChange}
          onUnitChange={(value) => onSelectChange("customDistanceUnit", value)}
        />
      )}

      <DatePickerField
        id="raceDate"
        label="Race Date"
        date={formData.raceDate}
        error={errors.raceDate}
        onDateChange={onDateChange}
        fieldName="raceDate"
      />

      <div className="flex justify-end">
        <Button onClick={onNext}>Next</Button>
      </div>
    </div>
  );
}
