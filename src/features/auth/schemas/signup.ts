import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});