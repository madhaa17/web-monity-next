/**
 * Cookie names for MoneyTor auth. Both cookies are HttpOnly and set by the backend
 * (backend/internal/pkg/authcookie); keep these names in sync with it.
 * The access token cookie is on path "/" so proxy.ts and Server Components can read it and
 * forward it as a Bearer token. The refresh token cookie is scoped to /api/v1/auth and never
 * reaches frontend code.
 */
export const MoneyTor_TOKEN = "MoneyTor_token";
