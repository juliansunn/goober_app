-- AlterTable
ALTER TABLE "Week" ALTER COLUMN "volumeDistance" DROP NOT NULL,
ALTER COLUMN "volumeDistance" SET DEFAULT '{"value": 0, "unit": "miles"}',
ALTER COLUMN "volumeDuration" DROP NOT NULL,
ALTER COLUMN "volumeDuration" SET DEFAULT '{"minutes": 0}';
