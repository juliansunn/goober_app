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

// export async function PUT(
//   request: Request,
//   { params }: { params: { workoutId: string } }
// ) {
//   const { workoutId } = params;
//   const data: UpdateWorkoutInput = await request.json();
//   const workout = await prisma.workout.update({
//     where: {
//       id: parseInt(workoutId),
//     },
//     data: {
//       ...data,
//     },
//   });
//   return NextResponse.json(workout);
// }
