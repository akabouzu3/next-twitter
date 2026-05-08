/*
  Warnings:

  - A unique constraint covering the columns `[createdAt,id]` on the table `PostLike` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "PostLike_userId_idx";

-- CreateIndex
CREATE INDEX "PostLike_userId_createdAt_id_idx" ON "PostLike"("userId", "createdAt" DESC, "id" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "PostLike_createdAt_id_key" ON "PostLike"("createdAt", "id");
