/*
  Warnings:

  - You are about to drop the column `workoutSkeletonId` on the `Phase` table. All the data in the column will be lost.
  - You are about to drop the `WorkoutSkeleton` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `workoutScheduleId` to the `Phase` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Phase" DROP CONSTRAINT "Phase_workoutSkeletonId_fkey";

-- DropForeignKey
ALTER TABLE "WorkoutSkeleton" DROP CONSTRAINT "WorkoutSkeleton_userId_fkey";

-- AlterTable
ALTER TABLE "Phase" DROP COLUMN "workoutSkeletonId",
ADD COLUMN     "workoutScheduleId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "WorkoutSkeleton";

-- CreateTable
CREATE TABLE "WorkoutSchedule" (
    "id" SERIAL NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "raceDate" TIMESTAMP(3) NOT NULL,
    "raceName" TEXT NOT NULL,
    "raceType" "WorkoutType" NOT NULL,
    "raceDistance" TEXT,
    "customDistance" TEXT,
    "customDistanceUnit" TEXT,
    "restDay" TEXT,
    "experienceLevel" TEXT,
    "goalTimeHours" TEXT,
    "goalTimeMinutes" TEXT,
    "goalTimeSeconds" TEXT,
    "additionalNotes" TEXT,
    "scheduleTitle" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutSchedule_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WorkoutSchedule" ADD CONSTRAINT "WorkoutSchedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase" ADD CONSTRAINT "Phase_workoutScheduleId_fkey" FOREIGN KEY ("workoutScheduleId") REFERENCES "WorkoutSchedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
