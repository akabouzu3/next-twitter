import { requireAdmin } from "@/lib/auth/page-guards";

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  await requireAdmin();

  return (
    <>
      {children}
    </>
  );
}
