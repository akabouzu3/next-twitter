/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `PostImage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PostImage" DROP COLUMN "imageUrl",
ALTER COLUMN "url" DROP DEFAULT;
