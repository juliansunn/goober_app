/*
  Warnings:

  - You are about to drop the column `workoutId` on the `Interval` table. All the data in the column will be lost.
  - You are about to drop the column `workoutId` on the `RepeatGroup` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Workout` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Workout` table. All the data in the column will be lost.
  - You are about to drop the `_FavoritedWorkouts` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[workoutItemId]` on the table `Interval` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[workoutItemId]` on the table `RepeatGroup` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Interval" DROP CONSTRAINT "Interval_workoutId_fkey";

-- DropForeignKey
ALTER TABLE "RepeatGroup" DROP CONSTRAINT "RepeatGroup_workoutId_fkey";

-- DropForeignKey
ALTER TABLE "_FavoritedWorkouts" DROP CONSTRAINT "_FavoritedWorkouts_A_fkey";

-- DropForeignKey
ALTER TABLE "_FavoritedWorkouts" DROP CONSTRAINT "_FavoritedWorkouts_B_fkey";

-- AlterTable
ALTER TABLE "Interval" DROP COLUMN "workoutId",
ADD COLUMN     "workoutItemId" INTEGER;

-- AlterTable
ALTER TABLE "RepeatGroup" DROP COLUMN "workoutId",
ADD COLUMN     "workoutItemId" INTEGER;

-- AlterTable
ALTER TABLE "Workout" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "userId" INTEGER;

-- DropTable
DROP TABLE "_FavoritedWorkouts";

-- CreateTable
CREATE TABLE "WorkoutItem" (
    "id" SERIAL NOT NULL,
    "workoutId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "WorkoutItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Interval_workoutItemId_key" ON "Interval"("workoutItemId");

-- CreateIndex
CREATE UNIQUE INDEX "RepeatGroup_workoutItemId_key" ON "RepeatGroup"("workoutItemId");

-- AddForeignKey
ALTER TABLE "Workout" ADD CONSTRAINT "Workout_favoritedBy_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutItem" ADD CONSTRAINT "WorkoutItem_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interval" ADD CONSTRAINT "Interval_workoutItemId_fkey" FOREIGN KEY ("workoutItemId") REFERENCES "WorkoutItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepeatGroup" ADD CONSTRAINT "RepeatGroup_workoutItemId_fkey" FOREIGN KEY ("workoutItemId") REFERENCES "WorkoutItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
