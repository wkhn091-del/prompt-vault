"use client";

import { useEffect } from "react";

export function NvHomeMount() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("nv-home");
    root.style.setProperty("--stage", "#ebe1d7");
    root.style.setProperty("--ink", "#fff");
    root.style.setProperty("--band", "#0b0b0c");
    return () => {
      root.classList.remove("nv-home");
    };
  }, []);
  return null;
}
