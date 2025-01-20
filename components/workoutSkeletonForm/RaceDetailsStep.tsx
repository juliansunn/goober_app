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
import { addMonths } from "date-fns";
import { DatePicker } from "../ui/date-picker";

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
  console.log("formData", formData);
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

      <div>
        <label className="text-sm font-medium">Start Date</label>
        <DatePicker
          date={new Date(formData.startDate)}
          onDateChange={(date) => {
            onDateChange("startDate", date ?? null);
          }}
          placeholder="Select start date"
        />
      </div>

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
      <div>
        <label className="text-sm font-medium">Race Date</label>
        <DatePicker
          date={formData.raceDate ? new Date(formData.raceDate) : new Date()}
          onDateChange={(date) => {
            onDateChange("raceDate", date ?? null);
          }}
          // fromDate={addMonths(new Date(formData.startDate), 1)}
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext}>Next</Button>
      </div>
    </div>
  );
}
