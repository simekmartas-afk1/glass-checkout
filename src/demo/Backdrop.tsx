import type { CSSProperties } from "react";

/**
 * Tmavé abstraktní pozadí za sklem: rozmazané skvrny v barvách brandu
 * a jemné obrysy "dashboardu" (bez čísel), aby bylo vidět, co sklo rozmazává.
 */
export function Backdrop({ showGhost = true, ghostStyle }: { showGhost?: boolean; ghostStyle?: CSSProperties }) {
  return (
    <div className="bd" aria-hidden="true">
      <div className="bd-blob bd-blob--teal" />
      <div className="bd-blob bd-blob--azure" />
      <div className="bd-blob bd-blob--violet" />
      <div className="bd-blob bd-blob--pink" />
      {showGhost && (
        <div className="bd-ghost" style={ghostStyle}>
          <div className="bd-card bd-card--wide">
            <span className="bd-bar" />
            <svg viewBox="0 0 300 90" preserveAspectRatio="none">
              <defs>
                <linearGradient id="bd-line" x1="0" x2="1">
                  <stop offset="0" stopColor="#00D2CF" />
                  <stop offset="0.5" stopColor="#2F8CFE" />
                  <stop offset="1" stopColor="#6C39FF" />
                </linearGradient>
              </defs>
              <path
                d="M0 70 C 30 64, 50 40, 80 46 S 130 70, 160 50 S 210 18, 240 28 S 280 20, 300 10"
                fill="none"
                stroke="url(#bd-line)"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="bd-card bd-card--a"><span className="bd-bar" /><span className="bd-chip" /></div>
          <div className="bd-card bd-card--b"><span className="bd-bar" /><span className="bd-chip" /></div>
          <div className="bd-card bd-card--c"><span className="bd-bar bd-bar--wide" /></div>
        </div>
      )}
      <div className="bd-grain" />
    </div>
  );
}
