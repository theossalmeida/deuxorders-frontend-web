"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Client } from "@/types/clients";

const schema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  mobile: z.string().min(8, "Telefone inválido"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  client?: Client;
  onSubmit: (data: FormData) => Promise<void>;
  isLoading?: boolean;
}

export function ClientForm({ client, onSubmit, isLoading }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: client ? { name: client.name, mobile: client.mobile } : undefined,
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

      <Button
        type="submit"
        className="w-full"
        style={{ backgroundColor: "#581629" }}
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
