import { redirect } from "next/navigation";
import { getSessionToken } from "@/lib/auth/session";
import { getUserFromToken } from "@/lib/auth/role";
import { AppSidebar } from "@/components/shell/app-sidebar";
import { MobileBottomNav } from "@/components/shell/mobile-bottom-nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const token = await getSessionToken();
  if (!token) redirect("/login");

  const user = getUserFromToken(token);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AppSidebar user={user} />
      <main className="flex min-w-0 flex-1 flex-col pb-24 md:pb-0">
        {children}
      </main>
      <MobileBottomNav />
    </div>
  );
}
