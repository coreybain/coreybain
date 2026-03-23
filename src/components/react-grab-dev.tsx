"use client";

import { useEffect } from "react";

export function ReactGrabDev() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    void import("react-grab");
    void import("@react-grab/codex/client");
  }, []);

  return null;
}
