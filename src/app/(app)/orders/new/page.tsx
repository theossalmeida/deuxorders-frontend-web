"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppHeader } from "@/components/shell/app-header";
import { OrderWizardStepper, type WizardStep } from "@/components/features/orders/new/order-wizard-stepper";
import { ItemsBuilder, type OrderItemDraft } from "@/components/features/orders/new/items-builder";
import { DeliverySection, type DeliveryMode } from "@/components/features/orders/new/delivery-section";
import { PaymentMethodPicker, type PaymentMethod } from "@/components/features/orders/new/payment-method-picker";
import { ReferenceUploader } from "@/components/features/orders/new/reference-uploader";
import { formatCents, localISODatetime } from "@/lib/format";
import { useCreateOrder, useOrdersDropdownData } from "@/hooks/useOrders";

function defaultDatetime() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return localISODatetime(d);
}

export default function NewOrderPage() {
  const router = useRouter();
  const step: WizardStep = "Cliente";
  const [clientId, setClientId] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [items, setItems] = useState<OrderItemDraft[]>([]);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>("retirada");
  const [address, setAddress] = useState("");
  const [date, setDate] = useState(defaultDatetime);
  const [payment, setPayment] = useState<PaymentMethod>("pix");
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const { clients, products } = useOrdersDropdownData();
  const createOrder = useCreateOrder();

  const subtotalCents = items.reduce((a, i) => a + i.unitPriceCents * i.qty, 0);

  const filteredClients = useMemo(
    () =>
      (clients.data ?? []).filter((c) =>
        c.name.toLowerCase().includes(clientSearch.toLowerCase()),
      ),
    [clients.data, clientSearch],
  );

  const filteredProducts = useMemo(
    () =>
      (products.data ?? []).filter((p) =>
        p.name.toLowerCase().includes(productSearch.toLowerCase()),
      ),
    [products.data, productSearch],
  );

  const selectedClient = clients.data?.find((c) => c.id === clientId);

  function addProduct(p: { id: string; name: string; priceCents: number; category: string | null }) {
    const existing = items.findIndex((i) => i.productId === p.id);
    if (existing >= 0) {
      const next = [...items];
      next[existing] = { ...next[existing], qty: next[existing].qty + 1 };
      setItems(next);
    } else {
      setItems([
        ...items,
        {
          productId: p.id,
          name: p.name,
          unitPriceCents: p.priceCents,
          category: p.category ?? undefined,
          qty: 1,
        },
      ]);
    }
    setShowProductPicker(false);
    setProductSearch("");
  }

  function handleSubmit() {
    if (!clientId || items.length === 0) return;
    createOrder.mutate({
      input: {
        clientId,
        deliveryDate: date,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.qty,
          unitPriceCents: i.unitPriceCents,
          observation: i.observation,
          massa: i.massa,
          sabor: i.sabor,
        })),
        delivery: deliveryMode === "entrega" ? address || "Entrega" : "pickup",
      },
      imageFiles,
    });
  }

  const summaryPanel = (
    <div className="rounded-xl border border-border bg-card p-4 md:p-5">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Resumo
      </div>
      <div className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-mono font-semibold">{formatCents(subtotalCents)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Entrega</span>
          <span className="font-mono text-muted-foreground">
            {deliveryMode === "entrega" ? "—" : "Retirada"}
          </span>
        </div>
        <div className="flex justify-between border-t border-border pt-2">
          <span className="font-semibold">Total</span>
          <span className="font-mono text-base font-semibold tracking-tight">{formatCents(subtotalCents)}</span>
        </div>
      </div>
      <div className="mt-4">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Pagamento
        </div>
        <PaymentMethodPicker value={payment} onChange={setPayment} />
      </div>
      <div className="mt-4 text-[10px] text-muted-foreground">● Rascunho</div>
      <Button
        className="mt-3 w-full"
        disabled={!clientId || items.length === 0 || createOrder.isPending}
        onClick={handleSubmit}
      >
        {createOrder.isPending ? "Criando..." : "Criar pedido"}
      </Button>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block">
        <AppHeader
          title="Novo pedido"
          subtitle="Preencha os dados abaixo"
          actions={
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              Cancelar
            </Button>
          }
        />
      </div>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-20 bg-background pt-14 md:hidden">
        <div className="flex items-center justify-between px-4 pb-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground"
          >
            <ArrowLeft size={16} /> Cancelar
          </button>
          <span className="text-sm font-semibold">Novo pedido</span>
          <div className="w-16" />
        </div>
        <OrderWizardStepper current={step} />
      </div>

      {/* Product picker overlay */}
      {showProductPicker && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background">
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <button type="button" onClick={() => setShowProductPicker(false)}>
              <ArrowLeft size={18} />
            </button>
            <span className="font-semibold">Escolher produto</span>
          </div>
          <div className="p-4">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Buscar produto"
                className="pl-9"
                autoFocus
              />
            </div>
          </div>
          <ul className="flex-1 divide-y divide-border overflow-y-auto">
            {filteredProducts.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => addProduct(p)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-accent"
                >
                  <span className="text-sm font-medium">{p.name}</span>
                  <span className="font-mono text-sm font-semibold">{formatCents(p.priceCents)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Main content */}
      <div className="px-4 pt-4 pb-28 md:grid md:grid-cols-[1fr_380px] md:gap-4 md:px-7 md:pb-6 md:pt-5">
        <div className="space-y-4">
          {/* Client section */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Cliente
            </div>
            {selectedClient ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand">
                    {selectedClient.name[0]}
                  </div>
                  <span className="font-medium">{selectedClient.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setClientId("")}
                  className="text-xs text-brand hover:underline"
                >
                  Trocar
                </button>
              </div>
            ) : (
              <div>
                <div className="relative mb-3">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    placeholder="Buscar cliente"
                    className="pl-9"
                  />
                </div>
                <ul className="max-h-48 divide-y divide-border overflow-y-auto rounded-lg border border-border bg-card">
                  {filteredClients.slice(0, 8).map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setClientId(c.id);
                          setClientSearch("");
                        }}
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-accent"
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-soft text-[11px] font-semibold text-brand">
                          {c.name[0]}
                        </div>
                        <span className="text-sm">{c.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Items section */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Itens
            </div>
            <ItemsBuilder
              items={items}
              onChange={setItems}
              onAddClick={() => setShowProductPicker(true)}
            />
          </div>

          {/* Delivery section */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Entrega
            </div>
            <DeliverySection
              mode={deliveryMode}
              onModeChange={setDeliveryMode}
              address={address}
              onAddressChange={setAddress}
              date={date}
              onDateChange={setDate}
            />
          </div>

          {/* References section */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Referências
            </div>
            <ReferenceUploader files={imageFiles} onChange={setImageFiles} />
          </div>

          {/* Summary on mobile */}
          <div className="md:hidden">{summaryPanel}</div>
        </div>

        {/* Desktop summary sidebar */}
        <div className="hidden md:block">
          <div className="sticky top-4">{summaryPanel}</div>
        </div>
      </div>

      {/* Mobile sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background/90 px-4 py-3 backdrop-blur-sm md:hidden">
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button
            className="flex-[2]"
            disabled={!clientId || items.length === 0 || createOrder.isPending}
            onClick={handleSubmit}
          >
            {createOrder.isPending ? "Criando..." : "Criar pedido"}
          </Button>
        </div>
      </div>
    </>
  );
}
