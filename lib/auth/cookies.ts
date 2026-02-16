/**
 * Cookie names for MoneyTor auth.
 * Access token is readable by client (no HttpOnly) so client can send Authorization: Bearer.
 * Refresh token is set HttpOnly in API routes and only used server-side for refresh.
 */
export const MoneyTor_TOKEN = "MoneyTor_token";
export const MoneyTor_REFRESH_TOKEN = "MoneyTor_refresh_token";
