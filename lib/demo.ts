/** Public demo account shown on the login page. */
export const DEMO_ACCOUNT = {
  email: "testerx@moneytor.com",
  password: "@123Test#",
} as const;

/** True for the shared demo account, whose settings (e.g. password) must stay unchanged. */
export function isDemoEmail(email: string | null | undefined): boolean {
  return email?.trim().toLowerCase() === DEMO_ACCOUNT.email;
}
