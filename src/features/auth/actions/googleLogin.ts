"use server";
import { signIn } from "@/lib/auth/auth";

export async function googleLoginAction() {
  await await signIn("google");
}
