"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DestructiveDialogHeader } from "@/components/ui/destructive-dialog-header";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { CashFlowEntryForm } from "@/components/cash/CashFlowEntryForm";
import { useCashEntry, useUpdateCashEntry, useDeleteCashEntry } from "@/hooks/useCashFlow";
import { formatDateTime, formatDate } from "@/lib/format";
import { CASH_CATEGORY_LABEL } from "@/types/cash";

function centsToBrlString(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}

export default function CashEntryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: entry, isLoading, isError } = useCashEntry(id);
  const update = useUpdateCashEntry(id);
  const deleteMutation = useDeleteCashEntry();
  const [deleteReason, setDeleteReason] = useState("");

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !entry) {
    return (
      <p className="text-center py-16 text-sm text-muted-foreground">
        Lançamento não encontrado.
      </p>
    );
  }

  const isAutomatic = entry.source !== "Manual";
  const isDeleted = entry.deletedAt !== null;

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold">Detalhes do lançamento</h1>
      </div>

      {isAutomatic && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          <p className="font-semibold">Lançamento automático — não editável</p>
          <p className="mt-0.5 text-blue-600">
            Gerado automaticamente pelo sistema.
            {entry.sourceId && (
              <>
                {" "}
                <Link href={`/orders/${entry.sourceId}`} className="underline hover:text-blue-800">
                  Ver pedido
                </Link>
              </>
            )}
          </p>
        </div>
      )}

      {isDeleted && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <p className="font-semibold">Lançamento excluído</p>
          <p className="mt-0.5 text-red-600">
            Excluído em {formatDateTime(entry.deletedAt!)}
          </p>
        </div>
      )}

      {!isAutomatic && !isDeleted ? (
        <>
          <CashFlowEntryForm
            defaultValues={{
              billingDate: entry.billingDate.slice(0, 10),
              type: entry.type,
              category: entry.category,
              counterparty: entry.counterparty,
              amountInput: centsToBrlString(entry.amountCents),
              notes: entry.notes ?? undefined,
            }}
            onSubmit={(input) => update.mutate(input)}
            isPending={update.isPending}
            submitLabel="Salvar alterações"
          />

          <div className="pt-2 border-t">
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir lançamento
                  </Button>
                }
              />
              <AlertDialogContent>
                <DestructiveDialogHeader
                  title="Excluir lançamento?"
                  description="Informe o motivo da exclusão (mínimo 5 caracteres)."
                />
                <Textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Motivo da exclusão..."
                  className="mt-2"
                />
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive hover:bg-destructive/90"
                    onClick={() =>
                      deleteMutation.mutate(
                        { id, reason: deleteReason },
                        { onSuccess: () => router.push("/cash") }
                      )
                    }
                    disabled={deleteReason.trim().length < 5 || deleteMutation.isPending}
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </>
      ) : (
        <div className="space-y-3 rounded-xl border p-4 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-muted-foreground">Data</p>
              <p className="font-medium">{formatDate(entry.billingDate)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tipo</p>
              <p className="font-medium">{entry.type === "Inflow" ? "Entrada" : "Saída"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Categoria</p>
              <p className="font-medium">{CASH_CATEGORY_LABEL[entry.category]}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Contraparte</p>
              <p className="font-medium">{entry.counterparty}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Valor</p>
              <p className="font-medium">R$ {centsToBrlString(entry.amountCents)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Autor</p>
              <p className="font-medium">{entry.authorUserName}</p>
            </div>
          </div>
          {entry.notes && (
            <div>
              <p className="text-xs text-muted-foreground">Observações</p>
              <p>{entry.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
