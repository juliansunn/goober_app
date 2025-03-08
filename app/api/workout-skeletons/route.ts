import { getOrCreateUser } from "@/app/actions/user";
import prisma from "@/lib/prisma";
import { WorkoutScheduleFormDataSchema } from "@/schemas/skeleton";
import { WorkoutScheduleFormData } from "@/types/workout";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";

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

    const workoutSchedules = await prisma.workoutSchedule.findMany({
      where: {
        userId: user.id,
      },
      include: {
        phases: {
          include: {
            weeks: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(workoutSchedules);
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

    const body: WorkoutScheduleFormData = await req.json();
    const validatedData = WorkoutScheduleFormDataSchema.parse(body);
    const schedule = validatedData.schedule;

    const workoutSchedule = await prisma.workoutSchedule.create({
      data: {
        userId: user.id,
        scheduleTitle: validatedData.scheduleTitle,
        startDate: new Date(validatedData.startDate),
        raceDate: new Date(validatedData.raceDate),
        raceName: validatedData.raceName,
        raceType: validatedData.raceType,
        raceDistance: validatedData.raceDistance,
        customDistance: validatedData.customDistance,
        customDistanceUnit: validatedData.customDistanceUnit,
        restDay: validatedData.restDay,
        experienceLevel: validatedData.experienceLevel,
        goalTimeHours: validatedData.goalTimeHours,
        goalTimeMinutes: validatedData.goalTimeMinutes,
        goalTimeSeconds: validatedData.goalTimeSeconds,
        additionalNotes: validatedData.additionalNotes,

        description: schedule.description,
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
                volumeDistance: week.volumeDistance,
                volumeDuration: week.volumeDuration,
              })),
            },
          })),
        },
      },
    });

    return NextResponse.json(workoutSchedule);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data: " + error.message, {
        status: 400,
      });
    }

    console.error("[WORKOUT_SKELETONS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
