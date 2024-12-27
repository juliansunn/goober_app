"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { useState } from "react";
import { WorkoutType } from "@/types/workouts";
import { WorkoutSkeletonFormData } from "@/types/skeleton";
import { WorkoutSkeletonFormDataSchema } from "@/schemas/skeleton";
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

interface WorkoutSkeletonFormProps {
  initialData?: WorkoutSkeletonFormData;
  onSave: (data: WorkoutSkeletonFormData) => Promise<void>;
}

export function WorkoutSkeletonForm({
  initialData,
  onSave,
}: WorkoutSkeletonFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<WorkoutSkeletonFormData>({
    resolver: zodResolver(WorkoutSkeletonFormDataSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      type: initialData?.type ?? WorkoutType.RUN,
      startDate: initialData?.startDate ?? new Date().toISOString(),
      endDate: initialData?.endDate ?? new Date().toISOString(),
      description: initialData?.description ?? "",
      phases: initialData?.phases ?? [],
    },
  });

  const {
    fields: phases,
    append: appendPhase,
    remove: removePhase,
  } = useFieldArray({
    control: form.control,
    name: "phases",
  });

  const handleAddPhase = () => {
    const formValues = form.getValues();
    appendPhase({
      name: `Phase ${phases.length + 1}`,
      startDate: formValues.startDate,
      endDate: formValues.endDate,
      objective: "",
      weeks: [],
    });
  };

  const handleSubmit = async (data: WorkoutSkeletonFormData) => {
    try {
      setIsSubmitting(true);
      await onSave(data);
      toast.success("Workout skeleton saved successfully!");
    } catch (error) {
      console.error("Error saving workout skeleton:", error);
      toast.error("Failed to save workout skeleton");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMMM d, yyyy");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Workout Skeleton Builder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <BasicDetailsSection control={form.control} />

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Training Phases</h3>
                <PhaseDialog
                  onAddPhase={(phase) => appendPhase(phase)}
                  defaultValues={{
                    startDate: form.getValues().startDate,
                    endDate: form.getValues().endDate,
                  }}
                  existingPhases={phases}
                  scheduleStartDate={form.getValues().startDate}
                  scheduleEndDate={form.getValues().endDate}
                />
              </div>

              {phases.length === 0 ? (
                <Card className="p-6">
                  <p className="text-center text-muted-foreground">
                    {`No phases added yet. Click "Add Phase" to begin building
                    your training plan.`}
                  </p>
                </Card>
              ) : (
                <Carousel className="w-full">
                  <CarouselContent>
                    {phases.map((phase, index) => (
                      <CarouselItem key={phase.id}>
                        <PhaseView
                          phase={phase}
                          phaseIndex={index}
                          totalPhases={phases.length}
                          onUpdate={(updatedPhase) => {
                            const values = form.getValues();
                            const updatedPhases = [...values.phases];
                            updatedPhases[index] = updatedPhase;
                            form.setValue("phases", updatedPhases);
                          }}
                          onRemove={() => removePhase(index)}
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || phases.length === 0}
              className="w-full"
            >
              {isSubmitting ? "Saving..." : "Save Workout Skeleton"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
