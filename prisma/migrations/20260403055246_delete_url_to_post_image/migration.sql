/*
  Warnings:

  - You are about to drop the column `url` on the `PostImage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PostImage" DROP COLUMN "url",
ALTER COLUMN "imageUrl" DROP DEFAULT;
