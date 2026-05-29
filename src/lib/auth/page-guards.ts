import "server-only";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getCurrentSessionUser } from "@/lib/auth/session";
import { AuthError, PermissionError } from "@/lib/auth/errors";
import { requireAdminUser, requireSessionUser } from "@/lib/auth/guards";

export async function requireAuth() {
  try {
    return await requireSessionUser();
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/login");
    }

    throw error;
  }
}

export async function requirePageCurrentUser() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  return currentUser;
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

    throw error;
  }
}
