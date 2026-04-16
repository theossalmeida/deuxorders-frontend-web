"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { Pencil, Trash2, ExternalLink } from "lucide-react";
import { CashTypeBadge } from "./CashTypeBadge";
import { CashCategoryBadge } from "./CashCategoryBadge";
import { CashSourceBadge } from "./CashSourceBadge";
import { formatCurrency, formatDate } from "@/lib/format";
import { useDeleteCashEntry } from "@/hooks/useCashFlow";
import type { CashFlowEntry } from "@/types/cash";

interface Props {
  entries: CashFlowEntry[];
}

export function CashFlowTable({ entries }: Props) {
  const deleteMutation = useDeleteCashEntry();
  const [deleteReason, setDeleteReason] = useState("");
  const [targetId, setTargetId] = useState<string | null>(null);

  return (
    <>
      {/* Single dialog rendered once, controlled by targetId */}
      <AlertDialog
        open={targetId !== null}
        onOpenChange={(open) => {
          if (!open) { setTargetId(null); setDeleteReason(""); }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir lançamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Informe o motivo da exclusão (mínimo 5 caracteres).
            </AlertDialogDescription>
          </AlertDialogHeader>
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
              onClick={() => {
                if (targetId) {
                  deleteMutation.mutate(
                    { id: targetId, reason: deleteReason },
                    { onSuccess: () => { setTargetId(null); setDeleteReason(""); } }
                  );
                }
              }}
              disabled={deleteReason.trim().length < 5 || deleteMutation.isPending}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Contraparte</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead>Origem</TableHead>
            <TableHead>Autor</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => {
            const isDeleted = entry.deletedAt !== null;
            const isManual = entry.source === "Manual";

            return (
              <TableRow
                key={entry.id}
                className={isDeleted ? "opacity-50" : undefined}
              >
                <TableCell className={isDeleted ? "line-through" : undefined}>
                  {formatDate(entry.billingDate)}
                  {isDeleted && (
                    <p className="text-xs text-muted-foreground">
                      Excluído em {formatDate(entry.deletedAt!)}
                    </p>
                  )}
                </TableCell>
                <TableCell><CashTypeBadge type={entry.type} /></TableCell>
                <TableCell><CashCategoryBadge category={entry.category} /></TableCell>
                <TableCell className={isDeleted ? "line-through" : undefined}>
                  {entry.counterparty}
                </TableCell>
                <TableCell className={cn("text-right font-medium", isDeleted && "line-through")}>
                  {formatCurrency(entry.amountCents)}
                </TableCell>
                <TableCell><CashSourceBadge source={entry.source} /></TableCell>
                <TableCell className="text-xs text-muted-foreground">{entry.authorUserName}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {isManual && !isDeleted && (
                      <>
                        <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                          <Link href={`/cash/${entry.id}`}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-500 hover:text-red-700"
                          onClick={() => setTargetId(entry.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                    {!isManual && entry.sourceId && (
                      <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                        <Link href={`/orders/${entry.sourceId}`}>
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Ver pedido
                        </Link>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
}
