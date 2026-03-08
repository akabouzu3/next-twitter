'use server'
import { signIn } from "@/auth";

export async function googleLoginAction(){
    await await signIn("google");
}