/*
  Warnings:

  - You are about to drop the column `duration` on the `WorkoutItem` table. All the data in the column will be lost.
  - You are about to drop the column `intensityTarget` on the `WorkoutItem` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `WorkoutItem` table. All the data in the column will be lost.
  - Made the column `workoutItemId` on table `Interval` required. This step will fail if there are existing NULL values in that column.
  - Made the column `workoutItemId` on table `RepeatGroup` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Interval" DROP CONSTRAINT "Interval_workoutItemId_fkey";

-- DropForeignKey
ALTER TABLE "RepeatGroup" DROP CONSTRAINT "RepeatGroup_workoutItemId_fkey";

-- AlterTable
ALTER TABLE "Interval" ALTER COLUMN "workoutItemId" SET NOT NULL;

-- AlterTable
ALTER TABLE "RepeatGroup" ALTER COLUMN "workoutItemId" SET NOT NULL;

-- AlterTable
ALTER TABLE "WorkoutItem" DROP COLUMN "duration",
DROP COLUMN "intensityTarget",
DROP COLUMN "type";

-- RenameForeignKey
ALTER TABLE "Workout" RENAME CONSTRAINT "Workout_favoritedBy_fkey" TO "Workout_userId_fkey";

-- AddForeignKey
ALTER TABLE "Interval" ADD CONSTRAINT "Interval_workoutItemId_fkey" FOREIGN KEY ("workoutItemId") REFERENCES "WorkoutItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepeatGroup" ADD CONSTRAINT "RepeatGroup_workoutItemId_fkey" FOREIGN KEY ("workoutItemId") REFERENCES "WorkoutItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
