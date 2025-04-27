'use client'

import { LoginForm } from "@/components/auth/LoginForm";

export default function RegisterPage() {
  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <LoginForm initialTab="signup" />
    </div>
  );
}
