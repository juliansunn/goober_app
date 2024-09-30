import { NextApiRequest } from "next";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/scheduled-workouts/:scheduledWorkoutId
export async function GET(
  request: NextApiRequest,
  { params }: { params: { scheduledWorkoutId: string } }
) {
  const { scheduledWorkoutId } = params;
  const scheduledWorkout = await prisma.scheduledWorkout.findUnique({
    where: { id: parseInt(scheduledWorkoutId) },
    include: {
      user: true,
      workout: true,
    },
  });

  return NextResponse.json(scheduledWorkout);
}

// DELETE /api/scheduled-workouts/:scheduledWorkoutId
export async function DELETE(
  request: NextApiRequest,
  { params }: { params: { scheduledWorkoutId: string } }
) {
  const { scheduledWorkoutId } = params;
  await prisma.scheduledWorkout.delete({
    where: { id: parseInt(scheduledWorkoutId) },
  });
  return NextResponse.json("Deleted");
}

export type UpdateScheduledWorkoutInput = {
  scheduledAt: Date;
};

// PUT /api/scheduled-workouts/:scheduledWorkoutId
export async function PUT(
  request: Request,
  { params }: { params: { scheduledWorkoutId: string } }
) {
  const { scheduledWorkoutId } = params;
  const { scheduledAt } = await request.json();

  if (!scheduledAt) {
    return NextResponse.json(
      { error: "scheduledAt is required" },
      { status: 400 }
    );
  }

  const updatedScheduledWorkout = await prisma.scheduledWorkout.update({
    where: { id: parseInt(scheduledWorkoutId) },
    data: { scheduledAt: new Date(scheduledAt) },
  });

  return NextResponse.json(updatedScheduledWorkout);
}
