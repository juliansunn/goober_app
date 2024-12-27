import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { getOrCreateUser } from "@/app/actions/user";

const workoutSkeletonUpdateSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  schedule: z
    .object({
      startDate: z.string(),
      endDate: z.string(),
      description: z.string(),
      phases: z.array(
        z.object({
          name: z.string(),
          description: z.string(),
          duration: z.string(),
          workouts: z.array(
            z.object({
              name: z.string(),
              description: z.string(),
              type: z.string(),
              duration: z.string().optional(),
              distance: z.string().optional(),
              intensity: z.string().optional(),
            })
          ),
        })
      ),
    })
    .optional(),
});

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

    const workoutSkeleton = await prisma.workoutSkeleton.findUnique({
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

    if (!workoutSkeleton) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return NextResponse.json(workoutSkeleton);
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

    const body = await req.json();
    const validatedData = workoutSkeletonUpdateSchema.parse(body);

    // Check if the workout skeleton exists and belongs to the user
    const existingSkeleton = await prisma.workoutSkeleton.findUnique({
      where: {
        id: parseInt(params.skeletonId),
        userId: user.id,
      },
    });

    if (!existingSkeleton) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const updatedWorkoutSkeleton = await prisma.workoutSkeleton.update({
      where: {
        id: parseInt(params.skeletonId),
      },
      data: {
        ...(validatedData.title && { title: validatedData.title }),
        ...(validatedData.description && {
          description: validatedData.description,
        }),
        ...(validatedData.schedule && { scheduleData: validatedData.schedule }),
      },
    });

    return NextResponse.json(updatedWorkoutSkeleton);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
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
    const existingSkeleton = await prisma.workoutSkeleton.findUnique({
      where: {
        id: parseInt(params.skeletonId),
        userId: user.id,
      },
    });

    if (!existingSkeleton) {
      return new NextResponse("Not Found", { status: 404 });
    }

    await prisma.workoutSkeleton.delete({
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
