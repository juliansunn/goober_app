/*
  Warnings:

  - You are about to drop the column `durationType` on the `Interval` table. All the data in the column will be lost.
  - You are about to drop the column `durationUnit` on the `Interval` table. All the data in the column will be lost.
  - You are about to drop the column `durationValue` on the `Interval` table. All the data in the column will be lost.
  - You are about to drop the column `intensityMax` on the `Interval` table. All the data in the column will be lost.
  - You are about to drop the column `intensityMin` on the `Interval` table. All the data in the column will be lost.
  - You are about to drop the column `intensityType` on the `Interval` table. All the data in the column will be lost.
  - Added the required column `durationId` to the `Interval` table without a default value. This is not possible if the table is not empty.
  - Added the required column `intensityTargetId` to the `Interval` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Interval" DROP COLUMN "durationType",
DROP COLUMN "durationUnit",
DROP COLUMN "durationValue",
DROP COLUMN "intensityMax",
DROP COLUMN "intensityMin",
DROP COLUMN "intensityType",
ADD COLUMN     "durationId" INTEGER NOT NULL,
ADD COLUMN     "intensityTargetId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Duration" (
    "id" SERIAL NOT NULL,
    "type" "DurationType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,

    CONSTRAINT "Duration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntensityTarget" (
    "id" SERIAL NOT NULL,
    "type" "IntensityType" NOT NULL,
    "min" TEXT,
    "max" TEXT,

    CONSTRAINT "IntensityTarget_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Interval" ADD CONSTRAINT "Interval_durationId_fkey" FOREIGN KEY ("durationId") REFERENCES "Duration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interval" ADD CONSTRAINT "Interval_intensityTargetId_fkey" FOREIGN KEY ("intensityTargetId") REFERENCES "IntensityTarget"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
