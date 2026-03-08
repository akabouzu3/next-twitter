import Home from "@/components/layout/Home";
import { SignupModal } from "@/features/auth/components/SignupModal";

export default function LoginPage() {

  return (
    <>
    <Home />
    
    <SignupModal open={true} />
    </>
  );
}
