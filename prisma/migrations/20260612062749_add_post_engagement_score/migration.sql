-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "engagementScore" INTEGER NOT NULL DEFAULT 0;

-- Backfill from the persisted engagement inputs.
UPDATE "Post"
SET "engagementScore" = "viewCount" + "likeCount" * 3 + "replyCount" * 2;

-- CreateIndex
CREATE INDEX "Post_engagementScore_createdAt_id_idx" ON "Post"("engagementScore" DESC, "createdAt" DESC, "id" DESC);
