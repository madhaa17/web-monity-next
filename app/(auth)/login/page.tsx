"use client";

import { LoginForm } from "@/components/auth/LoginForm";
import { useLoginForm } from "@/hooks/useLoginForm";

export default function LoginPage() {
  const form = useLoginForm();
  return <LoginForm {...form} />;
}
