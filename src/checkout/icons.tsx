import type { ReactNode } from "react";
const S = ({ children, size = 16 }: { children: ReactNode; size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{children}</svg>
);
type P = { size?: number };
export const I = {
  card: (p?: P) => <S {...p}><rect x="3" y="5.5" width="18" height="13" rx="2.5" /><path d="M3 10h18M7 15h3" /></S>,
  lock: (p?: P) => <S {...p}><rect x="5" y="10.5" width="14" height="10" rx="2.5" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></S>,
  shield: (p?: P) => <S {...p}><path d="M12 3 5 6v5.5c0 4.3 3 7.8 7 9.5 4-1.7 7-5.2 7-9.5V6z" /><path d="m9 12 2.2 2.2L15.5 10" /></S>,
  truck: (p?: P) => <S {...p}><path d="M3 6.5h11v10H3zM14 10h4l3 3.2v3.3h-7" /><circle cx="7" cy="17.5" r="1.8" /><circle cx="17.5" cy="17.5" r="1.8" /></S>,
  tag: (p?: P) => <S {...p}><path d="M3.5 12.5V4h8.5l8.5 8.5-8.5 8.5z" /><circle cx="8" cy="8.5" r="1.4" /></S>,
  plus: (p?: P) => <S {...p}><path d="M12 5v14M5 12h14" /></S>,
  minus: (p?: P) => <S {...p}><path d="M5 12h14" /></S>,
  arrow: (p?: P) => <S {...p}><path d="M5 12h14M13 6l6 6-6 6" /></S>,
  back: (p?: P) => <S {...p}><path d="M19 12H5M11 6l-6 6 6 6" /></S>,
  check: (p?: P) => <S {...p}><path d="m5 12.5 4.5 4.5L19 7" /></S>,
  bag: (p?: P) => <S {...p}><path d="M5 8h14l-1 12.5H6z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></S>,
  spark: (p?: P) => <S {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" /></S>,
  wave: (p?: P) => <S {...p}><path d="M8 8.5a5 5 0 0 1 0 7M11.5 6a8.5 8.5 0 0 1 0 12M15 4a11 11 0 0 1 0 16" /></S>,
  user: (p?: P) => <S {...p}><circle cx="12" cy="8" r="3.8" /><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" /></S>,
  cal: (p?: P) => <S {...p}><rect x="3.5" y="5" width="17" height="15" rx="2.5" /><path d="M3.5 10h17M8 3v4M16 3v4" /></S>,
  eye: (p?: P) => <S {...p}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="2.8" /></S>,
  clock: (p?: P) => <S {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></S>,
  flip: (p?: P) => <S {...p}><path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3" /><path d="M18 3v4h-4M6 21v-4h4" /></S>,
  trash: (p?: P) => <S {...p}><path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13" /></S>,
};
