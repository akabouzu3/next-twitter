'use server'
import { signOut } from "@/auth";

export async function signoutAction(){
    await signOut({ redirectTo: '/login' });
}