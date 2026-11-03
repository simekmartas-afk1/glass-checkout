// Vše jsou UKÁZKOVÁ data - žádní skuteční zákazníci ani produkty.
export const ITEMS = [
  { id: "lampa", name: "Ukázková lampa", meta: "Varianta A · bílá", price: 1290, emoji: "💡" },
  { id: "taburet", name: "Ukázkový taburet", meta: "Varianta B · šedý", price: 1690, emoji: "🪑" },
  { id: "kvetinac", name: "Ukázkový květináč", meta: "Varianta C · keramika", price: 249, emoji: "🪴" },
] as const;
export const QTY0 = [1, 1, 2];
export const DISCOUNT = 0.1; // kód UKAZKA10
export const TEST_NUMBER = "4242424242424242"; // veřejné testovací číslo karty
export const HOLDER = "UKÁZKOVÝ ZÁKAZNÍK";

export const COLORS = {
  violet: { label: "Fialová", bg: "linear-gradient(135deg, #00d2cf 0%, #2f8cfe 50%, #6c39ff 100%)" },
  pink: { label: "Korálová", bg: "linear-gradient(135deg, #ff6fbf 0%, #ff9f5f 55%, #ffb84d 100%)" },
  teal: { label: "Mátová", bg: "linear-gradient(135deg, #1a9b8a 0%, #00d2cf 55%, #a1e9d4 100%)" },
  azure: { label: "Nebeská", bg: "linear-gradient(135deg, #2f8cfe 0%, #6bc5ff 60%, #7fd3ff 100%)" },
} as const;
export type ColorId = keyof typeof COLORS;
export const SUCCESS_BG = "linear-gradient(135deg, #0f8a5f 0%, #22c55e 55%, #a1e9d4 100%)";

export const kc = (n: number) => `${Math.round(n).toLocaleString("cs-CZ").replace(/\u00a0/g, " ")} Kč`;
export const totals = (qty: number[]) => {
  const sub = ITEMS.reduce((a, it, i) => a + it.price * qty[i], 0);
  const disc = Math.round(sub * DISCOUNT);
  return { sub, disc, total: sub - disc, count: qty.reduce((a, b) => a + b, 0) };
};
export const groupNum = (n: string) => (n.padEnd(16, "•").match(/.{1,4}/g) ?? []).join("  ");
