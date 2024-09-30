import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getOrCreateUser } from "../workouts/route";
import prisma from "@/lib/prisma";

export interface CreateScheduledWorkoutInput {
  workoutId: number;
  scheduledAt: Date;
}

// CREATE /api/scheduled-workouts
export async function POST(request: Request) {
  const clerkUser = await currentUser();
  if (!clerkUser)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await getOrCreateUser(clerkUser.id, {
      username: clerkUser.username,
      name: `${clerkUser.firstName} ${clerkUser.lastName}`,
      email: clerkUser.emailAddresses[0]?.emailAddress,
    });

    const data: CreateScheduledWorkoutInput = await request.json();

    const { workoutId, scheduledAt } = data;

    const scheduledWorkout = await prisma.scheduledWorkout.create({
      data: {
        userId: user.id,
        workoutId,
        scheduledAt,
      },
    });

    return NextResponse.json(scheduledWorkout);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// GET /api/scheduled-workouts
export async function GET(request: Request) {
  const clerkUser = await currentUser();
  if (!clerkUser)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await getOrCreateUser(clerkUser.id, {
      username: clerkUser.username,
      name: `${clerkUser.firstName} ${clerkUser.lastName}`,
      email: clerkUser.emailAddresses[0]?.emailAddress,
    });

    const { searchParams } = new URL(request.url);
    const now = new Date();
    const defaultStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const defaultEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const endDate = searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")!)
      : defaultEndDate;
    const startDate = searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : defaultStartDate;

    const scheduledWorkouts = await prisma.scheduledWorkout.findMany({
      where: {
        userId: user.id,
        scheduledAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        workout: {
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
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
          },
        },
      },
    });

    return NextResponse.json(scheduledWorkouts);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
