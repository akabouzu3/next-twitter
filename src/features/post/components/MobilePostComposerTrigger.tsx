"use client";

import * as React from "react";
import { CurrentUser } from "@/lib/auth/current-user";
import PostComposerTrigger from "@/features/post/components/PostComposerTrigger";
import { LayerPortal } from "@/components/layer/LayerPortal";

type Props = {
  currentUser: CurrentUser | null;
  className?: string;
};

export function MobilePostComposerTrigger({
  currentUser, 
  className,
}: Props) {

  if (!currentUser) return null;

  return (
    <LayerPortal>
      <div className="md:hidden fixed bottom-20 right-6 z-20">
        <PostComposerTrigger currentUser={currentUser} className={className} />
      </div>

    </LayerPortal>
  );
}