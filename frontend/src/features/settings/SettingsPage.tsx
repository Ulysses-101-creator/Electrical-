import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { getApiErrorMessage } from "@/api/client";
import { usersApi } from "@/api/users";
import { Alert } from "@/components/common/Alert";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Spinner } from "@/components/common/Spinner";
import { TopBar } from "@/components/layout/TopBar";
import { useAuth } from "@/features/auth/useAuth";

const settingsSchema = z.object({
  business_name: z.string().min(1, "Business name is required").max(255),
  default_labor_rate: z.coerce.number().min(0),
  default_callout_fee: z.coerce.number().min(0),
  default_tax_rate_pct: z.coerce.number().min(0).max(100),
  default_material_markup_pct: z.coerce.number().min(0).max(1000),
});
type SettingsFormValues = z.infer<typeof settingsSchema>;

export function SettingsPage() {
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const { data: user, isLoading } = useQuery({
    queryKey: ["users", "me"],
    queryFn: () => usersApi.getMe(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormValues>({ resolver: zodResolver(settingsSchema) });

  useEffect(() => {
    if (user) {
      reset({
        business_name: user.business_name,
        default_labor_rate: Number.parseFloat(user.default_labor_rate),
        default_callout_fee: Number.parseFloat(user.default_callout_fee),
        default_tax_rate_pct: Number.parseFloat(user.default_tax_rate) * 100,
        default_material_markup_pct: Number.parseFloat(user.default_material_markup_pct),
      });
    }
  }, [user, reset]);

  async function onSubmit(values: SettingsFormValues) {
    setSuccessMessage(null);
    setServerError(null);
    try {
      await usersApi.updateMe({
        business_name: values.business_name,
        default_labor_rate: values.default_labor_rate,
        default_callout_fee: values.default_callout_fee,
        default_tax_rate: values.default_tax_rate_pct / 100,
        default_material_markup_pct: values.default_material_markup_pct,
      });
      await queryClient.invalidateQueries({ queryKey: ["users", "me"] });
      setSuccessMessage("Settings saved.");
    } catch (error) {
      setServerError(getApiErrorMessage(error, "Could not save your settings."));
    }
  }

  if (isLoading) {
    return (
      <div className="py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <TopBar title="Settings" />
      <div className="mx-auto max-w-md">
        <h1 className="mb-6 hidden text-2xl font-bold text-ink-900 sm:block">Settings</h1>

        <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="flex flex-col gap-4">
          {successMessage && <Alert variant="success">{successMessage}</Alert>}
          {serverError && <Alert variant="error">{serverError}</Alert>}

          <Input
            label="Business name"
            error={errors.business_name?.message}
            {...register("business_name")}
          />
          <Input
            label="Default labor rate ($/hr)"
            type="number"
            step="0.01"
            error={errors.default_labor_rate?.message}
            {...register("default_labor_rate")}
          />
          <Input
            label="Default callout fee ($)"
            type="number"
            step="0.01"
            error={errors.default_callout_fee?.message}
            {...register("default_callout_fee")}
          />
          <Input
            label="Default tax rate (%)"
            type="number"
            step="0.01"
            error={errors.default_tax_rate_pct?.message}
            {...register("default_tax_rate_pct")}
          />
          <Input
            label="Default material markup (%)"
            type="number"
            step="0.01"
            error={errors.default_material_markup_pct?.message}
            {...register("default_material_markup_pct")}
          />

          <Button type="submit" isLoading={isSubmitting} fullWidth>
            Save settings
          </Button>
        </form>

        <div className="mt-8 border-t border-ink-200 pt-6">
          <Button variant="ghost" onClick={() => void logout()}>
            Log out
          </Button>
        </div>
      </div>
    </>
  );
}
