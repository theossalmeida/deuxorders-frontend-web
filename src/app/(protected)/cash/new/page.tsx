"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { CashFlowEntryForm } from "@/components/cash/CashFlowEntryForm";
import { useCreateCashEntry } from "@/hooks/useCashFlow";

export default function NewCashEntryPage() {
  const router = useRouter();
  const create = useCreateCashEntry();

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold">Novo lançamento</h1>
      </div>

      <CashFlowEntryForm
        onSubmit={(input) => create.mutate(input)}
        isPending={create.isPending}
        submitLabel="Criar lançamento"
      />
    </div>
  );
}
