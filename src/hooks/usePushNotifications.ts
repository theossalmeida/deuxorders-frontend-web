"use client";

import { useCallback, useEffect, useState } from "react";
import { createApiClient } from "@/lib/api/client";
import { useToken } from "@/hooks/useToken";

type PushNotificationStatus =
  | "checking"
  | "unsupported"
  | "permission-denied"
  | "permission-default"
  | "granted-not-subscribed"
  | "subscribed";

type PushSubscriptionKeys = {
  p256dh?: string;
  auth?: string;
};

type StandaloneNavigator = Navigator & {
  standalone?: boolean;
};

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

function isIOSDevice() {
  const navigatorWithTouch = navigator as Navigator & { maxTouchPoints?: number };
  const platform = navigator.platform || "";
  const userAgent = navigator.userAgent || "";

  return (
    /iPad|iPhone|iPod/.test(userAgent) ||
    (platform === "MacIntel" && (navigatorWithTouch.maxTouchPoints ?? 0) > 1)
  );
}

function isStandaloneApp() {
  const standaloneNavigator = window.navigator as StandaloneNavigator;

  return (
    standaloneNavigator.standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches
  );
}

function getDeviceLabel() {
  const navigatorWithTouch = navigator as Navigator & { maxTouchPoints?: number };

  if (
    /iPad/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && (navigatorWithTouch.maxTouchPoints ?? 0) > 1)
  ) {
    return "iPad Safari";
  }

  return "iPhone Safari";
}

function hasPushSupport() {
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window &&
    Boolean(vapidPublicKey)
  );
}

async function getServiceWorkerRegistration() {
  const registration =
    (await navigator.serviceWorker.getRegistration("/")) ??
    (await navigator.serviceWorker.register("/sw.js"));

  return registration.active ? registration : navigator.serviceWorker.ready;
}

function getSubscriptionKeys(subscription: PushSubscription) {
  const keys = subscription.toJSON().keys as PushSubscriptionKeys | undefined;

  if (!keys?.p256dh || !keys.auth) {
    throw new Error("A assinatura push nao retornou as chaves esperadas.");
  }

  return keys;
}

export function usePushNotifications() {
  const token = useToken();
  const [status, setStatus] = useState<PushNotificationStatus>("checking");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshStatus = useCallback(async () => {
    if (!hasPushSupport() || !isIOSDevice() || !isStandaloneApp()) {
      setStatus("unsupported");
      return;
    }

    if (Notification.permission === "denied") {
      setStatus("permission-denied");
      return;
    }

    try {
      const registration = await getServiceWorkerRegistration();
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        setStatus("subscribed");
      } else if (Notification.permission === "granted") {
        setStatus("granted-not-subscribed");
      } else {
        setStatus("permission-default");
      }
    } catch {
      setStatus("unsupported");
    }
  }, []);

  useEffect(() => {
    let active = true;

    refreshStatus().finally(() => {
      if (!active) return;
    });

    return () => {
      active = false;
    };
  }, [refreshStatus]);

  const enable = useCallback(async () => {
    if (!token) {
      setError("Sessao expirada. Entre novamente.");
      return;
    }

    if (!vapidPublicKey) {
      setStatus("unsupported");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const registration = await getServiceWorkerRegistration();
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        setStatus(permission === "denied" ? "permission-denied" : "permission-default");
        return;
      }

      const existingSubscription = await registration.pushManager.getSubscription();
      const subscription =
        existingSubscription ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        }));

      const keys = getSubscriptionKeys(subscription);

      await createApiClient(token).post<void>("/push/subscribe", {
        endpoint: subscription.endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        deviceLabel: getDeviceLabel(),
      });

      setStatus("subscribed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel ativar notificacoes.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const disable = useCallback(async () => {
    if (!token) {
      setError("Sessao expirada. Entre novamente.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const registration = await getServiceWorkerRegistration();
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await createApiClient(token).delete<void>("/push/unsubscribe", {
          endpoint: subscription.endpoint,
        });
        await subscription.unsubscribe();
      }

      setStatus(Notification.permission === "granted" ? "granted-not-subscribed" : "permission-default");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel desativar notificacoes.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  return {
    status,
    isLoading,
    error,
    enable,
    disable,
    refreshStatus,
  };
}
