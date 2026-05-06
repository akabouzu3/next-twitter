

// features/user/schemas/user.schema.ts

import { z } from "zod";

export const updateUserSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  bio: z.string().max(160).optional(),
});