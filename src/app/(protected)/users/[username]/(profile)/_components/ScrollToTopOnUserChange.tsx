"use client";

import { UserProfileItem } from "@/features/user/types/user.types";
import { useEffect } from "react";

type Props = {
  user: UserProfileItem;
};

export default function ScrollToTopOnUserChange({ user }: Props) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [user.username]);

  return null;
}