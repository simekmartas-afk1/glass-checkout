import { useEffect, useState } from "react";
import { Checkout, CO0, type CoState } from "./checkout/Checkout";
import { motion, usePrefersReducedMotion } from "./checkout/motion";
import { Backdrop } from "./demo/Backdrop";
import { DemoStage } from "./demo/DemoStage";

export default function App() {
  const isDemo = new URLSearchParams(window.location.search).get("demo") === "1";
  const reduced = usePrefersReducedMotion();
  motion.reduced = reduced && !isDemo;
  const [s, setS] = useState<CoState>(CO0);
  const [fit, setFit] = useState(1);
  useEffect(() => {
    if (isDemo) return;
    const f = () => setFit(Math.min(1, (window.innerWidth - 32) / 1000, (window.innerHeight - 32) / 760));
    f();
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, [isDemo]);
  if (isDemo) return <DemoStage />;
  return (
    <div className="page">
      <Backdrop showGhost={false} />
      <div className="page-dash" style={{ transform: `translate(-50%, -50%) scale(${fit})` }}>
        <Checkout s={s} set={(p) => setS((o) => ({ ...o, ...p }))} />
      </div>
      <a className="page-demo" href="?demo=1">Spustit demo smyčku</a>
    </div>
  );
}
