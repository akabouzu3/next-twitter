import type { NextAuthConfig } from 'next-auth';
 
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnApp = nextUrl.pathname.startsWith("/app");
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      const isLoginPage = nextUrl.pathname === "/login";
      const isSignupPage = nextUrl.pathname === "/signup";

      // /app と /admin はログイン必須
      if (isOnApp || isOnAdmin) return isLoggedIn;

      // ログインしている場合にログインページまたはサインアップページにアクセスした場合は /app にリダイレクト
      if (isLoggedIn && (isLoginPage || isSignupPage)) {
        return Response.redirect(new URL('/app', nextUrl));
      }

      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;