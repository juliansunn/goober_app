import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateUser } from "@/app/actions/user";
import { DataTable } from "@/app/(dashboard)/schedules/data-table";
import { columns } from "@/app/(dashboard)/schedules/columns";

async function getWorkoutSchedules(userId: number) {
  const skeletons = await prisma.workoutSkeleton.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return skeletons.map((skeleton) => ({
    id: String(skeleton.id),
    scheduleTitle: skeleton.title,
    raceName: skeleton.description,
    raceType: skeleton.type,
    // TODO: Add race distance
    raceDistance: "Marathon",
    raceDate: skeleton.endDate,
    createdAt: skeleton.createdAt,
  }));
}

export default async function SchedulesPage() {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }
  const user = await getOrCreateUser(userId, {});

  const schedules = await getWorkoutSchedules(user.id);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">My Training Schedules</h1>
      <DataTable columns={columns} data={schedules} />
    </div>
  );
}
