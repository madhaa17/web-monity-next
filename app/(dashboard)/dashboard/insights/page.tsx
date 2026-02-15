"use client";

import { useState } from "react";
import { useInsightsData } from "@/hooks/useInsightsData";
import { InsightsContent } from "@/components/dashboard/insights/InsightsContent";

function currentMonthParam(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default function InsightsPage() {
  const [month, setMonth] = useState(currentMonthParam());
  const { overview, cashflow, isLoading, isError, error, derived } = useInsightsData(month);

  return (
    <InsightsContent
      overview={overview}
      cashflow={cashflow}
      month={month}
      onMonthChange={setMonth}
      derived={derived}
      isLoading={isLoading}
      isError={isError}
      error={error}
    />
  );
}
