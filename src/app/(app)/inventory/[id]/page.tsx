"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppHeader } from "@/components/shell/app-header";
import { Skeleton } from "@/components/ui/skeleton";
import { RestockSheet } from "@/components/features/inventory/restock-sheet";
import {
  useInventoryMaterial,
  useUpdateMaterial,
  useToggleMaterialStatus,
  useDeleteMaterial,
} from "@/hooks/useInventory";
import { formatQuantity, formatUnitCostDisplay, formatCents } from "@/lib/format";
import { MEASURE_UNIT_LABEL, MEASURE_UNIT_SHORT, type MeasureUnit } from "@/types/inventory";
import { cn } from "@/lib/utils";

export default function MaterialDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: material, isLoading } = useInventoryMaterial(id);
  const { mutate: updateMaterial, isPending: saving } = useUpdateMaterial(id);
  const { mutate: toggleStatus, isPending: togglingStatus } = useToggleMaterialStatus();
  const { mutate: deleteMaterial, isPending: deleting } = useDeleteMaterial();

  const [name, setName] = useState("");
  const [measureUnit, setMeasureUnit] = useState<MeasureUnit | "">("");

  if (isLoading) {
    return (
      <div className="space-y-4 px-4 pt-4 md:px-7">
        <Skeleton className="h-12 rounded-xl" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <p className="text-muted-foreground">Material não encontrado.</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => router.back()}>
          Voltar
        </Button>
      </div>
    );
  }

  const resolvedName = name || material.name;
  const resolvedUnit = (measureUnit || material.measureUnit) as MeasureUnit;
  const isNegative = material.quantity < 0;
  const totalValue = material.quantity * material.unitCost;

  function handleDelete() {
    if (!confirm("Desativar este material? Ele não será excluído permanentemente.")) return;
    deleteMaterial(material!.id);
  }

  function handleSave() {
    updateMaterial({ name: resolvedName, measureUnit: resolvedUnit });
  }

  return (
    <>
      <div className="hidden md:block">
        <AppHeader
          title={material.name}
          subtitle={`Estoque · ${MEASURE_UNIT_LABEL[material.measureUnit]}`}
          actions={
            <>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Switch
                  checked={material.status}
                  disabled={togglingStatus}
                  onCheckedChange={(v) => toggleStatus({ id: material.id, active: v })}
                />
                {material.status ? "Ativo" : "Inativo"}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-destructive hover:text-destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                <Trash2 size={14} /> Excluir
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                Salvar alterações
              </Button>
            </>
          }
        />
      </div>

      <div className="sticky top-0 z-20 flex items-center gap-3 bg-background px-4 pt-14 pb-3 md:hidden">
        <button type="button" onClick={() => router.back()}>
          <ArrowLeft size={18} />
        </button>
        <span className="font-semibold">{material.name}</span>
        <div className="ml-auto flex items-center gap-2">
          <Switch
            checked={material.status}
            disabled={togglingStatus}
            onCheckedChange={(v) => toggleStatus({ id: material.id, active: v })}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 px-4 pt-4 pb-8 md:grid-cols-2 md:px-7 md:pt-5">
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Estoque atual
            </div>
            <div className={cn("font-mono text-[32px] font-semibold leading-none flex items-center gap-2", isNegative && "text-destructive")}>
              {isNegative && <AlertTriangle size={20} />}
              {formatQuantity(material.quantity, material.measureUnit)}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] text-muted-foreground">Custo unitário</div>
                <div className="font-mono text-sm font-medium">
                  {formatUnitCostDisplay(material.unitCost, material.measureUnit)}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground">Valor total em estoque</div>
                <div className={cn("font-mono text-sm font-medium", isNegative && "text-destructive")}>
                  {formatCents(Math.abs(totalValue))}{isNegative ? " (negativo)" : ""}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <RestockSheet material={material} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Informações
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Nome</Label>
                <Input value={resolvedName} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Unidade de medida</Label>
                <Select
                  value={resolvedUnit}
                  onValueChange={(v) => setMeasureUnit(v as MeasureUnit)}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {() => `${MEASURE_UNIT_SHORT[resolvedUnit]} — ${MEASURE_UNIT_LABEL[resolvedUnit]}`}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(MEASURE_UNIT_LABEL) as [MeasureUnit, string][]).map(([k, label]) => (
                      <SelectItem key={k} value={k}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4 md:hidden">
              <Button className="w-full" onClick={handleSave} disabled={saving}>
                Salvar alterações
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
