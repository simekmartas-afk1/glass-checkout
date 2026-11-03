# NAPOJENO - Skleněná pokladna

Klikací demo platební pokladny ve skleněném designu NAPOJENO. Inspirace: reel „Glassy Payment Checkout V2“. **Všechna data jsou ukázková** - „Ukázkový obchod“, „Ukázkový zákazník“, veřejné testovací číslo karty 4242 4242 4242 4242, nejde o skutečné klienty, produkty ani platby.

## Co umí
- **Karta naživo** - číslo karty se při psaní propisuje na kartu, výběr barvy karty (plynulé přelití přechodu), otočení na zadní stranu při psaní CVV (3D flip).
- **Souhrn objednávky** - změna množství přepočítá mezisoučet, slevu a celkovou částku s animovaným počítadlem.
- **Platba** - tlačítko se spinnerem, formulář a souhrn se rozmažou, karta odletí doprostřed, spinner, pak zezelená a objeví se „Platba proběhla“ s animovanou fajfkou. Horní lišta i kroky (Košík -> Doprava -> Platba -> Hotovo) se přepnou.
- „Nová ukázková platba“ vrátí vše do výchozího stavu.
- Respektuje `prefers-reduced-motion` (bez animací, demo smyčka se nespustí).

## Spuštění
```bash
npm install
npm run dev          # klikací demo
# /?demo=1                 - smyčka 4:5
# /?demo=1&format=9x16     - smyčka 9:16
# &caption=0               - bez titulku
npm run record -- --out ./out   # MP4 (4:5, 9:16) + 3 PNG
```

Stack: React 18, Vite 5, TypeScript, GSAP. Nahrávání: Playwright (deviceScaleFactor 2) snímek po snímku přes ruční GSAP ticker + ffmpeg (H.264, yuv420p, bt709, 30 fps, faststart).
