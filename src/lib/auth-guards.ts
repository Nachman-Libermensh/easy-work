import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";

/**
 * Ensures user is authenticated, redirects to login if not
 */
export async function requireAuth() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  return session;
}

/**
 * Ensures user is NOT authenticated, redirects to home if authenticated
 */
export async function requireGuest() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/");
  }

  return null;
}

/**
 * Ensures user has admin role, redirects to dashboard if not
 */
export async function requireAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const userRoles = session.user.role?.split(",").map((r) => r.trim()) || [];
  const isAdmin = userRoles.includes("admin");

  if (!isAdmin) {
    redirect("/dashboard");
  }

  return session;
}

/**
 * Checks if user has a specific role
 */
export function hasRole(
  session: Awaited<ReturnType<typeof auth.api.getSession>>,
  role: string
): boolean {
  if (!session?.user.role) return false;
  const userRoles = session.user.role.split(",").map((r) => r.trim());
  return userRoles.includes(role);
}
