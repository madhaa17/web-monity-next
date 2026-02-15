import { queryOptions } from "@tanstack/react-query";
import * as assetsApi from "@/lib/api/assets";

export const assetsQueryKey = ["assets"] as const;

export function assetsQueryOptions() {
  return queryOptions({
    queryKey: assetsQueryKey,
    queryFn: () => assetsApi.listAssets(),
  });
}

export function assetQueryKey(uuid: string) {
  return ["assets", uuid] as const;
}

export function assetQueryOptions(uuid: string) {
  return queryOptions({
    queryKey: assetQueryKey(uuid),
    queryFn: () => assetsApi.getAsset(uuid),
  });
}
