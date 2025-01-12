import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorkoutScheduleFormData, FormErrors } from "@/types/workout";

interface TrainingPreferencesStepProps {
  formData: WorkoutScheduleFormData;
  errors: FormErrors;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onSelectChange: (name: string, value: string) => void;
  onBack: () => void;
}

export function TrainingPreferencesStep({
  formData,
  errors,
  onInputChange,
  onSelectChange,
  onBack,
}: TrainingPreferencesStepProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Training Preferences</h3>

      <div className="space-y-2">
        <Label>Preferred Rest Day (Optional)</Label>
        <Select
          name="restDay"
          onValueChange={(value) => onSelectChange("restDay", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select rest day" />
          </SelectTrigger>
          <SelectContent>
            {[
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ].map((day) => (
              <SelectItem key={day} value={day.toLowerCase()}>
                {day}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Experience Level</Label>
        <RadioGroup
          onValueChange={(value) => onSelectChange("experienceLevel", value)}
          required
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="beginner" id="beginner" />
            <Label htmlFor="beginner">Beginner</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="intermediate" id="intermediate" />
            <Label htmlFor="intermediate">Intermediate</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="advanced" id="advanced" />
            <Label htmlFor="advanced">Advanced</Label>
          </div>
        </RadioGroup>
        {errors.experienceLevel && (
          <Alert variant="destructive">
            <AlertDescription>{errors.experienceLevel}</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="goalTime">Goal Time (optional)</Label>
        <div className="flex space-x-2">
          <Input
            id="goalTimeHours"
            name="goalTimeHours"
            type="number"
            min="0"
            max="99"
            value={formData.goalTimeHours}
            onChange={onInputChange}
            placeholder="HH"
            className="w-20"
          />
          <span className="flex items-center">:</span>
          <Input
            id="goalTimeMinutes"
            name="goalTimeMinutes"
            type="number"
            min="0"
            max="59"
            value={formData.goalTimeMinutes}
            onChange={onInputChange}
            placeholder="MM"
            className="w-20"
          />
          <span className="flex items-center">:</span>
          <Input
            id="goalTimeSeconds"
            name="goalTimeSeconds"
            type="number"
            min="0"
            max="59"
            value={formData.goalTimeSeconds}
            onChange={onInputChange}
            placeholder="SS"
            className="w-20"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
        <textarea
          id="additionalNotes"
          name="additionalNotes"
          value={formData.additionalNotes}
          onChange={onInputChange}
          placeholder="Enter any additional notes or preferences for your workout schedule"
          className="w-full h-24 px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
        />
      </div>

      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline">
          Back
        </Button>
      </div>
    </div>
  );
}
