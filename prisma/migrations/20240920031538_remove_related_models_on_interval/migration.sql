/*
  Warnings:

  - You are about to drop the column `durationId` on the `Interval` table. All the data in the column will be lost.
  - You are about to drop the column `intensityTargetId` on the `Interval` table. All the data in the column will be lost.
  - You are about to drop the `Duration` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IntensityTarget` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `durationType` to the `Interval` table without a default value. This is not possible if the table is not empty.
  - Added the required column `durationUnit` to the `Interval` table without a default value. This is not possible if the table is not empty.
  - Added the required column `durationValue` to the `Interval` table without a default value. This is not possible if the table is not empty.
  - Added the required column `intensityType` to the `Interval` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration` to the `WorkoutItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `intensityTarget` to the `WorkoutItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `WorkoutItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Interval" DROP CONSTRAINT "Interval_durationId_fkey";

-- DropForeignKey
ALTER TABLE "Interval" DROP CONSTRAINT "Interval_intensityTargetId_fkey";

-- AlterTable
ALTER TABLE "Interval" DROP COLUMN "durationId",
DROP COLUMN "intensityTargetId",
ADD COLUMN     "durationType" "DurationType" NOT NULL,
ADD COLUMN     "durationUnit" TEXT NOT NULL,
ADD COLUMN     "durationValue" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "intensityMax" TEXT,
ADD COLUMN     "intensityMin" TEXT,
ADD COLUMN     "intensityType" "IntensityType" NOT NULL;

-- AlterTable
ALTER TABLE "WorkoutItem" ADD COLUMN     "duration" JSONB NOT NULL,
ADD COLUMN     "intensityTarget" JSONB NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;

-- DropTable
DROP TABLE "Duration";

-- DropTable
DROP TABLE "IntensityTarget";
