import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * MoneyTor mark: an "M" whose right leg rises into a trend line ending in a coin.
 * Gradient ids are per instance so a hidden copy (e.g. a closed sidebar) never breaks another.
 */
export function LogoMark({ className }: { className?: string }) {
  const id = useId();
  const bg = `${id}-bg`;
  const shine = `${id}-shine`;
  const coin = `${id}-coin`;

  return (
    <svg viewBox="0 0 64 64" aria-hidden className={cn("size-7 shrink-0", className)}>
      <defs>
        <linearGradient id={bg} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3b82f6" />
          <stop offset="0.55" stopColor="#1d4ed8" />
          <stop offset="1" stopColor="#4c1d95" />
        </linearGradient>
        <radialGradient id={shine} cx="18" cy="10" r="40" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={coin} x1="47" y1="12" x2="56" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fde68a" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill={`url(#${bg})`} />
      <rect width="64" height="64" rx="16" fill={`url(#${shine})`} />
      <path
        d="M13 46V27l10.5 11L34 27v19"
        fill="none"
        stroke="#fff"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M34 27l7-7.5 4 4 6.5-7"
        fill="none"
        stroke="#fde68a"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="51.5" cy="16.5" r="4.5" fill={`url(#${coin})`} />
    </svg>
  );
}

/** Mark plus the "MoneyTor" wordmark. */
export function Logo({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-bold tracking-tight", className)}>
      <LogoMark className={markClassName} />
      <span>
        Money<span className="text-primary dark:text-blue-400">Tor</span>
      </span>
    </span>
  );
}
