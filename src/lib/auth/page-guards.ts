import "server-only";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { AuthError, PermissionError } from "@/lib/auth/errors";
import { requireAdminUser } from "@/lib/auth/guards";

export async function requireAuth() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  return currentUser;
}

export async function requireGuest() {
  const currentUser = await getCurrentUser();

  if (currentUser) {
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

    throw error;
  }
}
