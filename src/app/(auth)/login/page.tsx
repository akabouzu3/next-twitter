// app/(auth)/login/page.tsx
import { Metadata } from "next";
import Home from "@/components/layout/Home";
import { LoginModal } from "@/components/modals/LoginModal";

export const metadata: Metadata = {
  title: "Kにログイン"
};

export default function LoginPage() {

  return (
    <>
    <Home/>

    <LoginModal open={true} />
    </>
  );
}
