"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Client } from "@/types/clients";

const schema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  mobile: z.string().min(8, "Telefone inválido"),
  status: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  client?: Client;
  onSubmit: (data: FormData) => Promise<void>;
  isLoading?: boolean;
  showStatus?: boolean;
}

export function ClientForm({ client, onSubmit, isLoading, showStatus }: Props) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: client
      ? { name: client.name, mobile: client.mobile, status: client.status }
      : undefined,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label>Nome</Label>
        <Input {...register("name")} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-1">
        <Label>Telefone</Label>
        <Input type="tel" {...register("mobile")} placeholder="11999998888" />
        {errors.mobile && <p className="text-xs text-destructive">{errors.mobile.message}</p>}
      </div>

      {showStatus && client !== undefined && (
        <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
          <Label className="cursor-pointer">Status</Label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Switch checked={field.value} onCheckedChange={field.onChange} />
                {field.value ? "Ativo" : "Inativo"}
              </div>
            )}
          />
        </div>
      )}

      <Button
        type="submit"
        className="w-full bg-brand hover:bg-brand-hover text-brand-foreground"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : client ? (
          "Salvar alterações"
        ) : (
          "Criar cliente"
        )}
      </Button>
    </form>
  );
}
