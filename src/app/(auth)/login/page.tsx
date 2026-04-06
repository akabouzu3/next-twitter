// app/(auth)/login/page.tsx
import { Metadata } from "next";
import Home from "@/components/layout/Home";
import LoginDialog from "@/features/auth/components/LoginDialog";

export const metadata: Metadata = {
  title: "Kにログイン"
};

export default function LoginPage() {

  return (
    <>
    <Home/>

    <LoginDialog open={true} />
    </>
  );
}
