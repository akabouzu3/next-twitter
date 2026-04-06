import { requireAuth } from "@/lib/auth/page-guards";
import LeftSidebar from "@/components/layout/LeftSidebar";
import { getCurrentUser } from "@/lib/auth/current-user";
import MobileBottomNav from "@/components/layout/MobileBottomNav";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  // ログイン済みチェック
  await requireAuth();
  const currentUser = await getCurrentUser();

  return (
    <>
    <div className="min-h-dvh bg-black text-white">

      <div className="flex">
        <aside className="hidden md:flex flex-auto md:basis-[88px] xl:basis-[275px] justify-end">
          <div className="sticky top-0 h-dvh overflow-y-auto shrink-0 border-r border-white/10
            md:w-[88px] 
            xl:w-[275px]">
            <LeftSidebar currentUser={currentUser} />
          </div>
        </aside>

        {children}
      </div>

      <MobileBottomNav />
    </div>
    </>
  );
}
