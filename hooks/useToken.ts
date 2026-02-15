"use client";

import { useCallback, useEffect, useState } from "react";
import { getToken, getRefreshToken } from "@/lib/api/client";

export function useToken(): {
  token: string | null;
  refreshToken: string | null;
  isLoaded: boolean;
} {
  const [token, setTokenState] = useState<string | null>(null);
  const [refreshToken, setRefreshTokenState] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setTokenState(getToken());
    setRefreshTokenState(getRefreshToken());
    setIsLoaded(true);
  }, []);

  return { token, refreshToken, isLoaded };
}
