import { Metadata } from "next";
import Home from "@/components/layout/Home";

export const metadata: Metadata = {
  title: "「いま」を見つけよう"
};

export default function HomePage() {
  return (
    <>
      <Home/>
    </>
  )
}
