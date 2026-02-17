"use client";

import type { Asset, AssetType, PortfolioSummary } from "@/lib/api/types";
import { formatCurrency, toNumber } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import Link from "next/link";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";

export interface PortfolioByTypeCardProps {
  portfolio: PortfolioSummary | undefined;
  assets: Asset[];
}

const DEFAULT_CURRENCY = "IDR";

const TYPE_ORDER: AssetType[] = [
  "CRYPTO",
  "STOCK",
  "CASH",
  "LIVESTOCK",
  "REAL_ESTATE",
  "OTHER",
];

const TYPE_LABELS: Record<AssetType, string> = {
  CRYPTO: "Crypto",
  STOCK: "Stock",
  CASH: "Cash",
  LIVESTOCK: "Livestock",
  REAL_ESTATE: "Real estate",
  OTHER: "Other",
};

function buildValueByUuid(
  portfolio: PortfolioSummary | undefined,
): Map<string, number> {
  const map = new Map<string, number>();
  const list = portfolio?.assets;
  if (!Array.isArray(list)) return map;
  for (const a of list) {
    map.set(a.uuid, toNumber(a.value));
  }
  return map;
}

function buildCostByUuid(assets: Asset[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const a of assets) {
    const totalCost = toNumber(a.totalCost);
    const cost =
      totalCost > 0
        ? totalCost
        : toNumber(a.purchasePrice) * toNumber(a.quantity);
    map.set(a.uuid, cost);
  }
  return map;
}

interface GroupItem {
  name: string;
  value: number;
  uuid: string;
  type: AssetType;
}

function groupByType(
  assets: Asset[],
  valueByUuid: Map<string, number>,
): { type: AssetType; total: number; items: GroupItem[] }[] {
  const byType = new Map<AssetType, { total: number; items: GroupItem[] }>();
  for (const asset of assets) {
    const type = (asset.type ?? "OTHER") as AssetType;
    const value = valueByUuid.get(asset.uuid) ?? 0;
    if (!byType.has(type)) {
      byType.set(type, { total: 0, items: [] });
    }
    const entry = byType.get(type)!;
    entry.total += value;
    entry.items.push({
      name: asset.name ?? "—",
      value,
      uuid: asset.uuid,
      type,
    });
  }
  return TYPE_ORDER.filter((t) => byType.has(t)).map((type) => {
    const { total, items } = byType.get(type)!;
    return { type, total, items };
  });
}

const SHOW_PROFIT_LOSS_TYPES: AssetType[] = ["CRYPTO", "STOCK"];

export function PortfolioByTypeCard({
  portfolio,
  assets,
}: PortfolioByTypeCardProps) {
  const currency = portfolio?.currency ?? DEFAULT_CURRENCY;
  const valueByUuid = buildValueByUuid(portfolio);
  const costByUuid = buildCostByUuid(assets);
  const groups = groupByType(assets, valueByUuid);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Portfolio Overview</CardTitle>
      </CardHeader>
      <CardContent>
        {groups.length === 0 ? (
          <Empty className="py-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Wallet />
              </EmptyMedia>
              <EmptyTitle>No assets yet</EmptyTitle>
              <EmptyDescription>
                Add assets to see your portfolio by type.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="space-y-4">
            {groups.map(({ type, total, items }) => (
              <div
                key={type}
                className="border-b border-border/50 pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground uppercase">
                    {TYPE_LABELS[type]}
                  </span>
                  <span className="text-sm font-semibold tabular-nums">
                    {formatCurrency(total, currency)}
                  </span>
                </div>
                <ul className="mt-2 space-y-2 pl-2 text-sm">
                  {items.map((item) => {
                    const cost = costByUuid.get(item.uuid) ?? 0;
                    const profitLoss = item.value - cost;
                    const showProfitLoss =
                      SHOW_PROFIT_LOSS_TYPES.includes(item.type) && cost > 0;
                    return (
                      <li
                        key={item.uuid}
                        className="flex flex-col gap-0.5 text-foreground"
                      >
                        <div className="flex justify-between">
                          {item.type === "CRYPTO" || item.type === "STOCK" ? (
                            <Link
                              href={`/dashboard/assets/${item.uuid}`}
                              className="truncate underline"
                            >
                              {item.name}
                            </Link>
                          ) : (
                            <span className="truncate">{item.name}</span>
                          )}
                          <span className="truncate">{item.name}</span>
                          <span className="shrink-0 tabular-nums text-foreground">
                            {formatCurrency(item.value, currency)}
                          </span>
                        </div>
                        {showProfitLoss ? (
                          <div
                            className={
                              profitLoss >= 0
                                ? "text-right text-sm text-green-600 dark:text-green-500"
                                : "text-right text-sm text-red-600 dark:text-red-500"
                            }
                          >
                            {profitLoss >= 0 ? (
                              <TrendingUp className="w-4 h-4 inline-block mr-1" />
                            ) : (
                              <TrendingDown className="w-4 h-4 inline-block mr-1" />
                            )}
                            {formatCurrency(profitLoss, currency)}
                          </div>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
