-- DropIndex
DROP INDEX "PostImage_postId_idx";

-- AlterTable
ALTER TABLE "PostImage" ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "PostImage_postId_sortOrder_idx" ON "PostImage"("postId", "sortOrder");
