import HomeBody from "./HomeBody";
import KLogo from "@/components/icons/KLogo";
 
export default function Home() {
  return (
  <div className="min-h-dvh bg-black text-white">
    {/* mobile */}
    <div className="flex md:hidden flex-col px-10">
      {/*header */}
      <div className="py-4">
        <div className="w-16 h-16">
          <KLogo />
        </div>
      </div>

      {/*body */}
      <div className="flex flex-col items-start">
        <div className="py-8">
          <span className="text-5xl font-bold tracking-tight">
            すべての話題が、ここに。
          </span>
        </div>
        <div>
          <span className="text-2xl font-bold tracking-wide">
            今すぐ参加しましょう。
            </span>
        </div>
        <div className="w-full max-w-sm py-6">
          <HomeBody/>

        </div>

      </div>

    </div>


    {/* md以上 */}
    <div className="hidden md:flex mx-auto max-w-6xl min-h-dvh justify-center items-center px-10">
      {/* 左: 巨大X */}
      <div className="flex-1 flex items-center justify-center p-8">
        <KLogo/>
      </div>

      {/* 右: コピー（画像にある雰囲気） */}
      <div className="flex flex-col items-start p-8">
        <div className="">
          <span className="text-6xl font-bold tracking-tight">
            すべての話題が、ここに。
          </span>
        </div>
        <div className="py-4">
          <span className="text-3xl font-bold tracking-wide">
            今すぐ参加しましょう。
          </span>
        </div>
        <div className="max-w-sm py-4">
          <HomeBody/>
        </div>
      </div>
    </div>
  </div>
  )
}
