import { Metadata } from "next";
import Home from "@/components/layout/Home";
import { SignupModal } from "@/components/modals/SignupModal";

export const metadata: Metadata = {
  title: "アカウント登録"
};

export default function SignupPage() {

  return (
    <>
    <Home />
    
    <SignupModal open={true} />
    </>
  );
}
