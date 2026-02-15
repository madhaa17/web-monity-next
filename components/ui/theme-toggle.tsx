"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Moon, Sun, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";

const themes: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function ThemeToggle({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className={cn(className)} disabled>
        <Sun className="size-5" />
      </Button>
    );
  }

  const current = (theme ?? "system") as Theme;
  const Icon = themes.find((t) => t.value === current)?.icon ?? Monitor;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(className)}
          aria-label="Toggle theme"
        >
          <Icon className="size-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-2" align="end">
        <div className="flex flex-col gap-0.5">
          {themes.map(({ value, label, icon: IconItem }) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setTheme(value);
              }}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
                current === value && "bg-accent text-accent-foreground"
              )}
            >
              <IconItem className="size-4 shrink-0" />
              {label}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
