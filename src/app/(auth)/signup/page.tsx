import Home from "@/components/layout/Home";
import { SignupModal } from "@/components/modals/SignupModal";

export default function LoginPage() {

  return (
    <>
    <Home />
    
    <SignupModal open={true} />
    </>
  );
}
