"use client";

import { useEffect } from "react";

const HIDDEN_OPACITY = "0";
const VISIBLE_OPACITY = "1";

function hideMain(main: HTMLElement) {
  main.style.setProperty("--grid-glow-opacity", HIDDEN_OPACITY);
}

function hideAllMains() {
  document.querySelectorAll<HTMLElement>("main").forEach(hideMain);
}

export function GridCursorGlow() {
  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const activeMain =
        event.target instanceof Element ? event.target.closest("main") : null;

      document.querySelectorAll<HTMLElement>("main").forEach((main) => {
        if (main !== activeMain) {
          hideMain(main);
          return;
        }

        const rect = main.getBoundingClientRect();

        main.style.setProperty("--grid-glow-x", `${event.clientX - rect.left}px`);
        main.style.setProperty("--grid-glow-y", `${event.clientY - rect.top}px`);
        main.style.setProperty("--grid-glow-opacity", VISIBLE_OPACITY);
      });
    };

    const handlePointerLeave = () => {
      hideAllMains();
    };

    document.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    document.documentElement.addEventListener(
      "pointerleave",
      handlePointerLeave,
    );
    window.addEventListener("blur", handlePointerLeave);

    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener(
        "pointerleave",
        handlePointerLeave,
      );
      window.removeEventListener("blur", handlePointerLeave);
      hideAllMains();
    };
  }, []);

  return null;
}
