import { requireAuth } from "@/lib/auth/guards";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  // ログイン済みチェック
  await requireAuth();

  return (
    <>
      {children}
    </>
  );
}
