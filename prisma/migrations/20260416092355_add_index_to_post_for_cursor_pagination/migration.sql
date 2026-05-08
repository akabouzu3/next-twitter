/*
  Warnings:

  - A unique constraint covering the columns `[createdAt,id]` on the table `Post` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Post_userId_createdAt_idx";

-- CreateIndex
CREATE INDEX "Post_userId_createdAt_id_idx" ON "Post"("userId", "createdAt" DESC, "id" DESC);

-- CreateIndex
CREATE INDEX "Post_createdAt_id_idx" ON "Post"("createdAt" DESC, "id" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Post_createdAt_id_key" ON "Post"("createdAt", "id");
