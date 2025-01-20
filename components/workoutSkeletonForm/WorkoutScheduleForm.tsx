"use client";

import { useForm, useFieldArray, Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { useState } from "react";
import { WorkoutScheduleFormData } from "@/types/workout";
import { BasicDetailsSection } from "./BasicDetailsSection";
import { PhaseView } from "../PhaseView";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import { format } from "date-fns";
import { PhaseDialog } from "./PhaseDialog";
import { WorkoutScheduleFormDataSchema } from "@/schemas/skeleton";
import { useWorkoutForm } from "@/hooks/useWorkoutForm";
import { PhaseObjective } from "@/types/skeleton";

interface WorkoutSkeletonFormProps {
  initialData: WorkoutScheduleFormData;
}

export function WorkoutScheduleForm({ initialData }: WorkoutSkeletonFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedPhases, setExpandedPhases] = useState<Record<number, boolean>>(
    {}
  );
  const { createWorkoutSchedule, updateWorkoutSchedule } = useWorkoutForm();
  console.log(initialData);

  const form = useForm<WorkoutScheduleFormData>({
    resolver: zodResolver(WorkoutScheduleFormDataSchema),
    defaultValues: {
      id: initialData.id,
      scheduleTitle: initialData.scheduleTitle,
      startDate: initialData.startDate,
      raceName: initialData.raceName,
      raceType: initialData.raceType,
      raceDistance: initialData.raceDistance,
      customDistance: initialData.customDistance,
      customDistanceUnit: initialData.customDistanceUnit,
      raceDate: initialData.raceDate,
      restDay: initialData.restDay,
      experienceLevel: initialData.experienceLevel,
      goalTimeHours: initialData.goalTimeHours,
      goalTimeMinutes: initialData.goalTimeMinutes,
      goalTimeSeconds: initialData.goalTimeSeconds,
      additionalNotes: initialData.additionalNotes,
      schedule: {
        description: initialData.schedule?.description ?? "",
        phases:
          initialData.schedule?.phases.map((phase) => ({
            id: phase.id,
            name: phase.name,
            startDate: phase.startDate,
            endDate: phase.endDate,
            objective: phase.objective,
            weeks: phase.weeks?.map((week) => ({
              id: week.id,
              weekNumber: week.weekNumber,
              startDate: week.startDate,
              endDate: week.endDate,
              focus: week.focus,
              description: week.description,
              volumeValue: week.volumeValue,
              volumeType: week.volumeType,
            })),
          })) ?? [],
      },
    },
  });

  const {
    fields: phases,
    append: appendPhase,
    remove: removePhase,
  } = useFieldArray({
    control: form.control,
    name: "schedule.phases",
  });

  const { isDirty } = form.formState;

  const handleAddPhase = () => {
    const formValues = form.getValues();
    appendPhase({
      name: `Phase ${phases.length + 1}`,
      startDate: formValues.startDate,
      endDate: formValues.raceDate,
      objective: PhaseObjective.BASE,
      weeks: [],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = form.getValues();
    try {
      setIsSubmitting(true);
      if (data.id) {
        await updateWorkoutSchedule({ data });
        toast.success("Workout schedule updated successfully");
      } else {
        await createWorkoutSchedule(data);
        toast.success("Workout schedule created successfully");
      }
    } catch (error) {
      console.error("Error saving workout schedule:", error);
      toast.error("Failed to save workout schedule. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date) => {
    return format(date, "MMMM d, yyyy");
  };

  const handleWeekMove = (
    fromPhaseIndex: number,
    toPhaseIndex: number,
    weekIndex: number,
    direction: "up" | "down"
  ) => {
    const values = form.getValues();
    const updatedPhases = [...(values.schedule?.phases ?? [])];

    const fromPhase = updatedPhases[fromPhaseIndex];
    const toPhase = updatedPhases[toPhaseIndex];

    if (direction === "up") {
      // Move week to previous phase
      const weekToMove = fromPhase.weeks[0];

      // Update the source phase
      updatedPhases[fromPhaseIndex] = {
        ...fromPhase,
        weeks: fromPhase.weeks.slice(1),
        startDate: fromPhase.weeks[1]?.startDate || fromPhase.endDate,
      };

      // Update the target phase
      updatedPhases[toPhaseIndex] = {
        ...toPhase,
        weeks: [...toPhase.weeks, weekToMove],
        endDate: weekToMove.endDate,
      };

      toast.success(
        `Moving Week ${weekToMove.weekNumber} from Phase ${fromPhaseIndex + 1} to Phase ${toPhaseIndex + 1}`
      );
    } else {
      // Move week to next phase
      const weekToMove = fromPhase.weeks[fromPhase.weeks.length - 1];

      // Update the source phase
      updatedPhases[fromPhaseIndex] = {
        ...fromPhase,
        weeks: fromPhase.weeks.slice(0, -1),
        endDate:
          fromPhase.weeks[fromPhase.weeks.length - 2]?.endDate ||
          fromPhase.startDate,
      };

      // Update the target phase
      updatedPhases[toPhaseIndex] = {
        ...toPhase,
        weeks: [weekToMove, ...toPhase.weeks],
        startDate: weekToMove.startDate,
      };

      toast.success(
        `Moving Week ${weekToMove.weekNumber} from Phase ${fromPhaseIndex + 1} to Phase ${toPhaseIndex + 1}`
      );
    }

    // Preserve expanded states using phase indices
    const currentExpandedState = expandedPhases[fromPhaseIndex];

    setExpandedPhases((prev) => ({
      ...prev,
      [fromPhaseIndex]: currentExpandedState,
      [toPhaseIndex]: currentExpandedState,
    }));

    form.setValue("schedule.phases", updatedPhases);
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-8">
        <h2 className="text-2xl font-bold tracking-tight">
          Workout Schedule Builder
        </h2>
        <div className="space-y-6">
          <BasicDetailsSection control={form.control} />

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Training Phases</h3>
              <PhaseDialog
                onAddPhase={(phase) => appendPhase(phase)}
                defaultValues={{
                  startDate: form.getValues().startDate,
                  endDate: form.getValues().raceDate,
                }}
                existingPhases={phases}
                scheduleStartDate={form.getValues().startDate}
                scheduleEndDate={form.getValues().raceDate}
              />
            </div>

            {phases.length === 0 ? (
              <div className="rounded-lg border p-6">
                <p className="text-center text-muted-foreground">
                  {`No phases added yet. Click "Add Phase" to begin building your
                  training plan.`}
                </p>
              </div>
            ) : (
              <div className="relative w-full">
                <div className="space-y-4 px-4">
                  {phases.map((phase, index) => (
                    <PhaseView
                      key={phase.id}
                      phase={phase}
                      phaseIndex={index}
                      totalPhases={phases.length}
                      onUpdate={(updatedPhase) => {
                        const values = form.getValues();
                        const updatedPhases = [
                          ...(values.schedule?.phases ?? []),
                        ];
                        updatedPhases[index] = updatedPhase;
                        form.setValue("schedule.phases", updatedPhases);
                      }}
                      onRemove={() => removePhase(index)}
                      isExpanded={!!expandedPhases[index]}
                      onExpandToggle={() => {
                        setExpandedPhases((prev) => ({
                          ...prev,
                          [index]: !prev[index],
                        }));
                      }}
                      previousPhase={index > 0 ? phases[index - 1] : undefined}
                      nextPhase={
                        index < phases.length - 1
                          ? phases[index + 1]
                          : undefined
                      }
                      onMoveWeek={(weekIndex, direction) => {
                        const toPhaseIndex =
                          direction === "up" ? index - 1 : index + 1;
                        handleWeekMove(
                          index,
                          toPhaseIndex,
                          weekIndex,
                          direction
                        );
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={
              isSubmitting ||
              phases.length === 0 ||
              (initialData.id !== undefined && !isDirty)
            }
            className="w-full"
          >
            {isSubmitting ? "Saving..." : "Save Workout Schedule"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
