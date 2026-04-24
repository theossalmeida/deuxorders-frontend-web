self.addEventListener("push", (event) => {
  let data = {};

  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = {};
    }
  }

  const targetUrl = new URL(data.url || "/dashboard", self.location.origin);

  event.waitUntil(
    self.registration.showNotification(data.title || "Deuxcerie", {
      body: data.body,
      icon: "/icon.png",
      badge: "/icon.png",
      data: {
        url: targetUrl.href,
      },
      tag: data.type,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = new URL(
    event.notification.data?.url || "/dashboard",
    self.location.origin
  );

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          const clientUrl = new URL(client.url);

          if (clientUrl.origin !== self.location.origin) {
            continue;
          }

          if ("navigate" in client && clientUrl.href !== targetUrl.href) {
            return client.navigate(targetUrl.href).then((navigatedClient) => {
              return (navigatedClient || client).focus();
            });
          }

          return client.focus();
        }

        return clients.openWindow(targetUrl.href);
      })
  );
});
