"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Product } from "@/types/products";

const schema = z.object({
  Name: z.string().min(1, "Nome obrigatório").max(100),
  Price: z.string().min(1, "Preço obrigatório"),
  Description: z.string().optional(),
  Category: z.string().optional(),
  Size: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  product?: Product;
  onSubmit: (formData: FormData & { Image?: File | null; removeImage?: boolean }) => Promise<void>;
  isLoading?: boolean;
}

export function ProductForm({ product, onSubmit, isLoading }: Props) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: product
      ? {
          Name: product.name,
          Price: String(product.priceCents / 100),
          Description: product.description ?? "",
          Category: product.category ?? "",
          Size: product.size ?? "",
        }
      : undefined,
  });

  const previewUrl = imageFile
    ? URL.createObjectURL(imageFile)
    : removeImage
    ? null
    : product?.image;

  async function submit(data: FormData) {
    await onSubmit({ ...data, Image: imageFile, removeImage });
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div className="space-y-1">
        <Label>Nome</Label>
        <Input {...register("Name")} />
        {errors.Name && <p className="text-xs text-destructive">{errors.Name.message}</p>}
      </div>

      <div className="space-y-1">
        <Label>Preço (R$)</Label>
        <Input type="text" inputMode="decimal" placeholder="19,90" {...register("Price")} />
        {errors.Price && <p className="text-xs text-destructive">{errors.Price.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Categoria (opcional)</Label>
          <Input {...register("Category")} />
        </div>
        <div className="space-y-1">
          <Label>Tamanho (opcional)</Label>
          <Input {...register("Size")} placeholder="P / M / G" />
        </div>
      </div>

      <div className="space-y-1">
        <Label>Descrição (opcional)</Label>
        <Textarea rows={2} {...register("Description")} />
      </div>

      <div className="space-y-2">
        <Label>Imagem (opcional)</Label>
        <div className="flex items-center gap-3">
          {previewUrl ? (
            <div className="relative w-24 h-24">
              <img
                src={previewUrl}
                alt="preview"
                className="w-24 h-24 object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  setRemoveImage(true);
                }}
                className="absolute -top-1.5 -right-1.5 bg-destructive text-white rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <label
              className="flex flex-col items-center justify-center w-24 h-24 rounded-lg border-2 border-dashed text-muted-foreground cursor-pointer hover:border-primary transition-colors"
              onClick={() => inputRef.current?.click()}
            >
              <ImagePlus className="h-5 w-5" />
              <span className="text-xs mt-1">Adicionar</span>
            </label>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setImageFile(file);
                setRemoveImage(false);
              }
              e.target.value = "";
            }}
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-brand hover:bg-brand-hover text-brand-foreground"
        disabled={isLoading}
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : product ? "Salvar alterações" : "Criar produto"}
      </Button>
    </form>
  );
}
