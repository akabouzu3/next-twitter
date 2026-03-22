import { Metadata } from "next";
import AppLayout from "@/features/app/components/AppLayout";
import { mockPosts } from "@/features/app/data/mock-posts"
import { getCurrentUser } from "@/lib/auth/current-user";

export const metadata: Metadata = {
  title: "ホーム"
};

export default async function AppPage() {

  const currentUser = await getCurrentUser();

  return (
    <>
    <AppLayout currentUser={currentUser} posts={mockPosts}/>
    </>
  )
}
