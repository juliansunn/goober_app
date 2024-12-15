"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { PhaseView } from "./PhaseView";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import { format } from "date-fns";
import type { WorkoutSkeleton } from "@/types";

interface WorkoutSkeletonProps {
  skeletonData?: WorkoutSkeleton;
}

export function WorkoutSkeleton({ skeletonData }: WorkoutSkeletonProps) {
  if (!skeletonData) return null;

  const totalPhases = skeletonData?.schedule.phases.length;

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMMM d, yyyy");
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          Workout Schedule: {formatDate(skeletonData?.schedule.startDate)} to{" "}
          {formatDate(skeletonData?.schedule.endDate)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">{skeletonData.schedule.description}</p>
        <Carousel className="w-full">
          <CarouselContent>
            {skeletonData?.schedule.phases.map((phase, index) => (
              <CarouselItem key={index}>
                <PhaseView
                  phase={phase}
                  phaseNumber={index + 1}
                  totalPhases={totalPhases}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
        <div className="mt-4 space-x-2">
          <Button variant="secondary" onClick={() => {}}>
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
