import { requireGuest } from "@/lib/auth/guards";

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  await requireGuest();

  return (
    <>
      {children}
    </>
  );
}
