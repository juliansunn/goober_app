import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { getOrCreateUser } from "@/app/actions/user";
import { WorkoutScheduleFormDataSchema } from "@/schemas/skeleton";
import { WorkoutScheduleFormData } from "@/types/workout";

export async function GET(
  req: Request,
  { params }: { params: { skeletonId: string } }
) {
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

    if (!params.skeletonId) {
      return new NextResponse("Skeleton ID is required", { status: 400 });
    }

    const workoutSchedule = await prisma.workoutSchedule.findUnique({
      where: {
        id: parseInt(params.skeletonId),
        userId: user.id,
      },
      include: {
        phases: {
          include: {
            weeks: true,
          },
        },
      },
    });

    if (!workoutSchedule) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Transform the data to include schedule field with phases
    const { description, phases, ...workoutScheduleWithoutDescAndPhases } =
      workoutSchedule;
    const transformedWorkoutSchedule = {
      ...workoutScheduleWithoutDescAndPhases,
      schedule: {
        description,
        phases,
        startDate: workoutSchedule?.startDate,
        endDate: workoutSchedule?.raceDate,
      },
    };

    return NextResponse.json(transformedWorkoutSchedule);
  } catch (error) {
    console.error("[WORKOUT_SKELETON_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { skeletonId: string } }
) {
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

    if (!params.skeletonId) {
      return new NextResponse("Skeleton ID is required", { status: 400 });
    }

    const body: WorkoutScheduleFormData = await req.json();
    console.log("body", body);
    const validatedData = WorkoutScheduleFormDataSchema.parse(body);
    const schedule = validatedData.schedule;

    // Check if the workout skeleton exists and belongs to the user
    const existingSkeleton = await prisma.workoutSchedule.findUnique({
      where: {
        id: parseInt(params.skeletonId),
        userId: user.id,
      },
      include: {
        phases: {
          include: {
            weeks: true,
          },
        },
      },
    });

    if (!existingSkeleton) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Delete existing phases and weeks that are not in the updated data
    const updatedPhaseIds = schedule.phases
      .map((phase) => phase.id)
      .filter(Boolean) as number[];

    // Delete phases not included in the update
    await prisma.phase.deleteMany({
      where: {
        workoutScheduleId: parseInt(params.skeletonId),
        id: {
          notIn: updatedPhaseIds,
        },
      },
    });

    const updatedWorkoutSchedule = await prisma.workoutSchedule.update({
      where: {
        id: parseInt(params.skeletonId),
      },
      data: {
        ...(validatedData.scheduleTitle && {
          scheduleTitle: validatedData.scheduleTitle,
        }),
        ...(validatedData.startDate && {
          startDate: new Date(validatedData.startDate),
        }),
        ...(validatedData.raceDate && {
          raceDate: new Date(validatedData.raceDate),
        }),
        ...(validatedData.raceName && { raceName: validatedData.raceName }),
        ...(validatedData.raceType && { raceType: validatedData.raceType }),
        ...(validatedData.raceDistance && {
          raceDistance: validatedData.raceDistance,
        }),
        ...(validatedData.customDistance && {
          customDistance: validatedData.customDistance,
        }),
        ...(validatedData.customDistanceUnit && {
          customDistanceUnit: validatedData.customDistanceUnit,
        }),
        ...(validatedData.restDay && { restDay: validatedData.restDay }),
        ...(validatedData.experienceLevel && {
          experienceLevel: validatedData.experienceLevel,
        }),
        ...(validatedData.goalTimeHours && {
          goalTimeHours: validatedData.goalTimeHours,
        }),
        ...(validatedData.goalTimeMinutes && {
          goalTimeMinutes: validatedData.goalTimeMinutes,
        }),
        ...(validatedData.goalTimeSeconds && {
          goalTimeSeconds: validatedData.goalTimeSeconds,
        }),
        ...(validatedData.additionalNotes && {
          additionalNotes: validatedData.additionalNotes,
        }),
        description: schedule.description,
        phases: {
          upsert: schedule.phases.map((phase) => ({
            where: {
              id: phase?.id || -1, // Use -1 for new phases
            },
            create: {
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
            },
            update: {
              name: phase.name,
              startDate: new Date(phase.startDate),
              endDate: new Date(phase.endDate),
              objective: phase.objective,
              weeks: {
                upsert: phase.weeks.map((week) => ({
                  where: {
                    id: week.id || -1,
                  },
                  create: {
                    weekNumber: week.weekNumber,
                    startDate: new Date(week.startDate),
                    endDate: new Date(week.endDate),
                    focus: week.focus,
                    description: week.description,
                    volumeValue: week.volumeValue,
                    volumeType: week.volumeType,
                  },
                  update: {
                    weekNumber: week.weekNumber,
                    startDate: new Date(week.startDate),
                    endDate: new Date(week.endDate),
                    focus: week.focus,
                    description: week.description,
                    volumeValue: week.volumeValue,
                    volumeType: week.volumeType,
                  },
                })),
              },
            },
          })),
        },
      },
      include: {
        phases: {
          include: {
            weeks: true,
          },
        },
      },
    });

    return NextResponse.json(updatedWorkoutSchedule);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(`Invalid request data: ${error.message}`, {
        status: 400,
      });
    }

    console.error("[WORKOUT_SKELETON_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { skeletonId: string } }
) {
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

    if (!params.skeletonId) {
      return new NextResponse("Skeleton ID is required", { status: 400 });
    }

    // Check if the workout skeleton exists and belongs to the user
    const existingSkeleton = await prisma.workoutSchedule.findUnique({
      where: {
        id: parseInt(params.skeletonId),
        userId: user.id,
      },
    });

    if (!existingSkeleton) {
      return new NextResponse("Not Found", { status: 404 });
    }

    await prisma.workoutSchedule.delete({
      where: {
        id: parseInt(params.skeletonId),
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[WORKOUT_SKELETON_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
