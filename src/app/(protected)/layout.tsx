import { requireAuth } from "@/lib/auth/page-guards";
import { getRecommendedUsers } from "@/features/user/server/get-recommended-users";
import ThreeColumnFrame from "@/components/frame/ThreeColumnFrame";
import { getCurrentUser } from "@/lib/auth/current-user";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { MobilePostComposerTrigger } from "@/features/post/components/MobilePostComposerTrigger";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  // ログイン済みチェック
  await requireAuth();
  const currentUser = await getCurrentUser();
  const recommendUsers = await getRecommendedUsers(10);

  return (
    <>
      <ThreeColumnFrame currentUser={currentUser} recommendUsers={recommendUsers}>
        {children}      
      </ThreeColumnFrame>

      <MobilePostComposerTrigger currentUser={currentUser} />
      <MobileBottomNav />
    </>
  );
}
