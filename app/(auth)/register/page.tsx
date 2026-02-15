"use client";

import { RegisterForm } from "@/components/auth/RegisterForm";
import { useRegisterForm } from "@/hooks/useRegisterForm";

export default function RegisterPage() {
  const form = useRegisterForm();
  return <RegisterForm {...form} />;
}
