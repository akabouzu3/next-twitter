-- Backfill Post.likeCount from existing likes.
UPDATE "Post" p
SET "likeCount" = counts."likeCount"
FROM (
  SELECT "postId", COUNT(*)::integer AS "likeCount"
  FROM "PostLike"
  GROUP BY "postId"
) counts
WHERE p.id = counts."postId";

-- Backfill Post.replyCount from existing direct replies.
UPDATE "Post" p
SET "replyCount" = counts."replyCount"
FROM (
  SELECT "parentPostId", COUNT(*)::integer AS "replyCount"
  FROM "Post"
  WHERE "parentPostId" IS NOT NULL
  GROUP BY "parentPostId"
) counts
WHERE p.id = counts."parentPostId";
