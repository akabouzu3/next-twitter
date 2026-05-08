

// features/user/schemas/user.schema.ts

import { z } from "zod";

export const updateUserSchema = z.object({
  userId: z.string().min(1, "編集対象のユーザーを取得できませんでした。"),
  name: z.string().trim().min(1, "名前を入力してください。").max(50),
  bio: z.string().trim().max(160),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
