import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Checkout, CO0, type CoState } from "../checkout/Checkout";
import { TEST_NUMBER } from "../checkout/data";
import { motion, usePrefersReducedMotion } from "../checkout/motion";
import { Backdrop } from "./Backdrop";

type Format = "4x5" | "9x16";
const W = 1000, H = 760;
const FORMATS: Record<Format, { w: number; h: number; logoTop: number; logoW: number; titleTop: number; titleSize: number; subTop: number; dashTop: number; dashW: number; tagTop: number }> = {
  "4x5": { w: 720, h: 900, logoTop: 34, logoW: 132, titleTop: 78, titleSize: 44, subTop: 140, dashTop: 196, dashW: 684, tagTop: 740 },
  "9x16": { w: 720, h: 1280, logoTop: 128, logoW: 170, titleTop: 196, titleSize: 54, subTop: 272, dashTop: 356, dashW: 684, tagTop: 912 },
};
const LOOP = 12;
type Pose = "formular" | "cvv" | "hotovo";

declare global {
  interface Window {
    __demo?: { duration: number; ready: boolean; step: (dt: number) => void; pose: (name: Pose) => void };
  }
}

export function DemoStage() {
  const params = new URLSearchParams(window.location.search);
  const format: Format = params.get("format") === "9x16" ? "9x16" : "4x5";
  const record = params.get("record") === "1";
  const caption = params.get("caption") !== "0";
  const reduced = usePrefersReducedMotion() && params.get("force") !== "1";
  motion.reduced = reduced;
  const F = FORMATS[format];
  const k = F.dashW / W;

  const [s, setS] = useState<CoState>(CO0);
  const set = (p: Partial<CoState>) => setS((o) => ({ ...o, ...p }));
  const [scale, setScale] = useState(1);
  const boxRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const rippleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / F.w, window.innerHeight / F.h));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [F.w, F.h]);

  useEffect(() => {
    if (reduced) return; // statický stav, žádná smyčka
    const box = boxRef.current!, cursor = cursorRef.current!, ripple = rippleRef.current!;
    const outer = () => box.getBoundingClientRect().width / F.w;
    const at = (sel: string, fx = 0.5, fy = 0.5) => () => {
      const el = box.querySelector<HTMLElement>(`[data-demo-id="${sel}"]`);
      if (!el) return { x: F.w * 0.8, y: F.h * 0.8 };
      const b = box.getBoundingClientRect(), r = el.getBoundingClientRect(), o = outer();
      return { x: (r.left - b.left + r.width * fx) / o, y: (r.top - b.top + r.height * fy) / o };
    };
    const rest = () => ({ x: F.w * 0.8, y: F.dashTop + H * k * 0.86 });

    const tl = gsap.timeline({ repeat: record ? 0 : -1, paused: true });
    const ctx = gsap.context(() => {
      const move = (t: number, dur: number, target: () => { x: number; y: number }) =>
        tl.to(cursor, { x: () => target().x, y: () => target().y, duration: dur, ease: "power2.inOut" }, t);
      const click = (t: number, action: () => void) => {
        tl.to(cursor, { scale: 0.8, duration: 0.08, ease: "power2.out", yoyo: true, repeat: 1 }, t);
        tl.fromTo(ripple, { x: () => gsap.getProperty(cursor, "x") as number, y: () => gsap.getProperty(cursor, "y") as number, scale: 0.2, opacity: 0.85 },
          { scale: 1.6, opacity: 0, duration: 0.45, ease: "power2.out" }, t);
        tl.call(action, [], t + 0.08);
      };
      const hover = (t: number, id: string | null) => tl.call(() => set({ hover: id }), [], t);
      const type = (t: number, step: number, text: string, key: "num" | "cvv") => {
        for (let i = 1; i <= text.length; i++) tl.call(() => set({ [key]: text.slice(0, i) } as Partial<CoState>), [], t + i * step);
      };

      tl.call(() => setS(CO0), [], 0);
      tl.set(cursor, { x: () => rest().x, y: () => rest().y, scale: 1 }, 0);
      tl.set(ripple, { opacity: 0 }, 0);

      // 1) číslo karty se propisuje na kartu
      move(0.1, 0.45, at("num", 0.35)); hover(0.45, "num"); click(0.55, () => set({ field: "num", hover: null }));
      type(0.62, 0.065, TEST_NUMBER, "num");
      // 2) barva karty
      move(1.75, 0.4, at("sw-pink")); hover(2.05, "sw-pink"); click(2.15, () => set({ color: "pink", field: null }));
      move(2.35, 0.22, at("sw-teal")); hover(2.5, "sw-teal"); click(2.6, () => set({ color: "teal" }));
      // 3) CVV - karta se otočí
      move(2.8, 0.4, at("cvv", 0.4)); hover(3.12, "cvv"); click(3.2, () => set({ field: "cvv", flipped: true, hover: null }));
      type(3.35, 0.13, "123", "cvv");
      // 4) množství - součty se přepočítají
      move(3.95, 0.45, at("plus-0")); hover(4.3, "plus-0"); click(4.4, () => set({ qty: [2, 1, 2], field: null, flipped: false }));
      // 5) zaplatit -> karta letí doprostřed -> úspěch
      hover(4.75, null);
      move(4.75, 0.45, at("pay", 0.6)); hover(5.1, "pay"); click(5.25, () => set({ phase: "loading", hover: null }));
      move(5.6, 0.7, () => ({ x: F.w * 0.86, y: F.dashTop + H * k * 0.7 }));
      // 6) nová platba - vše se vrátí do výchozího stavu (plynulá smyčka)
      move(9.3, 0.55, at("again")); hover(9.75, "again"); click(9.9, () => setS({ ...CO0 }));
      move(10.4, 0.9, rest);
      tl.set({}, {}, LOOP);

      tl.to(box.querySelector(".bd-blob--teal"), { x: 60, y: 30, duration: LOOP / 2, ease: "sine.inOut", yoyo: true, repeat: 1 }, 0);
      tl.to(box.querySelector(".bd-blob--violet"), { x: -50, y: -40, duration: LOOP / 2, ease: "sine.inOut", yoyo: true, repeat: 1 }, 0);
      tl.to(box.querySelector(".bd-blob--azure"), { x: -30, y: 50, duration: LOOP / 2, ease: "sine.inOut", yoyo: true, repeat: 1 }, 0);
      tl.to(box.querySelector(".bd-blob--pink"), { x: 40, y: -30, duration: LOOP / 2, ease: "sine.inOut", yoyo: true, repeat: 1 }, 0);
    }, box);

    let manual = 0;
    const start = () => {
      if (record) {
        gsap.ticker.remove(gsap.updateRoot);
        manual = gsap.ticker.time;
        gsap.updateRoot(manual);
      }
      tl.play(0);
      tl.time(0.001);
      window.__demo = {
        duration: tl.duration(),
        ready: true,
        step: (dt) => { manual += dt; gsap.updateRoot(manual); },
        pose: (name) => {
          tl.pause();
          gsap.set(cursor, { opacity: 0 });
          if (name === "formular") setS({ ...CO0, num: TEST_NUMBER, color: "pink", field: "num", hover: "pay" });
          if (name === "cvv") setS({ ...CO0, num: TEST_NUMBER, color: "teal", cvv: "123", field: "cvv", flipped: true, qty: [2, 1, 2] });
          if (name === "hotovo") setS({ ...CO0, num: TEST_NUMBER, color: "teal", qty: [2, 1, 2], phase: "success" });
        },
      };
    };
    document.fonts.ready.then(() => requestAnimationFrame(start));
    return () => { ctx.revert(); tl.kill(); if (record) gsap.ticker.add(gsap.updateRoot); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [format, record, reduced]);

  return (
    <div className="demo-viewport">
      <div ref={boxRef} className={`demo-box demo-box--${format}`} style={{ width: F.w, height: F.h, transform: `translate(-50%, -50%) scale(${scale})` }}>
        <Backdrop showGhost={false} />
        {caption && (
          <>
            <img className="demo-logo" src="/napojeno-logo.png" alt="NAPOJENO" style={{ top: F.logoTop, width: F.logoW }} />
            <h1 className="demo-title" style={{ top: F.titleTop, fontSize: F.titleSize }}>Skleněná pokladna</h1>
            <p className="demo-sub" style={{ top: F.subTop }}>Karta, souhrn a platba v jednom plynulém kroku</p>
          </>
        )}
        <div className="demo-dash" style={{ top: caption ? F.dashTop : (F.h - H * k) / 2, left: (F.w - F.dashW) / 2, width: W, height: H, transform: `scale(${k})` }}>
          <Checkout s={s} set={set} />
        </div>
        {caption && (
          <p className="demo-tagline" style={{ top: F.tagTop }}>
            Klikací demo <span>ukázková data · napojeno.cz</span>
          </p>
        )}
        <div ref={rippleRef} className="demo-ripple" aria-hidden="true" />
        <div ref={cursorRef} className="demo-cursor" aria-hidden="true" style={{ opacity: reduced ? 0 : 1 }}>
          <svg width="22" height="26" viewBox="0 0 22 26"><path d="M2 1.5v19.2l5.1-4.6 3.3 7.6 3.6-1.6-3.3-7.4 6.9-.4z" fill="#fff" stroke="#11142e" strokeWidth="1.6" strokeLinejoin="round" /></svg>
        </div>
      </div>
    </div>
  );
}
