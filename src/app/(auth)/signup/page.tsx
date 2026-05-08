import { Metadata } from "next";
import Home from "@/components/layout/Home";
import SignupDialog from "@/features/auth/components/SignupDialog";

export const metadata: Metadata = {
  title: "アカウント登録"
};

export default function SignupPage() {

  return (
    <>
    <Home />
    
    <SignupDialog open={true} />
    </>
  );
}
