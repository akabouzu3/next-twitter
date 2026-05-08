import "server-only";

import { redirect } from "next/navigation";
import { getCurrentSessionUser } from "@/lib/auth/session";
import { AuthError, PermissionError } from "@/lib/auth/errors";
import { requireAdminUser, requireSessionUser } from "@/lib/auth/guards";

export async function requireAuth() {
  try {
    return await requireSessionUser();
  } catch {
    redirect("/login");
  }
}

export async function requireGuest() {
  const sessionUser = await getCurrentSessionUser();

  if (sessionUser) {
    redirect("/app");
  }
}

export async function requireAdmin() {
  try {
    return await requireAdminUser();
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/login");
    }

    if (error instanceof PermissionError) {
      redirect("/403");
    }

    redirect("/login");
  }
}