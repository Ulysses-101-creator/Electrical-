import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import { getApiErrorMessage } from "@/api/client";
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
    <div className="flex min-h-screen flex-col justify-center bg-[#0a0a0a] px-6 py-12 text-neutral-100 antialiased sm:mx-auto sm:w-full sm:max-w-sm">
      <Link to="/" className="mb-10 text-[15px] font-bold">
        ElectricQuote
      </Link>

      <h1 className="text-2xl font-bold tracking-[-0.02em]">Welcome back</h1>
      <p className="mt-1.5 text-sm text-neutral-500">Log in to send your next quote.</p>

      <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="mt-9 flex flex-col gap-4">
        {serverError && (
          <div className="rounded-lg border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-400">
            {serverError}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-[13px] font-medium text-neutral-400">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="rounded-lg border border-neutral-800 bg-[#0f0f0f] px-3.5 py-2.5 text-[15px] text-neutral-100 outline-none placeholder:text-neutral-600 focus:border-neutral-600"
            {...register("email")}
          />
          {errors.email?.message && (
            <span className="text-[13px] text-red-400">{errors.email.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-[13px] font-medium text-neutral-400">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="rounded-lg border border-neutral-800 bg-[#0f0f0f] px-3.5 py-2.5 text-[15px] text-neutral-100 outline-none placeholder:text-neutral-600 focus:border-neutral-600"
            {...register("password")}
          />
          {errors.password?.message && (
            <span className="text-[13px] text-red-400">{errors.password.message}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-neutral-100 px-4 py-3 text-[14.5px] font-semibold text-[#0a0a0a] disabled:opacity-60"
        >
          {isSubmitting && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          )}
          Log in
        </button>
      </form>

      <div className="mt-7 flex flex-col gap-2.5 text-center text-sm">
        <Link to="/forgot-password" className="text-neutral-500 hover:text-neutral-300">
          Forgot your password?
        </Link>
        <p className="text-neutral-500">
          New here?{" "}
          <Link to="/register" className="font-medium text-[#e8492c]">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

