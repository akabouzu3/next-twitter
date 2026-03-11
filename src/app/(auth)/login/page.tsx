// app/(auth)/login/page.tsx
import Home from "@/components/layout/Home";
import { LoginModal } from "@/components/modals/LoginModal";

export default function LoginPage() {

  return (
    <>
    <Home/>

    <LoginModal open={true} />
    </>
  );
}
