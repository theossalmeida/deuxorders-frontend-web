"use client";

import { useState } from "react";
import Image from "next/image";
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useToggleProductStatus,
  useDeleteProduct,
} from "@/hooks/useProducts";
import { ProductForm } from "@/components/products/ProductForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Plus, Search, Pencil, Trash2, X } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { Product } from "@/types/products";
import { Badge } from "@/components/ui/badge";

function buildProductFormData(
  data: {
    Name: string;
    Price: string;
    Description?: string;
    Category?: string;
    Size?: string;
    Image?: File | null;
    removeImage?: boolean;
  },
  existingProduct?: Product
): FormData {
  const fd = new FormData();
  fd.append("Name", data.Name);
  fd.append("Price", String(Math.round(parseFloat(data.Price.replace(",", ".")) * 100)));
  if (data.Description) fd.append("Description", data.Description);
  if (data.Category) fd.append("Category", data.Category);
  if (data.Size) fd.append("Size", data.Size);
  if (data.Image) fd.append("Image", data.Image);
  return fd;
}

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [showActive, setShowActive] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const { data: products, isLoading } = useProducts({ status: showActive });
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct(editProduct?.id ?? "");
  const toggleStatus = useToggleProductStatus();
  const deleteProduct = useDeleteProduct();

  const filtered = (products ?? []).filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleCreate(data: Parameters<typeof buildProductFormData>[0]) {
    const fd = buildProductFormData(data);
    await createProduct.mutateAsync(fd);
    setIsCreating(false);
  }

  async function handleUpdate(data: Parameters<typeof buildProductFormData>[0]) {
    if (!editProduct) return;
    const fd = buildProductFormData(data, editProduct);
    await updateProduct.mutateAsync(fd);
    setEditProduct(null);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-10 bg-background border-b px-4 py-3 space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
            {search && (
              <button className="absolute right-2.5 top-2.5" onClick={() => setSearch("")}>
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="active-switch"
              checked={showActive}
              onCheckedChange={setShowActive}
            />
            <Label htmlFor="active-switch" className="text-sm">
              {showActive ? "Ativos" : "Inativos"}
            </Label>
          </div>

          <Sheet open={isCreating} onOpenChange={setIsCreating}>
            <SheetTrigger render={<Button size="icon" style={{ backgroundColor: "#581629" }} />}>
              <Plus className="h-4 w-4" />
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Novo Produto</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <ProductForm onSubmit={handleCreate} isLoading={createProduct.isPending} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {isLoading && (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            Nenhum produto encontrado.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="rounded-xl border bg-white shadow-sm overflow-hidden"
            >
              {product.image ? (
                <div className="relative h-40 bg-muted">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-40 bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">Sem imagem</span>
                </div>
              )}

              <div className="p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{product.name}</p>
                    {product.category && (
                      <p className="text-xs text-muted-foreground">{product.category}</p>
                    )}
                  </div>
                  {product.size && (
                    <Badge variant="secondary" className="shrink-0">
                      {product.size}
                    </Badge>
                  )}
                </div>

                <p className="text-sm font-bold">{formatCurrency(product.price)}</p>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    <Switch
                      checked={product.status}
                      onCheckedChange={(checked) =>
                        toggleStatus.mutate({ id: product.id, active: checked })
                      }
                    />
                    <span className="text-xs text-muted-foreground">
                      {product.status ? "Ativo" : "Inativo"}
                    </span>
                  </div>

                  <div className="flex gap-1">
                    <Sheet
                      open={editProduct?.id === product.id}
                      onOpenChange={(open) => !open && setEditProduct(null)}
                    >
                      <SheetTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditProduct(product)} />}>
                        <Pencil className="h-3.5 w-3.5" />
                      </SheetTrigger>
                      <SheetContent>
                        <SheetHeader>
                          <SheetTitle>Editar Produto</SheetTitle>
                        </SheetHeader>
                        <div className="mt-6">
                          <ProductForm
                            product={product}
                            onSubmit={handleUpdate}
                            isLoading={updateProduct.isPending}
                          />
                        </div>
                      </SheetContent>
                    </Sheet>

                    <AlertDialog>
                      <AlertDialogTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" />}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Não é possível excluir produtos com pedidos existentes.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90"
                            onClick={() => deleteProduct.mutate(product.id)}
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
