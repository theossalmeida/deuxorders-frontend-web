"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { ProductForm } from "@/components/products/ProductForm";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCreateProduct } from "@/hooks/useProducts";

type ProductFormInput = {
  Name: string;
  Price: string;
  Description?: string;
  Category?: string;
  Size?: string;
  Image?: File | null;
  removeImage?: boolean;
};

type Props = {
  triggerLabel?: string;
  compact?: boolean;
};

export function NewProductSheet({ triggerLabel = "Novo produto", compact = false }: Props) {
  const [open, setOpen] = useState(false);
  const createProduct = useCreateProduct();

  async function handleSubmit(data: ProductFormInput) {
    const formData = new FormData();
    formData.set("Name", data.Name);
    formData.set("Price", data.Price);

    if (data.Description) formData.set("Description", data.Description);
    if (data.Category) formData.set("Category", data.Category);
    if (data.Size) formData.set("Size", data.Size);
    if (data.Image) formData.set("Image", data.Image);
    if (data.removeImage) formData.set("removeImage", "true");

    await createProduct.mutateAsync(formData);
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        size={compact ? "icon" : "sm"}
        className={compact ? "h-9 w-9" : "gap-1.5"}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={triggerLabel}
      >
        <Plus size={compact ? 16 : 14} aria-hidden />
        {compact ? null : triggerLabel}
      </Button>

      <SheetContent className="sm:max-w-md">
        <SheetHeader className="px-0 pt-2">
          <SheetTitle>Novo produto</SheetTitle>
          <SheetDescription>Cadastre um item do catálogo com nome, preço e mídia opcional.</SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <ProductForm
            onSubmit={handleSubmit}
            isLoading={createProduct.isPending}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
