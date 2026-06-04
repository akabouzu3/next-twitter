-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "parentPostId" TEXT;

-- CreateIndex
CREATE INDEX "Post_parentPostId_createdAt_id_idx" ON "Post"("parentPostId", "createdAt" DESC, "id" DESC);

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_parentPostId_fkey" FOREIGN KEY ("parentPostId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
