"use client";

import { useEffect } from "react";

type Props = {
  username: string;
};

export default function ScrollToTopOnUserChange({ username }: Props) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [username]);

  return null;
}