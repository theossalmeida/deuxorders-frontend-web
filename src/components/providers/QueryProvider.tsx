"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext, useState } from "react";

type AuthSessionContextValue = {
  token: string | null;
};

const AuthSessionContext = createContext<AuthSessionContextValue>({
  token: null,
});

export function useSessionToken() {
  return useContext(AuthSessionContext).token;
}

export function QueryProvider({
  children,
  sessionToken,
}: {
  children: React.ReactNode;
  sessionToken: string | null;
}) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 30,
            retry: (count, error) => {
              if (
                error &&
                typeof error === "object" &&
                "status" in error &&
                (error as { status: number }).status === 401
              ) {
                return false;
              }
              return count < 2;
            },
          },
        },
      })
  );

  return (
    <AuthSessionContext.Provider value={{ token: sessionToken }}>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </AuthSessionContext.Provider>
  );
}
