import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { MobileHeader } from "@/components/layout/MobileHeader";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex flex-1 flex-col min-w-0">
        <MobileHeader />

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0 bg-slate-50">
          {children}
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
