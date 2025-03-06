/*
  Warnings:

  - You are about to drop the column `volumeType` on the `Week` table. All the data in the column will be lost.
  - You are about to drop the column `volumeValue` on the `Week` table. All the data in the column will be lost.
  - Added the required column `volumeDistance` to the `Week` table without a default value. This is not possible if the table is not empty.
  - Added the required column `volumeDuration` to the `Week` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Week" DROP COLUMN "volumeType",
DROP COLUMN "volumeValue",
ADD COLUMN     "volumeDistance" JSONB NOT NULL,
ADD COLUMN     "volumeDuration" JSONB NOT NULL;
