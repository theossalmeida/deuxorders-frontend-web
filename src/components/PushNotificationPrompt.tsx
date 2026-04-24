"use client";

import { Bell, BellOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export function PushNotificationPrompt() {
  const { status, isLoading, error, enable, disable } = usePushNotifications();

  if (status === "checking" || status === "unsupported") {
    return null;
  }

  if (status === "permission-denied") {
    return (
      <div className="fixed inset-x-3 bottom-24 z-40 rounded-lg border border-border bg-card p-3 shadow-sm md:inset-x-auto md:right-4 md:bottom-4 md:w-72">
        <div className="flex items-start gap-2.5">
          <BellOff className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold">Notificacoes bloqueadas</div>
            <div className="mt-0.5 text-xs leading-5 text-muted-foreground">
              Altere a permissao nas configuracoes do navegador.
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "backend-unavailable") {
    return (
      <div className="fixed inset-x-3 bottom-24 z-40 rounded-lg border border-border bg-card p-3 shadow-sm md:inset-x-auto md:right-4 md:bottom-4 md:w-72">
        <div className="flex items-start gap-2.5">
          <BellOff className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold">Notificacoes indisponiveis</div>
            <div className="mt-0.5 text-xs leading-5 text-muted-foreground">
              O servidor esta com notificacoes push desativadas.
            </div>
            {error ? <div className="mt-2 text-xs leading-5 text-destructive">{error}</div> : null}
          </div>
        </div>
      </div>
    );
  }

  const isSubscribed = status === "subscribed";

  return (
    <div className="fixed inset-x-3 bottom-24 z-40 rounded-lg border border-border bg-card p-3 shadow-sm md:inset-x-auto md:right-4 md:bottom-4 md:w-72">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold">Notificacoes</div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {isSubscribed ? "Ativas neste dispositivo." : "Inativas neste dispositivo."}
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          variant={isSubscribed ? "outline" : "default"}
          disabled={isLoading}
          onClick={isSubscribed ? disable : enable}
        >
          {isLoading ? (
            <Loader2 className="animate-spin" aria-hidden />
          ) : isSubscribed ? (
            <BellOff aria-hidden />
          ) : (
            <Bell aria-hidden />
          )}
          {isSubscribed ? "Desativar notificacoes" : "Ativar notificacoes"}
        </Button>
      </div>
      {error ? <div className="mt-2 text-xs leading-5 text-destructive">{error}</div> : null}
    </div>
  );
}
