import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  Coins,
  HandCoins,
  LineChart,
  Moon,
  Receipt,
  Scale,
  ShieldCheck,
  Smartphone,
  Tags,
  Target,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ProductPreview } from "@/components/landing/ProductPreview";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "MoneyTor — Personal finance tracker",
  description:
    "Track income, expenses, cash accounts, investments, debts and saving goals in one place. Know where every rupiah goes.",
};

const NAV = [
  { href: "#benefits", label: "Why MoneyTor" },
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#faq", label: "FAQ" },
];

const BENEFITS = [
  {
    icon: Receipt,
    title: "Know where every rupiah goes",
    description:
      "Every income and expense has a category. Monthly totals and a per-category breakdown show at a glance what eats your budget.",
  },
  {
    icon: Scale,
    title: "Balances that always add up",
    description:
      "Each transaction moves money in or out of a cash account automatically. You can't spend more than an account holds, so balances never drift.",
  },
  {
    icon: Wallet,
    title: "Your whole net worth, not just spending",
    description:
      "Cash, crypto, stocks, property, what you owe and what you're owed — in one view, so you see where you really stand.",
  },
];

const FEATURES: {
  icon: typeof Wallet;
  title: string;
  description: string;
  points?: string[];
  className?: string;
}[] = [
  {
    icon: Receipt,
    title: "Income & expenses",
    description: "Log a transaction in seconds and find it again just as fast.",
    points: [
      "Your own categories, each with a color",
      "Filter by period, category or account, and search notes",
      "Totals, averages and a category breakdown that follow your filters",
    ],
    className: "md:col-span-2",
  },
  {
    icon: Wallet,
    title: "Cash accounts",
    description:
      "Wallets, bank accounts and e-wallets. Balances update with every income and expense you record.",
  },
  {
    icon: LineChart,
    title: "Investments",
    description:
      "Crypto and stocks — including IDX — with prices from CoinGecko and Yahoo Finance, price charts and gain or loss per asset.",
  },
  {
    icon: HandCoins,
    title: "Debts & receivables",
    description:
      "Track who owes whom, record installment payments and see what's overdue before it becomes a problem.",
  },
  {
    icon: Target,
    title: "Saving goals",
    description: "Set a target and a deadline, then watch the progress bar fill up.",
  },
  {
    icon: BarChart3,
    title: "Insights",
    description:
      "Monthly cashflow, saving rate, a 12-month income vs. expense trend and spending by category.",
    points: [
      "Spot months where spending ran ahead of income",
      "See which categories grow over time",
    ],
    className: "md:col-span-2",
  },
  {
    icon: Tags,
    title: "Other assets",
    description: "Property, livestock or anything else you own counts toward your net worth too.",
  },
];

const EXTRAS = [
  { icon: Smartphone, label: "Works on phone and desktop — install it to your home screen" },
  { icon: Moon, label: "Light and dark mode" },
  { icon: ShieldCheck, label: "Hide amounts with one tap when someone's looking" },
];

const STEPS = [
  {
    title: "Create your account",
    description:
      "Sign up with your email. Common categories like Food, Transport and Salary are ready to use, and you can change them anytime.",
  },
  {
    title: "Add your accounts and assets",
    description:
      "Add your wallet and bank accounts with their current balance, plus any investments, property, debts or receivables.",
  },
  {
    title: "Record as you go",
    description:
      "Log income and expenses when they happen. Balances, totals and charts update instantly — no spreadsheets to maintain.",
  },
];

const FAQ = [
  {
    q: "Is MoneyTor free?",
    a: "Yes. Create an account and use every feature at no cost.",
  },
  {
    q: "Do I need to connect my bank account?",
    a: "No. You record transactions yourself, so you never share bank credentials. It takes a few seconds per entry and keeps you aware of your spending.",
  },
  {
    q: "Can I use my own categories?",
    a: "Yes. Rename, recolor, add or remove categories for income and expenses. When you remove one that's in use, you choose where its transactions move, so nothing gets lost.",
  },
  {
    q: "Which currencies and markets are supported?",
    a: "Everyday amounts are in Rupiah. Investments can be bought in another currency such as USD. Crypto prices come from CoinGecko and stock prices from Yahoo Finance, including Indonesian (IDX) stocks.",
  },
  {
    q: "What happens if I try to record an expense larger than my balance?",
    a: "MoneyTor stops it and tells you, so your account balances always match reality. Pick another account or record the income first.",
  },
  {
    q: "Can I use it on my phone?",
    a: "Yes. The app is built for small screens too, and you can install it to your home screen like a regular app.",
  },
];

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-primary text-sm font-semibold tracking-wide uppercase dark:text-blue-400">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-balance sm:text-4xl">{title}</h2>
      <p className="text-muted-foreground mt-4 text-pretty">{description}</p>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <header className="bg-background/80 sticky top-0 z-50 w-full border-b backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4 md:px-6">
          <Link
            href="/"
            className="text-primary dark:text-primary-foreground flex items-center gap-2 text-xl font-semibold sm:text-2xl"
          >
            <Coins className="size-6 shrink-0" />
            <span>MoneyTor</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm lg:flex" aria-label="Sections">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className="text-muted-foreground hover:text-foreground transition-colors">
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b">
          <div
            className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_60%,transparent_100%)] opacity-60"
            aria-hidden
          />
          <div className="container mx-auto grid max-w-6xl items-center gap-14 px-4 py-16 md:px-6 md:py-24 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
            <div className="text-center lg:text-left">
              <p className="bg-primary/10 text-primary dark:bg-primary/25 dark:text-blue-300 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium">
                <span className="bg-primary size-1.5 rounded-full" />
                Free personal finance tracker
              </p>
              <h1 className="mt-5 text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                Know where every <span className="text-primary dark:text-blue-400">rupiah</span> goes.
              </h1>
              <p className="text-muted-foreground mx-auto mt-5 max-w-xl text-lg text-pretty lg:mx-0">
                MoneyTor brings your income, expenses, cash accounts, investments, debts and saving goals into one
                dashboard — so you always know what you own, what you owe, and where your money went.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                <Button size="lg" className="h-11 px-6" asChild>
                  <Link href="/register">
                    Create free account
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-11 px-6" asChild>
                  <a href="#features">See what it does</a>
                </Button>
              </div>
              <ul className="text-muted-foreground mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm lg:justify-start">
                {["No bank login needed", "Rupiah-first, multi-currency investments", "Phone and desktop"].map((t) => (
                  <li key={t} className="flex items-center gap-1.5">
                    <Check className="size-4 text-green-600 dark:text-green-500" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <ProductPreview />
          </div>
        </section>

        {/* Benefits */}
        <section id="benefits" className="scroll-mt-14 py-16 md:py-24">
          <div className="container mx-auto max-w-6xl px-4 md:px-6">
            <SectionHeading
              eyebrow="Why MoneyTor"
              title="Stop guessing where the money went"
              description="Bank apps show one account at a time and spreadsheets go stale. MoneyTor keeps the full picture current with a few taps a day."
            />
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {BENEFITS.map(({ icon: Icon, title, description }) => (
                <div key={title} className="text-center md:text-left">
                  <div className="bg-primary text-primary-foreground mx-auto flex size-11 items-center justify-center rounded-xl shadow-lg shadow-primary/20 md:mx-0">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="bg-muted/40 scroll-mt-14 border-y py-16 md:py-24">
          <div className="container mx-auto max-w-6xl px-4 md:px-6">
            <SectionHeading
              eyebrow="Features"
              title="Everything your money touches, in one app"
              description="From a Rp 15.000 coffee to your stock portfolio — record it once and see it everywhere it matters."
            />
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, description, points, className }) => (
                <div key={title} className={cn("bg-card rounded-2xl border p-6", className)}>
                  <div className="bg-primary/10 text-primary dark:bg-primary/25 dark:text-blue-300 flex size-10 items-center justify-center rounded-lg">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-4 font-semibold">{title}</h3>
                  <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">{description}</p>
                  {points && (
                    <ul className="mt-4 grid gap-2 text-sm">
                      {points.map((p) => (
                        <li key={p} className="flex gap-2">
                          <Check className="text-primary mt-0.5 size-4 shrink-0 dark:text-blue-400" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
            <ul className="text-muted-foreground mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm">
              {EXTRAS.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2">
                  <Icon className="size-4" />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-14 py-16 md:py-24">
          <div className="container mx-auto max-w-6xl px-4 md:px-6">
            <SectionHeading
              eyebrow="How it works"
              title="Set up in five minutes"
              description="No imports or bank connections. Start with what you have today and build from there."
            />
            <ol className="mt-12 grid gap-6 md:grid-cols-3">
              {STEPS.map((step, i) => (
                <li key={step.title} className="relative rounded-2xl border p-6">
                  <span className="text-primary border-primary/30 bg-primary/5 dark:border-blue-400/40 dark:text-blue-300 flex size-9 items-center justify-center rounded-full border text-sm font-bold tabular-nums">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="bg-muted/40 scroll-mt-14 border-y py-16 md:py-24">
          <div className="container mx-auto max-w-3xl px-4 md:px-6">
            <SectionHeading
              eyebrow="FAQ"
              title="Questions, answered"
              description="Something else on your mind? Create an account and look around — it's free."
            />
            <div className="bg-card mt-10 divide-y rounded-2xl border">
              {FAQ.map(({ q, a }) => (
                <details key={q} className="group px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                    {q}
                    <ChevronDown className="text-muted-foreground size-4 shrink-0 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto max-w-6xl px-4 md:px-6">
            <div className="bg-primary text-primary-foreground relative overflow-hidden rounded-3xl px-6 py-14 text-center sm:px-12">
              <div
                className="absolute -top-24 -right-24 size-72 rounded-full bg-white/10 blur-2xl"
                aria-hidden
              />
              <h2 className="relative text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                Your money, finally in one place
              </h2>
              <p className="relative mx-auto mt-4 max-w-xl text-pretty opacity-90">
                Create an account, add your first cash account and record today&apos;s spending. You&apos;ll see your
                month take shape right away.
              </p>
              <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button size="lg" variant="secondary" className="h-11 px-6" asChild>
                  <Link href="/register">
                    Get started free
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  className="hover:text-primary-foreground h-11 px-6 hover:bg-white/10"
                  asChild
                >
                  <Link href="/login">I already have an account</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-6">
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Coins className="text-primary size-4 dark:text-blue-400" />
            <span>© {new Date().getFullYear()} MoneyTor</span>
          </div>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm" aria-label="Footer">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className="text-muted-foreground hover:text-foreground transition-colors">
                {item.label}
              </a>
            ))}
            <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
              Log in
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
