import type { User } from "@/lib/api/types";

export function getInitials(user: User | undefined): string {
  if (!user) return "?";
  if (user.name?.trim()) {
    const parts = user.name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return user.name.slice(0, 2).toUpperCase();
  }
  if (user.email?.trim()) {
    return user.email[0].toUpperCase();
  }
  return "?";
}
