-- CreateEnum
CREATE TYPE "WorkoutType" AS ENUM ('RUN', 'BIKE', 'SWIM');

-- CreateEnum
CREATE TYPE "IntervalType" AS ENUM ('WARMUP', 'COOLDOWN', 'ACTIVE', 'REST');

-- CreateEnum
CREATE TYPE "DurationType" AS ENUM ('TIME', 'DISTANCE', 'HEART_RATE', 'CALORIES');

-- CreateEnum
CREATE TYPE "IntensityType" AS ENUM ('NONE', 'CADENCE', 'HEART_RATE', 'POWER', 'PACE_MILE', 'PACE_KM', 'PACE_400M');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "clerkId" TEXT NOT NULL,
    "username" TEXT,
    "name" TEXT,
    "email" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workout" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "WorkoutType" NOT NULL,
    "authorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interval" (
    "id" SERIAL NOT NULL,
    "type" "IntervalType" NOT NULL,
    "durationType" "DurationType" NOT NULL,
    "durationValue" DOUBLE PRECISION NOT NULL,
    "durationUnit" TEXT NOT NULL,
    "intensityType" "IntensityType" NOT NULL,
    "intensityMin" TEXT,
    "intensityMax" TEXT,
    "workoutId" INTEGER,
    "repeatGroupId" INTEGER,

    CONSTRAINT "Interval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepeatGroup" (
    "id" SERIAL NOT NULL,
    "repeats" INTEGER NOT NULL,
    "workoutId" INTEGER NOT NULL,

    CONSTRAINT "RepeatGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_FavoritedWorkouts" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_FavoritedWorkouts_AB_unique" ON "_FavoritedWorkouts"("A", "B");

-- CreateIndex
CREATE INDEX "_FavoritedWorkouts_B_index" ON "_FavoritedWorkouts"("B");

-- AddForeignKey
ALTER TABLE "Workout" ADD CONSTRAINT "Workout_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interval" ADD CONSTRAINT "Interval_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interval" ADD CONSTRAINT "Interval_repeatGroupId_fkey" FOREIGN KEY ("repeatGroupId") REFERENCES "RepeatGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepeatGroup" ADD CONSTRAINT "RepeatGroup_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FavoritedWorkouts" ADD CONSTRAINT "_FavoritedWorkouts_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FavoritedWorkouts" ADD CONSTRAINT "_FavoritedWorkouts_B_fkey" FOREIGN KEY ("B") REFERENCES "Workout"("id") ON DELETE CASCADE ON UPDATE CASCADE;
