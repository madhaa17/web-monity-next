"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  BarChart3,
  Coins,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";

const features = [
  {
    icon: Wallet,
    title: "Assets",
    description:
      "Track cash, crypto, stocks, and more in one place. Monitor values and see your portfolio at a glance.",
  },
  {
    icon: TrendingUp,
    title: "Expenses & income",
    description:
      "Log expenses by category and record income by source. Stay on top of cash flow with clear, organized lists.",
  },
  {
    icon: BarChart3,
    title: "Insights",
    description:
      "View monthly cashflow, trends, and expense breakdowns. Understand where your money goes and how you save.",
  },
  {
    icon: Target,
    title: "Saving goals",
    description:
      "Set targets and track progress. Hit your goals with deadlines and clear progress tracking.",
  },
] as const;

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-2xl text-primary dark:text-primary-foreground"
          >
            <Coins className="size-6 shrink-0" />
            <span className="ml-2">Monity</span>
          </Link>
          <nav className="flex items-center gap-2">
            <ThemeToggle className="mr-1" />
            <Button variant="ghost" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b py-16 md:py-24 lg:py-32">
          <div className="container mx-auto flex max-w-6xl flex-col items-center justify-center gap-8 px-4 text-center md:px-6">
            <div className="mx-auto max-w-3xl space-y-4">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Take control of your{" "}
                <span className="text-primary">finances</span>
              </h1>
              <p className="text-lg text-muted-foreground md:text-xl">
                Track assets, expenses, income, and saving goals in one place.
                Get a clear view of your money and make better decisions.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button size="lg" className="h-11 px-8" asChild>
                <Link href="/register">Get started free</Link>
              </Button>
              <Button size="lg" variant="outline" className="h-11 px-8" asChild>
                <Link href="/login">Log in</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto max-w-6xl px-4 md:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Everything you need to stay on track
              </h2>
              <p className="mt-4 text-muted-foreground">
                Simple tools to manage your money, understand your spending, and
                reach your goals.
              </p>
            </div>
            <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map(({ icon: Icon, title, description }) => (
                <Card key={title} className="flex flex-col">
                  <CardHeader>
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <CardDescription className="text-sm">
                      {description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t py-16 md:py-24">
          <div className="container mx-auto flex max-w-6xl flex-col items-center justify-center gap-6 px-4 text-center md:px-6">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Ready to take control?
            </h2>
            <p className="max-w-md text-muted-foreground">
              Create an account and start tracking your finances in minutes.
            </p>
            <Button size="lg" className="h-11 px-8" asChild>
              <Link href="/register">Get started free</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-6">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Monity. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link
              href="/login"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
