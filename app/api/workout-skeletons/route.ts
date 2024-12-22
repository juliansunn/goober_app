import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { getOrCreateUser } from "@/app/actions/user";
import { workoutSkeletonSchema } from "@/schemas/skeleton";
import { WorkoutSkeletonFormData } from "@/types/skeleton";

export async function GET() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await getOrCreateUser(clerkUser.id, {
      username: clerkUser.username,
      name: `${clerkUser.firstName} ${clerkUser.lastName}`,
      email: clerkUser.emailAddresses[0]?.emailAddress,
    });

    const workoutSkeletons = await prisma.workoutSkeleton.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(workoutSkeletons);
  } catch (error) {
    console.error("[WORKOUT_SKELETONS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await getOrCreateUser(clerkUser.id, {
      username: clerkUser.username,
      name: `${clerkUser.firstName} ${clerkUser.lastName}`,
      email: clerkUser.emailAddresses[0]?.emailAddress,
    });

    const body: WorkoutSkeletonFormData = await req.json();
    const title = body?.title;
    const type = body?.type;
    const validatedData = workoutSkeletonSchema.parse(body);
    const schedule = {
      title: title,
      type: type,
      ...validatedData.schedule,
    };

    const workoutSkeleton = await prisma.workoutSkeleton.create({
      data: {
        title: title,
        type: type,
        userId: user.id,
        description: schedule.description,
        startDate: new Date(schedule.startDate),
        endDate: new Date(schedule.endDate),
        phases: {
          create: schedule.phases.map((phase) => ({
            name: phase.name,
            startDate: new Date(phase.startDate),
            endDate: new Date(phase.endDate),
            objective: phase.objective,
            weeks: {
              create: phase.weeks.map((week) => ({
                weekNumber: week.weekNumber,
                startDate: new Date(week.startDate),
                endDate: new Date(week.endDate),
                focus: week.focus,
                description: week.description,
                volumeValue: week.volumeValue,
                volumeType: week.volumeType,
              })),
            },
          })),
        },
      },
    });

    return NextResponse.json(workoutSkeleton);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }

    console.error("[WORKOUT_SKELETONS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
