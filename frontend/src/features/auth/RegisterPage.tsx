import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import { getApiErrorMessage } from "@/api/client";
import { Alert } from "@/components/common/Alert";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { useAuth } from "@/features/auth/useAuth";
import { registerSchema, type RegisterFormValues } from "@/lib/validation";

export function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterFormValues) {
    setServerError(null);
    try {
      await registerUser({
        email: values.email || undefined,
        phone: values.phone || undefined,
        password: values.password || undefined,
        business_name: values.business_name,
      });
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setServerError(getApiErrorMessage(error, "Could not create your account."));
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-12 sm:mx-auto sm:w-full sm:max-w-sm">
      <h1 className="text-2xl font-bold text-ink-900">Get started</h1>
      <p className="mt-1 text-sm text-ink-500">
        Create your account and send your first quote in minutes.
      </p>

      <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="mt-8 flex flex-col gap-4">
        {serverError && <Alert variant="error">{serverError}</Alert>}

        <Input
          label="Business name"
          autoComplete="organization"
          error={errors.business_name?.message}
          {...register("business_name")}
        />
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
          autoComplete="new-password"
          hint="At least 8 characters, with a letter and a number."
          error={errors.password?.message}
          {...register("password")}
        />

        <Button type="submit" isLoading={isSubmitting} fullWidth>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
          Log in
        </Link>
      </p>
    </div>
  );
}
