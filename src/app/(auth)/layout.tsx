import { requireGuest } from "@/lib/auth/page-guards";

export default async function AuthLayout({
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
