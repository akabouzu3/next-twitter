
import Link from 'next/link'
import { Button } from "@/components/ui/button";
// import { Apple } from "lucide-react"


import { googleLoginAction } from '@/features/auth/actions/googleLogin'

export default function HomeBody
() {
  return (
    <div>
      <div className="flex flex-col gap-y-3">
        {/* Google */}
        <form action={googleLoginAction}>
          <Button
            type="submit"
            variant="secondary"
            className="w-full rounded-full h-11 bg-white text-black hover:bg-white/90 cursor-pointer"
          >
            <span className="mr-2">G</span>
            Googleのアカウントで登録
          </Button>
        </form>

        {/* Apple */}
        {/* <Button
          type="button"
          variant="secondary"
          className="w-full rounded-full h-11 bg-white text-black hover:bg-white/90 cursor-pointer"
          disabled
        >
          <span className="mr-2"><Apple className="fill-black" /></span>
          Appleのアカウントでログイン
        </Button> */}
      </div>

      {/* divider */}
      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-white/20" />
        <div className="text-sm text-white/70">または</div>
        <div className="h-px flex-1 bg-white/20" />
      </div>

      {/* link */}
     <Link href="/signup">
        <Button
            type="button"
            className="w-full rounded-full h-11 bg-white text-black hover:bg-white/90 cursor-pointer"
          >
          アカウントを作成
        </Button>
      </Link>
      
      <div className="text-white/60 text-xs py-4">
        アカウントを登録することにより、利用規約とプライバシーポリシー（Cookieの使用を含む）に同意したとみなされます。
      </div>

      <div className="flex flex-col py-8">
        <div className="py-4">
          <span>アカウントをお持ちの場合</span>
        </div>
        <Link href="/login">
          <Button
              type="button"
              className="w-full rounded-full border border-white/60  h-11 bg-black text-white hover:bg-black/90 cursor-pointer"
            >
            ログイン
          </Button>
        </Link>
      </div>


    </div>
  )
}
