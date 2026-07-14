import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import { getApiErrorMessage } from "@/api/client";
import { Alert } from "@/components/common/Alert";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { useAuth } from "@/features/auth/useAuth";
import { loginSchema, type LoginFormValues } from "@/lib/validation";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginFormValues) {
    setServerError(null);
    try {
      await login(values.email, values.password);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setServerError(getApiErrorMessage(error, "Invalid email or password."));
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-12 sm:mx-auto sm:w-full sm:max-w-sm">
      <h1 className="text-2xl font-bold text-ink-900">Welcome back</h1>
      <p className="mt-1 text-sm text-ink-500">Log in to send your next quote.</p>

      <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="mt-8 flex flex-col gap-4">
        {serverError && <Alert variant="error">{serverError}</Alert>}

        <Input
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />

        <Button type="submit" isLoading={isSubmitting} fullWidth>
          Log in
        </Button>
      </form>

      <div className="mt-6 flex flex-col gap-2 text-center text-sm">
        <Link to="/forgot-password" className="text-ink-500 hover:text-ink-700">
          Forgot your password?
        </Link>
        <p className="text-ink-500">
          New here?{" "}
          <Link to="/register" className="font-medium text-brand-600 hover:text-brand-700">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
