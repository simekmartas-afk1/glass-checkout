import { useEffect, useState } from "react";
/** Globální přepínač - při prefers-reduced-motion jsou všechny délky animací 0. */
export const motion = { reduced: false };
export const D = (s: number) => (motion.reduced ? 0 : s);
export function usePrefersReducedMotion() {
  const q = "(prefers-reduced-motion: reduce)";
  const [r, setR] = useState(() => typeof window !== "undefined" && window.matchMedia(q).matches);
  useEffect(() => {
    const m = window.matchMedia(q);
    const on = () => setR(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return r;
}

