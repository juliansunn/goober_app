-- DropForeignKey
ALTER TABLE "Interval" DROP CONSTRAINT "Interval_workoutItemId_fkey";

-- AlterTable
ALTER TABLE "Interval" ALTER COLUMN "workoutItemId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Interval" ADD CONSTRAINT "Interval_workoutItemId_fkey" FOREIGN KEY ("workoutItemId") REFERENCES "WorkoutItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
