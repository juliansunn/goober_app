/*
  Warnings:

  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Discipline" AS ENUM ('RUN', 'BIKE', 'SWIM', 'TRIATHLON');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "PerformanceMetricType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PerformanceMetricType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPerformanceMetric" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "metricTypeId" INTEGER NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "dateAchieved" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPerformanceMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RaceType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "discipline" "Discipline" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RaceType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRacePR" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "raceTypeId" INTEGER NOT NULL,
    "time" DOUBLE PRECISION NOT NULL,
    "dateAchieved" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserRacePR_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PerformanceMetricType_name_key" ON "PerformanceMetricType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RaceType_name_key" ON "RaceType"("name");

-- AddForeignKey
ALTER TABLE "UserPerformanceMetric" ADD CONSTRAINT "UserPerformanceMetric_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPerformanceMetric" ADD CONSTRAINT "UserPerformanceMetric_metricTypeId_fkey" FOREIGN KEY ("metricTypeId") REFERENCES "PerformanceMetricType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRacePR" ADD CONSTRAINT "UserRacePR_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRacePR" ADD CONSTRAINT "UserRacePR_raceTypeId_fkey" FOREIGN KEY ("raceTypeId") REFERENCES "RaceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
