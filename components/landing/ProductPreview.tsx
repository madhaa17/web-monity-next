import { ArrowDownRight, ArrowUpRight, Target } from "lucide-react";
import { cn } from "@/lib/utils";

// Illustrative numbers only; the preview is a static picture of the dashboard, not live data.
const TREND = [
  { month: "May", income: 72, expense: 58 },
  { month: "Jun", income: 70, expense: 63 },
  { month: "Jul", income: 84, expense: 55 },
  { month: "Aug", income: 76, expense: 60 },
  { month: "Sep", income: 88, expense: 52 },
  { month: "Oct", income: 92, expense: 57 },
];

const CATEGORIES = [
  { name: "Food", share: 34, color: "#F97316" },
  { name: "Housing", share: 26, color: "#6366F1" },
  { name: "Transport", share: 16, color: "#0EA5E9" },
  { name: "Shopping", share: 14, color: "#EC4899" },
  { name: "Other", share: 10, color: "#64748B" },
];

const TRANSACTIONS = [
  { note: "Salary October", meta: "Salary · Bank", amount: "+Rp 12.500.000", income: true },
  { note: "Lunch with team", meta: "Food · Wallet", amount: "−Rp 85.000", income: false },
  { note: "Electricity token", meta: "Utilities · Bank", amount: "−Rp 250.000", income: false },
];

function Stat({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="min-w-0">
      <p className="text-muted-foreground truncate text-[11px]">{label}</p>
      <p className={cn("truncate text-sm font-semibold tabular-nums", className)}>{value}</p>
    </div>
  );
}

/** A static, illustrative mock of the dashboard for the landing page hero. */
export function ProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-xl sm:mb-16">
      <div
        className="bg-primary/25 absolute -inset-6 -z-10 rounded-[2rem] blur-3xl dark:bg-primary/30"
        aria-hidden
      />
      <figure
        className="bg-card text-card-foreground overflow-hidden rounded-2xl border shadow-2xl shadow-primary/10"
        aria-label="Preview of the MoneyTor dashboard with example data"
      >
        <div className="bg-muted/60 flex items-center gap-1.5 border-b px-4 py-2.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-red-400" />
          <span className="size-2.5 rounded-full bg-yellow-400" />
          <span className="size-2.5 rounded-full bg-green-400" />
          <span className="text-muted-foreground ml-3 truncate text-[11px]">moneytor · Overview</span>
        </div>

        <div className="grid gap-4 p-4 sm:p-5">
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-muted-foreground text-xs">Net worth</p>
              <p className="truncate text-2xl font-bold tracking-tight tabular-nums sm:text-3xl">Rp 248.750.000</p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
              <ArrowUpRight className="size-3" />
              8.4% this year
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-xl border p-3">
            <Stat label="Income · Oct" value="Rp 12,5 jt" className="text-green-600 dark:text-green-500" />
            <Stat label="Expenses · Oct" value="Rp 7,8 jt" className="text-red-600 dark:text-red-500" />
            <Stat label="Saving rate" value="37%" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border p-3">
              <p className="text-muted-foreground mb-3 text-xs">Cashflow, last 6 months</p>
              <div className="flex h-24 items-end gap-2" aria-hidden>
                {TREND.map((m) => (
                  <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                    <div className="flex h-20 w-full items-end justify-center gap-0.5">
                      <div className="w-1/2 max-w-2 rounded-t-sm bg-green-500/80" style={{ height: `${m.income}%` }} />
                      <div className="w-1/2 max-w-2 rounded-t-sm bg-red-500/70" style={{ height: `${m.expense}%` }} />
                    </div>
                    <span className="text-muted-foreground text-[10px]">{m.month}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border p-3">
              <p className="text-muted-foreground mb-3 text-xs">Spending by category</p>
              <div className="flex h-2 w-full overflow-hidden rounded-full" aria-hidden>
                {CATEGORIES.map((c) => (
                  <div key={c.name} style={{ width: `${c.share}%`, backgroundColor: c.color }} />
                ))}
              </div>
              <ul className="mt-3 grid gap-1.5">
                {CATEGORIES.slice(0, 4).map((c) => (
                  <li key={c.name} className="flex items-center gap-2 text-xs">
                    <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="flex-1 truncate">{c.name}</span>
                    <span className="text-muted-foreground tabular-nums">{c.share}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <ul className="divide-y rounded-xl border">
            {TRANSACTIONS.map((t) => (
              <li key={t.note} className="flex items-center gap-3 px-3 py-2">
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full",
                    t.income ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
                  )}
                  aria-hidden
                >
                  {t.income ? <ArrowDownRight className="size-3.5" /> : <ArrowUpRight className="size-3.5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{t.note}</p>
                  <p className="text-muted-foreground truncate text-[11px]">{t.meta}</p>
                </div>
                <span
                  className={cn(
                    "shrink-0 text-xs font-medium tabular-nums",
                    t.income ? "text-green-600 dark:text-green-500" : "text-foreground"
                  )}
                >
                  {t.amount}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </figure>

      <div
        className="bg-card absolute -bottom-16 left-6 hidden w-52 rounded-xl border p-3 shadow-xl sm:block lg:-left-8"
        aria-hidden
      >
        <div className="flex items-center gap-2 text-xs font-medium">
          <Target className="text-primary size-3.5 dark:text-blue-400" />
          Emergency fund
        </div>
        <div className="bg-muted mt-2 h-1.5 overflow-hidden rounded-full">
          <div className="bg-primary h-full w-[68%] rounded-full" />
        </div>
        <p className="text-muted-foreground mt-1.5 text-[11px] tabular-nums">Rp 20,4 jt of Rp 30 jt · 68%</p>
      </div>
    </div>
  );
}
