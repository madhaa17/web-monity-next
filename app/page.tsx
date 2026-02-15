"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-50 p-6 dark:bg-zinc-950">
      <h1 className="text-3xl font-semibold">Monity</h1>
      <p className="max-w-md text-center text-zinc-600 dark:text-zinc-400">
        Track your finances, assets, and goals in one place.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/login">Log in</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/register">Register</Link>
        </Button>
      </div>
    </div>
  );
}
