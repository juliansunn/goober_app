"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useWorkout } from "@/app/contexts/WorkoutContext";
import { ScrollArea } from "./ui/scroll-area";
import { DatePicker } from "@/components/ui/date-picker";

type DistanceOption = {
  label: string;
  value: string;
};

const raceDistances: Record<string, DistanceOption[]> = {
  running: [
    { label: "5K", value: "5K" },
    { label: "10K", value: "10K" },
    { label: "Half Marathon", value: "Half Marathon" },
    { label: "Marathon", value: "Marathon" },
    { label: "Custom", value: "custom" },
  ],
  cycling: [
    { label: "20K", value: "20K" },
    { label: "40K", value: "40K" },
    { label: "100K", value: "100K" },
    { label: "Century (100 miles)", value: "Century" },
    { label: "Custom", value: "custom" },
  ],
  swimming: [
    { label: "500m", value: "500m" },
    { label: "1500m", value: "1500m" },
    { label: "2.4 miles (Ironman)", value: "2.4 miles" },
    { label: "Custom", value: "custom" },
  ],
  triathlon: [
    { label: "Sprint", value: "Sprint" },
    { label: "Olympic", value: "Olympic" },
    { label: "Half Ironman", value: "Half Ironman" },
    { label: "Ironman", value: "Ironman" },
    { label: "Custom", value: "custom" },
  ],
};

export function WorkoutScheduleCreatorComponent() {
  const {
    generateSchedule,
    generatedScheduledWorkouts,
    isLoadingScheduledWorkouts,
    setGeneratedScheduledWorkouts,
  } = useWorkout();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    scheduleTitle: "",
    startDate: new Date(),
    raceName: "",
    raceType: "",
    raceDistance: "",
    customDistance: "",
    customDistanceUnit: "",
    raceDate: new Date(),
    restDay: "",
    experienceLevel: "",
    goalTimeHours: "",
    goalTimeMinutes: "",
    goalTimeSeconds: "",
    additionalNotes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCustomDistance, setShowCustomDistance] = useState(false);

  useEffect(() => {
    if (formData.raceDistance === "custom") {
      setShowCustomDistance(true);
    } else {
      setShowCustomDistance(false);
      setFormData((prev) => ({
        ...prev,
        customDistance: "",
        customDistanceUnit: "",
      }));
    }
  }, [formData.raceDistance]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (
      ["goalTimeHours", "goalTimeMinutes", "goalTimeSeconds"].includes(name)
    ) {
      const numValue = parseInt(value, 10);
      if (isNaN(numValue) || numValue < 0) return;
      if (name === "goalTimeHours" && numValue > 99) return;
      if (
        (name === "goalTimeMinutes" || name === "goalTimeSeconds") &&
        numValue > 59
      )
        return;
    }
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.raceName.trim())
        newErrors.raceName = "Race name is required";
      if (!formData.raceType) newErrors.raceType = "Race type is required";
      if (!formData.raceDistance)
        newErrors.raceDistance = "Race distance is required";
      if (
        formData.raceDistance === "custom" &&
        (!formData.customDistance || !formData.customDistanceUnit)
      ) {
        newErrors.customDistance = "Custom distance and unit are required";
      }
      if (!formData.raceDate) newErrors.raceDate = "Race date is required";
    } else if (currentStep === 2) {
      // if (!formData.restDay) newErrors.restDay = "Rest day is required";
      if (!formData.experienceLevel)
        newErrors.experienceLevel = "Experience level is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(step)) {
      const goalTime = `${formData.goalTimeHours.padStart(
        2,
        "0"
      )}:${formData.goalTimeMinutes.padStart(
        2,
        "0"
      )}:${formData.goalTimeSeconds.padStart(2, "0")}`;
      const submissionData = {
        ...formData,
        goalTime,
      };

      await generateSchedule(submissionData);
    }
  };

  const renderResult = () => {
    if (!generatedScheduledWorkouts) return null;

    return (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Generated Workout Schedule</h3>
        <ScrollArea className="h-[400px] w-full rounded-md border p-4">
          <div className="space-y-4">
            {generatedScheduledWorkouts.map((workout, index) => (
              <div key={index} className="space-y-2">
                <h4 className="font-medium">Workout {index + 1}</h4>
                <div className="rounded-lg bg-gray-100 p-4">
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(workout.scheduledAt).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Title:</strong> {workout.workout.title}
                  </p>
                  <p>
                    <strong>Type:</strong> {workout.workout.type}
                  </p>
                  <p>
                    <strong>Notes:</strong> {workout.notes}
                  </p>
                  <div className="mt-2">
                    <strong>Description:</strong>
                    <p className="whitespace-pre-wrap">
                      {workout.workout.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              setGeneratedScheduledWorkouts([]);
              setStep(1);
            }}
          >
            Update Questionnaire
          </Button>
          <Button variant="secondary" onClick={(e) => handleSubmit(e)}>
            Regenerate
          </Button>
          <Button
            onClick={() => {
              console.log("saving");
            }}
          >
            Save Schedule
          </Button>
        </div>
      </div>
    );
  };

  const renderQuestion = () => {
    if (isLoadingScheduledWorkouts) {
      return (
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Generating your workout schedule...</p>
        </div>
      );
    }

    if (generatedScheduledWorkouts && generatedScheduledWorkouts.length > 0) {
      return renderResult();
    }

    switch (step) {
      case 0:
        return (
          <div className="flex flex-col items-center justify-center">
            <Button onClick={() => setStep(1)} size="lg">
              Create New Schedule
            </Button>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Race Details</h3>
            <div className="space-y-2">
              <Label htmlFor="scheduleTitle">Schedule Title</Label>
              <Input
                id="scheduleTitle"
                name="scheduleTitle"
                value={formData.scheduleTitle}
                onChange={handleInputChange}
                placeholder="Enter schedule title"
                required
              />
              {errors.scheduleTitle && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.scheduleTitle}</AlertDescription>
                </Alert>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <DatePicker
                date={formData.startDate}
                onDateChange={(date) =>
                  setFormData((prev) => ({
                    ...prev,
                    startDate: date || new Date(),
                  }))
                }
                placeholder="Select start date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="raceName">Race Name</Label>
              <Input
                id="raceName"
                name="raceName"
                value={formData.raceName}
                onChange={handleInputChange}
                placeholder="Enter race name"
                required
              />
              {errors.raceName && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.raceName}</AlertDescription>
                </Alert>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="raceType">Race Type</Label>
              <Select
                name="raceType"
                onValueChange={(value) => handleSelectChange("raceType", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select race type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="cycling">Cycling</SelectItem>
                  <SelectItem value="swimming">Swimming</SelectItem>
                  <SelectItem value="triathlon">Triathlon</SelectItem>
                </SelectContent>
              </Select>
              {errors.raceType && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.raceType}</AlertDescription>
                </Alert>
              )}
            </div>
            {formData.raceType && (
              <div className="space-y-2">
                <Label htmlFor="raceDistance">Race Distance</Label>
                <Select
                  name="raceDistance"
                  onValueChange={(value) =>
                    handleSelectChange("raceDistance", value)
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select race distance" />
                  </SelectTrigger>
                  <SelectContent>
                    {raceDistances[formData.raceType].map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.raceDistance && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.raceDistance}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}
            {showCustomDistance && (
              <div className="space-y-2">
                <Label htmlFor="customDistance">Custom Distance</Label>
                <div className="flex space-x-2">
                  <Input
                    id="customDistance"
                    name="customDistance"
                    value={formData.customDistance}
                    onChange={handleInputChange}
                    placeholder="Enter distance"
                    type="number"
                    className="flex-grow"
                    required
                  />
                  <Select
                    name="customDistanceUnit"
                    onValueChange={(value) =>
                      handleSelectChange("customDistanceUnit", value)
                    }
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
                {errors.customDistance && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.customDistance}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="raceDate">Race Date</Label>
              <DatePicker
                date={formData.raceDate}
                onDateChange={(date) =>
                  setFormData((prev) => ({
                    ...prev,
                    raceDate: date || new Date(),
                  }))
                }
                placeholder="Select race date"
              />
              {errors.raceDate && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.raceDate}</AlertDescription>
                </Alert>
              )}
            </div>
            <div className="flex justify-between">
              <Button onClick={handleBack} variant="outline">
                Back
              </Button>
              <Button onClick={handleNext}>Next</Button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Training Preferences</h3>
            <div className="space-y-2">
              <Label>Preferred Rest Day (Optional)</Label>
              <Select
                name="restDay"
                onValueChange={(value) => handleSelectChange("restDay", value)}
                required
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
              {errors.restDay && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.restDay}</AlertDescription>
                </Alert>
              )}
            </div>
            <div className="space-y-2">
              <Label>Experience Level</Label>
              <RadioGroup
                onValueChange={(value) =>
                  handleSelectChange("experienceLevel", value)
                }
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
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
                  placeholder="SS"
                  className="w-20"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="additionalNotes">
                Additional Notes (Optional)
              </Label>
              <textarea
                id="additionalNotes"
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleInputChange}
                placeholder="Enter any additional notes or preferences for your workout schedule"
                className="w-full h-24 px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
              />
            </div>

            <div className="flex justify-between">
              <Button onClick={handleBack} variant="outline">
                Back
              </Button>
              <Button onClick={handleSubmit}>Create Workout Schedule</Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return <div className="w-full max-w-2xl mx-auto">{renderQuestion()}</div>;
}
