
export default async function UserLayout({
  children,
  // modal,
}: Readonly<{
  children: React.ReactNode;
  // modal: React.ReactNode;
}>) {

  return (
    <>
      {children}
      {/* {modal} */}
    </>
  );
}
