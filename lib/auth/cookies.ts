/**
 * Cookie names for Monity auth.
 * Access token is readable by client (no HttpOnly) so client can send Authorization: Bearer.
 * Refresh token is set HttpOnly in API routes and only used server-side for refresh.
 */
export const MONITY_TOKEN = "monity_token";
export const MONITY_REFRESH_TOKEN = "monity_refresh_token";
