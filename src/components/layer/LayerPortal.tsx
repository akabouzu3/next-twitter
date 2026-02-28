// src/components/layer/LayerPortal.tsx
"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

export function LayerPortal({ children }: { children: React.ReactNode }) {
  const [root, setRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setRoot(document.getElementById("layers"));
  }, []);

  if (!root) return null;
  return createPortal(children, root);
}
