/*
  Warnings:

  - Changed the type of `durationUnit` on the `Interval` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "DurationUnit" AS ENUM ('SECONDS', 'MINUTES', 'HOURS', 'METERS', 'KILOMETERS', 'MILES', 'BPM', 'CALORIES');

-- CreateEnum
CREATE TYPE "PhaseObjective" AS ENUM ('BASE', 'BUILD', 'PEAK', 'TAPER');

-- CreateEnum
CREATE TYPE "WeekFocus" AS ENUM ('ENDURANCE', 'THRESHOLD', 'SPEED', 'RECOVERY');

-- AlterTable
ALTER TABLE "Interval" DROP COLUMN "durationUnit",
ADD COLUMN     "durationUnit" "DurationUnit" NOT NULL;

-- CreateTable
CREATE TABLE "WorkoutSkeleton" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "WorkoutType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutSkeleton_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "objective" "PhaseObjective" NOT NULL,
    "workoutSkeletonId" INTEGER NOT NULL,

    CONSTRAINT "Phase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Week" (
    "id" SERIAL NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "focus" "WeekFocus" NOT NULL,
    "description" TEXT NOT NULL,
    "volumeValue" DOUBLE PRECISION NOT NULL,
    "volumeType" "DurationType" NOT NULL,
    "phaseId" INTEGER,

    CONSTRAINT "Week_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WorkoutSkeleton" ADD CONSTRAINT "WorkoutSkeleton_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase" ADD CONSTRAINT "Phase_workoutSkeletonId_fkey" FOREIGN KEY ("workoutSkeletonId") REFERENCES "WorkoutSkeleton"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Week" ADD CONSTRAINT "Week_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "Phase"("id") ON DELETE SET NULL ON UPDATE CASCADE;
