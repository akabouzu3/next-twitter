import { requirePageCurrentUser } from "@/lib/auth/page-guards";
import { getRecommendedUsers } from "@/features/user/server/get-recommended-users";
import ThreeColumnFrame from "@/components/frame/ThreeColumnFrame";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { MobilePostComposerTrigger } from "@/features/post/components/MobilePostComposerTrigger";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const currentUser = await requirePageCurrentUser();
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
