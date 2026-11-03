import { useLayoutEffect, useRef, type MutableRefObject } from "react";
import gsap from "gsap";
import { I } from "./icons";
import { D } from "./motion";
import { COLORS, HOLDER, ITEMS, QTY0, SUCCESS_BG, groupNum, kc, totals, type ColorId } from "./data";

export type Phase = "form" | "loading" | "paying" | "success";
export type CoState = {
  num: string; cvv: string; exp: string; flipped: boolean; color: ColorId; qty: number[];
  save: boolean; phase: Phase; hover: string | null; field: string | null;
};
export const CO0: CoState = { num: "", cvv: "", exp: "12/28", flipped: false, color: "violet", qty: QTY0, save: true, phase: "form", hover: null, field: null };

const TILE = ["linear-gradient(135deg,#ffe27a,#ffb84d)", "linear-gradient(135deg,#c9c1b2,#8f99b8)", "linear-gradient(135deg,#a1e9d4,#1a9b8a)"];

export function Checkout({ s, set, numRef }: { s: CoState; set: (p: Partial<CoState>) => void; numRef?: MutableRefObject<HTMLInputElement | null> }) {
  const root = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  const t = totals(s.qty);
  const shown = useRef({ total: t.total, sub: t.sub, disc: t.disc });
  const h = (id: string) => (s.hover === id ? " is-h" : "");
  const busy = s.phase !== "form";

  // počítadla součtů
  useLayoutEffect(() => {
    const el = root.current!;
    const o = shown.current;
    const write = () => {
      el.querySelector(".js-sub")!.textContent = kc(o.sub);
      el.querySelector(".js-disc")!.textContent = "−" + kc(o.disc);
      el.querySelectorAll(".js-total").forEach((n) => (n.textContent = kc(o.total)));
    };
    const tw = gsap.to(o, { total: t.total, sub: t.sub, disc: t.disc, duration: D(0.6), ease: "power2.out", onUpdate: write, onComplete: write });
    write();
    return () => { tw.kill(); };
  }, [t.total, t.sub, t.disc]);

  // otočení karty
  useLayoutEffect(() => {
    const tw = gsap.to(root.current!.querySelector(".cc-inner"), { rotationY: s.flipped && s.phase === "form" ? 180 : 0, duration: D(0.7), ease: "back.out(1.2)" });
    return () => { tw.kill(); };
  }, [s.flipped, s.phase]);

  // barva karty
  useLayoutEffect(() => {
    const el = root.current!;
    const tws = (Object.keys(COLORS) as ColorId[]).map((c) =>
      gsap.to(el.querySelectorAll(`.cc-skin--${c}`), { opacity: c === s.color ? 1 : 0, duration: D(0.45), ease: "power1.inOut" }));
    tws.push(gsap.to(el.querySelector(".co-swpill"), { x: (Object.keys(COLORS) as ColorId[]).indexOf(s.color) * 26, duration: D(0.4), ease: "back.out(1.6)" }));
    return () => tws.forEach((x) => x.kill());
  }, [s.color]);

  // přepínač "uložit kartu"
  useLayoutEffect(() => {
    const el = root.current!;
    const a = gsap.to(el.querySelector(".tg-knob"), { x: s.save ? 18 : 0, duration: D(0.3), ease: "back.out(1.8)" });
    const b = gsap.to(el.querySelector(".tg-fill"), { opacity: s.save ? 1 : 0, duration: D(0.3) });
    return () => { a.kill(); b.kill(); };
  }, [s.save]);

  // fáze platby
  useLayoutEffect(() => {
    const el = root.current!;
    const q = (sel: string) => el.querySelectorAll(sel);
    const center = s.phase === "paying" || s.phase === "success";
    const ok = s.phase === "success";
    const card = el.querySelector<HTMLElement>(".cc")!;
    const panel = el.querySelector<HTMLElement>(".co-panel")!;
    // posun karty doprostřed panelu (v rozvržení bez měřítka)
    let dx = 0, dy = 0;
    if (center) {
      let x = 0, y = 0, n: HTMLElement | null = card;
      while (n && n !== panel) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent as HTMLElement | null; }
      dx = panel.offsetWidth / 2 - (x + card.offsetWidth / 2);
      dy = 250 - (y + card.offsetHeight / 2);
    }
    const tl = gsap.timeline();
    const d = first.current ? 0 : 1;
    first.current = false;
    tl.to(q(".js-blur"), { filter: center ? "blur(14px)" : "blur(0px)", opacity: center ? 0.18 : 1, scale: center ? 0.97 : 1, duration: D(0.7) * d, ease: "power2.inOut", stagger: center ? 0.05 : 0 }, 0);
    tl.to(card, { x: dx, y: dy, scale: center ? 1.3 : 1, duration: D(0.9) * d, ease: center ? "expo.inOut" : "power3.inOut" }, center ? 0.1 : 0);
    tl.to(q(".cc-skin--ok"), { opacity: ok ? 1 : 0, duration: D(0.5) * d }, 0);
    tl.to(q(".cc-glow"), { opacity: ok ? 1 : center ? 0.4 : 0, scale: ok ? 1 : 0.8, duration: D(0.6) * d }, 0);
    tl.to(q(".co-ring"), { opacity: s.phase === "paying" ? 1 : 0, duration: D(0.3) * d }, s.phase === "paying" ? 0.6 : 0);
    tl.to(q(".co-done"), { opacity: ok ? 1 : 0, y: ok ? 0 : 16, duration: D(0.5) * d, ease: "power2.out" }, ok ? 0.15 : 0);
    tl.to(q(".co-h-a"), { opacity: ok ? 0 : 1, y: ok ? -10 : 0, duration: D(0.4) * d }, 0);
    tl.to(q(".co-h-b"), { opacity: ok ? 1 : 0, y: ok ? 0 : 10, duration: D(0.4) * d }, ok ? 0.1 : 0);
    tl.to(q(".co-paid"), { opacity: ok ? 1 : 0, scale: ok ? 1 : 0.7, duration: D(0.4) * d, ease: "back.out(2)" }, 0);
    tl.to(q(".co-timer"), { opacity: ok ? 0 : 1, duration: D(0.3) * d }, 0);
    if (ok) tl.fromTo(q(".co-done-check path"), { strokeDashoffset: 30 }, { strokeDashoffset: 0, duration: D(0.5), ease: "power2.out" }, 0.25);
    // spinner v tlačítku a kruh kolem karty
    const spin = s.phase === "loading" || s.phase === "paying" ? gsap.to(q(".js-spin"), { rotation: "+=360", duration: 0.8, ease: "none", repeat: -1 }) : null;
    // automatický průběh platby
    const next = s.phase === "loading" ? gsap.delayedCall(0.8, () => set({ phase: "paying" })) : s.phase === "paying" ? gsap.delayedCall(1.3, () => set({ phase: "success" })) : null;
    return () => { tl.kill(); spin?.kill(); next?.kill(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.phase]);

  const typeNum = (v: string) => set({ num: v.replace(/\D/g, "").slice(0, 16) });
  const steps = ["Košík", "Doprava", "Platba", "Hotovo"];
  const stepAt = s.phase === "success" ? 3 : 2;

  return (
    <div className="co" ref={root}>
      <div className="orb" /><div className="orb orb--2" />
      {/* horní lišta */}
      <header className="co-top">
        <div className="co-brand"><span className="co-logo"><img src="/napojeno-znak.png" alt="" /></span><b>NAPOJENO</b><span>Pokladna</span></div>
        <div className="co-ticker">
          <span className="co-dot" />
          <span>{s.field ? "Údaje karty jsou šifrované end-to-end" : "Platba chráněná zárukou kupujícího"}</span>
        </div>
        <div className="co-status">
          <span className="co-timer">{I.clock({ size: 13 })} 14:59</span>
          <span className="co-paid">{I.check({ size: 13 })} Zaplaceno</span>
        </div>
        <button className={"co-bag" + h("bag")} aria-label="Košík">{I.bag({ size: 16 })}<i>{t.count}</i></button>
      </header>

      <main className="co-panel">
        <nav className="co-rail js-blur" aria-label="Kroky">
          <span className="is-on">{I.card({ size: 15 })}</span><span>{I.spark({ size: 15 })}</span><span>{I.trash({ size: 15 })}</span><span>{I.tag({ size: 15 })}</span>
        </nav>
        <div className="co-head">
          <div className="co-htxt">
            <h1 className="co-h-a">Dokončete objednávku</h1>
            <h1 className="co-h-b">Hotovo, zaplaceno</h1>
            <p className="muted">Ukázkový obchod · {t.count} položek · šifrováno</p>
          </div>
          <div className="co-hbtns js-blur">
            <span className="co-chip">{I.shield({ size: 13 })} Ochrana nákupu</span>
            <button className={"co-ghost" + h("back")}>{I.back({ size: 13 })} Zpět do košíku</button>
          </div>
        </div>

        {/* levý sloupec - karta */}
        <section className="co-left">
          <div className={"co-paywith js-blur" + h("swatch")}>
            <div><span className="muted">Platíte kartou</span><b>Ukázková karta {COLORS[s.color].label}</b></div>
            <div className="co-sw" role="radiogroup" aria-label="Barva karty">
              <span className="co-swpill" />
              {(Object.keys(COLORS) as ColorId[]).map((c) => (
                <button key={c} role="radio" aria-checked={s.color === c} aria-label={COLORS[c].label} data-demo-id={`sw-${c}`} className={"co-swb" + h(`sw-${c}`)} style={{ background: COLORS[c].bg }} onClick={() => set({ color: c })} disabled={busy} />
              ))}
            </div>
          </div>
          <span className="co-badge co-3ds js-blur">{I.shield({ size: 12 })} 3-D Secure</span>
          <div className="cc-stack js-blur"><span /><span /></div>
          <div className="cc" data-demo-id="card">
            <div className="cc-glow" />
            <div className="cc-inner">
              <div className="cc-face cc-front">
                {(Object.keys(COLORS) as ColorId[]).map((c) => <div key={c} className={`cc-skin cc-skin--${c}`} style={{ background: COLORS[c].bg }} />)}
                <div className="cc-skin cc-skin--ok" style={{ background: SUCCESS_BG }} />
                <div className="cc-shine" />
                <div className="cc-row"><span className="cc-chip" /><span className="cc-wave">{I.wave({ size: 15 })}</span><span className="cc-tier">Ukázka</span><b className="cc-brand">DEMO</b></div>
                <div className="cc-num">{groupNum(s.num)}</div>
                <div className="cc-row cc-foot"><div><small>Držitel</small><b>{HOLDER}</b></div><div className="cc-r"><small>Platnost</small><b>{s.exp}</b></div></div>
              </div>
              <div className="cc-face cc-back">
                {(Object.keys(COLORS) as ColorId[]).map((c) => <div key={c} className={`cc-skin cc-skin--${c}`} style={{ background: COLORS[c].bg }} />)}
                <div className="cc-strip" />
                <div className="cc-sig"><i>Ukázka</i><b>{(s.cvv || "").replace(/./g, "•").padEnd(3, "·")}</b></div>
                <p className="cc-fine">Ukázková karta pro demo. Nejde o skutečný platební prostředek.</p>
              </div>
            </div>
          </div>
          <span className="co-badge co-tap js-blur">{I.wave({ size: 12 })} Přiložit k platbě</span>
          <button className={"co-ghost co-flip js-blur" + h("flip")} data-demo-id="flip" onClick={() => set({ flipped: !s.flipped })} disabled={busy}>{I.flip({ size: 13 })} {s.flipped ? "Zobrazit přední stranu" : "Otočit na CVV"}</button>
          <div className="co-trust js-blur"><span>256bit SSL</span><span>PCI DSS</span></div>
        </section>

        {/* platební údaje */}
        <section className="co-form card js-blur">
          <div className="co-ch"><div><h2>Platební údaje</h2><p className="muted">Zadejte kartu a dokončete nákup</p></div><span className="co-chip co-chip--g">{I.spark({ size: 12 })} Automaticky</span></div>
          <label className="fl"><span className="lbl">Jméno držitele</span><span className="fi">{I.user({ size: 14 })}<input value={HOLDER} readOnly /></span></label>
          <label className="fl"><span className="lbl">Číslo karty</span>
            <span className={"fi" + (s.field === "num" ? " is-f" : "") + h("num")} data-demo-id="num">{I.card({ size: 14 })}
              <input ref={numRef} inputMode="numeric" placeholder="0000 0000 0000 0000" value={(s.num.match(/.{1,4}/g) ?? []).join(" ")} onChange={(e) => typeNum(e.target.value)} onFocus={() => set({ field: "num", flipped: false })} onBlur={() => set({ field: null })} disabled={busy} />
              <em>DEMO</em></span></label>
          <div className="fl2">
            <label className="fl"><span className="lbl">Platnost</span><span className="fi">{I.cal({ size: 14 })}<input value={s.exp} onChange={(e) => set({ exp: e.target.value.slice(0, 5) })} disabled={busy} /></span></label>
            <label className="fl"><span className="lbl">CVV</span>
              <span className={"fi" + (s.field === "cvv" ? " is-f" : "") + h("cvv")} data-demo-id="cvv">{I.lock({ size: 14 })}
                <input type="password" inputMode="numeric" placeholder="•••" value={s.cvv} onChange={(e) => set({ cvv: e.target.value.replace(/\D/g, "").slice(0, 3) })} onFocus={() => set({ field: "cvv", flipped: true })} onBlur={() => set({ field: null, flipped: false })} disabled={busy} />
                {I.eye({ size: 14 })}</span></label>
          </div>
          <button className={"co-save" + h("save")} data-demo-id="save" role="switch" aria-checked={s.save} onClick={() => set({ save: !s.save })} disabled={busy}>
            <span className="tg"><span className="tg-fill" /><span className="tg-knob" /></span>
            <span><b>Uložit kartu pro příště</b><span className="muted">Uloženo jako šifrovaný token</span></span>
          </button>
          <button className={"co-pay" + h("pay")} data-demo-id="pay" onClick={() => s.phase === "form" && set({ phase: "loading", field: null, flipped: false })} disabled={busy}>
            <span className="co-pay-l">{s.phase === "form" ? I.lock({ size: 14 }) : <span className="js-spin co-spin" />}</span>
            <span>{s.phase === "form" ? <>Zaplatit <span className="js-total" /></> : "Zpracovávám…"}</span>
            <span className="co-pay-r">{I.arrow({ size: 14 })}</span>
          </button>
        </section>

        {/* souhrn objednávky */}
        <section className="co-sum card js-blur">
          <div className="co-ch"><div><h2>Souhrn objednávky</h2><p className="muted">Ukázkový obchod · demo</p></div><span className="co-chip">{t.count} ks</span></div>
          {ITEMS.map((it, i) => (
            <div className="it" key={it.id}>
              <span className="it-img" style={{ background: TILE[i] }}>{I.bag({ size: 15 })}</span>
              <div className="it-t"><b>{it.name}</b><span className="muted">{it.meta}</span><b className="it-p">{kc(it.price)}</b></div>
              <div className="it-q">
                <button aria-label="Méně" className={h(`minus-${i}`).trim()} onClick={() => set({ qty: s.qty.map((q, j) => (j === i ? Math.max(1, q - 1) : q)) })} disabled={busy}>{I.minus({ size: 12 })}</button>
                <span>{s.qty[i]}</span>
                <button aria-label="Více" data-demo-id={`plus-${i}`} className={h(`plus-${i}`).trim()} onClick={() => set({ qty: s.qty.map((q, j) => (j === i ? Math.min(9, q + 1) : q)) })} disabled={busy}>{I.plus({ size: 12 })}</button>
              </div>
            </div>
          ))}
          <div className="co-promo"><span>{I.tag({ size: 13 })} UKAZKA10</span><em>−10 %</em></div>
          <dl className="co-tot">
            <div><dt>Mezisoučet</dt><dd className="js-sub" /></div>
            <div><dt>Sleva</dt><dd className="js-disc pos" /></div>
            <div><dt>Doprava</dt><dd><span className="co-free">Zdarma</span></dd></div>
            <div className="co-total"><dt>Celkem s DPH</dt><dd className="js-total" /></div>
          </dl>
          <div className="co-ship">{I.truck({ size: 15 })}<span><b>Doručení do 2 dnů</b><span className="muted">Ukázkový termín · 30 dní na vrácení</span></span></div>
        </section>

        {/* stav platby */}
        <div className="co-ring" aria-hidden="true"><span className="js-spin" /></div>
        <div className={"co-done" + (s.phase === "success" ? " is-on" : "")} role="status">
          <span className="co-done-check"><svg viewBox="0 0 24 24" width="22" height="22"><path d="m5 12.5 4.5 4.5L19 7" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="30" /></svg></span>
          <h2>Platba proběhla</h2>
          <p className="muted">Ukázková platba <b className="js-total" /> byla bezpečně zpracována.</p>
          <button className={"co-again" + h("again")} data-demo-id="again" onClick={() => set({ ...CO0 })} tabIndex={s.phase === "success" ? 0 : -1}>Nová ukázková platba</button>
        </div>
      </main>

      <nav className="co-steps" aria-label="Průběh nákupu">
        {steps.map((x, i) => (
          <span key={x} className={"st" + (i < stepAt ? " is-ok" : i === stepAt ? " is-cur" : "")}>
            {i < stepAt && I.check({ size: 12 })}{x}
          </span>
        ))}
        <span className="st-shield">{I.shield({ size: 14 })}</span>
      </nav>
    </div>
  );
}
