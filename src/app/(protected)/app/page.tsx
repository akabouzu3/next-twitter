import { Metadata } from "next";
import AppLayout from "@/features/app/components/AppLayout";
import { mockPosts } from "@/features/app/data/mock-posts"

export const metadata: Metadata = {
  title: "ホーム"
};

export default function AppPage() {
  return (
    <>
    <AppLayout posts={mockPosts}/>
    </>
  )
}
