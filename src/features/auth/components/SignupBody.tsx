import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Apple } from "lucide-react"

export default function SignupBody() {
  return (
    <div className="">
      <div className="flex flex-col gap-y-3">
        {/* Google */}
        <Button
          type="button"
          variant="secondary"
          className="w-full rounded-full h-11 bg-white text-black hover:bg-white/90 cursor-pointer"
          disabled
        >
          <span className="mr-2">G</span>
          Googleで登録
        </Button>

        {/* Apple */}
        {/* <Button
          type="button"
          variant="secondary"
          className="w-full rounded-full h-11 bg-white text-black hover:bg-white/90 cursor-pointer"
          disabled
        >
          <span className="mr-2"><Apple className="fill-black" /></span>
          Appleのアカウントで登録
        </Button> */}
      </div>

      {/* divider */}
      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-white/20" />
        <div className="text-sm text-white/70">または</div>
        <div className="h-px flex-1 bg-white/20" />
      </div>

      {/* input */}
      <form className="flex flex-col gap-4">
        <div className="">
          <label htmlFor="name">名前</label>
          <Input
            id="name"
            name="name"
            placeholder="山田"
            className="h-14 rounded-md bg-black text-white placeholder:text-white/40 border-white/20 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        <div className="">
          <label htmlFor="email">メールアドレス</label>
          <Input
            id="email"
            name="email"
            placeholder="example@google.com"
            className="h-14 rounded-md bg-black text-white placeholder:text-white/40 border-white/20 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-2">パスワード</label>
          <Input 
            id="password"
            name="password"
            placeholder="password"
            className="h-14 rounded-md bg-black text-white placeholder:text-white/40 border-white/20 
              focus-visible:ring-0 focus-visible:ring-offset-0 "
          />
        </div>

        <Button
          type="button"
          className="w-full rounded-full h-11 bg-white text-black hover:bg-white/90 cursor-pointer"
        >
          登録
        </Button>

      </form>

      <div className="mt-8 text-sm text-white/60">
        アカウントを既にお持ちの場合は{" "}
        <Link href="/login" className="text-sky-400 hover:underline">
          ログイン
        </Link>
      </div>
    </div>
  );
}