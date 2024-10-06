import prisma from "@/lib/prisma";
import { UpdateWorkoutInput } from "@/schemas/workout-schema";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { workoutId: string } }
) {
  const { workoutId } = params;
  const workout = await prisma.workout.findUnique({
    where: {
      id: parseInt(workoutId),
    },
    include: {
      items: {
        include: {
          repeatGroup: {
            include: {
              intervals: true,
            },
          },
          interval: true,
        },
      },
      author: true,
      favoritedBy: true,
    },
  });
  return NextResponse.json(workout);
}

export async function DELETE(
  request: Request,
  { params }: { params: { workoutId: string } }
) {
  const { workoutId } = params;
  const workout = await prisma.workout.delete({
    where: {
      id: parseInt(workoutId),
    },
  });
  return NextResponse.json({ message: "Workout deleted" });
}

export async function PUT(
  request: Request,
  { params }: { params: { workoutId: string } }
) {
  const { workoutId } = params;
  const data: UpdateWorkoutInput = await request.json();
  const workout = await prisma.workout.update({
    where: {
      id: parseInt(workoutId),
    },
    data: {
      ...data,
      items: {
        deleteMany: {},
        create: data.items?.map((item, index) => ({
          order: index,
          interval: item.interval
            ? {
                create: {
                  type: item.interval.type,
                  durationType: item.interval.durationType,
                  durationValue: item.interval.durationValue,
                  durationUnit: item.interval.durationUnit,
                  intensityType: item.interval.intensityType,
                  intensityMin: item.interval.intensityMin,
                  intensityMax: item.interval.intensityMax,
                },
              }
            : undefined,
          repeatGroup: item.repeatGroup
            ? {
                create: {
                  repeats: item.repeatGroup.repeats,
                  intervals: {
                    create: item.repeatGroup.intervals.map((interval) => ({
                      type: interval.type,
                      durationType: interval.durationType,
                      durationValue: interval.durationValue,
                      durationUnit: interval.durationUnit,
                      intensityType: interval.intensityType,
                      intensityMin: interval.intensityMin,
                      intensityMax: interval.intensityMax,
                    })),
                  },
                },
              }
            : undefined,
        })),
      },
    },
  });
  return NextResponse.json(workout);
}
