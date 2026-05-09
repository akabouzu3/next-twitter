-- DropIndex
DROP INDEX "Follow_followerId_idx";

-- DropIndex
DROP INDEX "Follow_followingId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "Follow_createdAt_id_key" ON "Follow"("createdAt", "id");

-- CreateIndex
CREATE INDEX "Follow_followerId_createdAt_id_idx" ON "Follow"("followerId", "createdAt" DESC, "id" DESC);

-- CreateIndex
CREATE INDEX "Follow_followingId_createdAt_id_idx" ON "Follow"("followingId", "createdAt" DESC, "id" DESC);
