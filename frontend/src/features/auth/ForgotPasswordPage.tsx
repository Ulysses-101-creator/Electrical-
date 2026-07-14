import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";

import { authApi } from "@/api/auth";
import { Alert } from "@/components/common/Alert";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { emailSchema } from "@/lib/validation";

const schema = z.object({ email: emailSchema });
type FormValues = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    await authApi.forgotPassword(values.email);
    setSubmitted(true);
  }

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-12 sm:mx-auto sm:w-full sm:max-w-sm">
      <h1 className="text-2xl font-bold text-ink-900">Reset your password</h1>
      <p className="mt-1 text-sm text-ink-500">
        We'll email you a link to reset your password.
      </p>

      {submitted ? (
        <Alert variant="success">
          If an account exists for that email, a reset link is on its way.
        </Alert>
      ) : (
        <form
          onSubmit={(e) => void handleSubmit(onSubmit)(e)}
          className="mt-8 flex flex-col gap-4"
        >
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <Button type="submit" isLoading={isSubmitting} fullWidth>
            Send reset link
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-ink-500">
        <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
          Back to login
        </Link>
      </p>
    </div>
  );
}
