-- DropForeignKey
ALTER TABLE "Interval" DROP CONSTRAINT "Interval_repeatGroupId_fkey";

-- DropForeignKey
ALTER TABLE "Interval" DROP CONSTRAINT "Interval_workoutItemId_fkey";

-- DropForeignKey
ALTER TABLE "RepeatGroup" DROP CONSTRAINT "RepeatGroup_workoutItemId_fkey";

-- DropForeignKey
ALTER TABLE "WorkoutItem" DROP CONSTRAINT "WorkoutItem_workoutId_fkey";

-- AddForeignKey
ALTER TABLE "WorkoutItem" ADD CONSTRAINT "WorkoutItem_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interval" ADD CONSTRAINT "Interval_workoutItemId_fkey" FOREIGN KEY ("workoutItemId") REFERENCES "WorkoutItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interval" ADD CONSTRAINT "Interval_repeatGroupId_fkey" FOREIGN KEY ("repeatGroupId") REFERENCES "RepeatGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepeatGroup" ADD CONSTRAINT "RepeatGroup_workoutItemId_fkey" FOREIGN KEY ("workoutItemId") REFERENCES "WorkoutItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
