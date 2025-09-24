"use server";

import prisma from "@/lib/prisma";
import { Prisma, WorkoutType } from "@prisma/client";

// Helper function to create an interval
function createIntervalData(interval: any) {
  return {
    type: interval.type,
    durationType: interval.durationType,
    durationValue: interval.durationValue,
    durationUnit: interval.durationUnit,
    intensityType: interval.intensityType,
    intensityMin: interval.intensityMin,
    intensityMax: interval.intensityMax,
  };
}

// Helper function to create a repeat group
function createRepeatGroupData(repeatGroup: any) {
  return {
    repeats: repeatGroup.repeats,
    intervals: {
      create: repeatGroup.intervals.map(createIntervalData),
    },
  };
}

// Helper function to create workout items
function createWorkoutItemsData(
  items: any[]
): Prisma.WorkoutItemCreateWithoutWorkoutInput[] {
  return items.map((item, index) => ({
    order: index + 1,
    repeatGroup: item.repeatGroup
      ? {
          create: createRepeatGroupData(item.repeatGroup),
        }
      : undefined,
    interval: item.interval
      ? { create: createIntervalData(item.interval) }
      : undefined,
  }));
}

// Helper function to create the workout
export async function createWorkout(
  userId: number,
  title: string,
  description: string,
  type: WorkoutType,
  items: any[]
): Promise<
  Prisma.WorkoutGetPayload<{
    include: {
      author: true;
      items: {
        include: {
          interval: true;
          repeatGroup: {
            include: {
              intervals: true;
            };
          };
        };
      };
    };
  }>
> {
  return await prisma.workout.create({
    data: {
      title,
      description,
      type: type,
      author: { connect: { id: userId } },
      items: { create: createWorkoutItemsData(items) }, // Use the helper function here
    },
    include: {
      author: true,
      items: {
        include: {
          interval: true,
          repeatGroup: {
            include: {
              intervals: true,
            },
          },
        },
      },
    },
  });
}

