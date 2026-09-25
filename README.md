# Mon Calendar · ကြက္ကဒိန်မန်

A modern, installable Progressive Web App that displays the traditional **Mon / Myanmar calendar** side by side with the Gregorian calendar. Built with a clean, paper-white "Editorial Ledger" design where the calendar grid remains the visual anchor.

## Features

- **Bilingual day views** – Gregorian dates paired with Myanmar calendar dates (year, month, fortnight day)
- **Moon phase indicators** – Waxing ◐, Full moon ●, Waning ◑, New moon ○
- **Sabbath tracking** – flags Sabbath and Sabbath eve days
- **Holiday catalog** – Thingyan (တ္ၚဲအတး), Myanmar New Year, public holidays, full-moon festivals, and Mon commemorations (Mon Revolution Day on the Wagaung full moon, Mon State Day, Mon National & Youth Days) in both Mon and Myanmar, ported from [conkyi/moncalendar](https://conkyi.github.io/moncalendar/) (`ceMmDateTime.js`)
- **Verified 2026–2027 closures** – date-specific public-holiday data sourced from Myanmar government and official mission listings, kept distinct from calculated religious and cultural observances
- **Clear event provenance** – public holidays, Mon cultural dates, religious festivals, and general observances use separate markers and identify whether a date is officially listed or calculated
- **Mon cultural events & daily statuses** per date
- **Mon language UI** – Mon weekday names and Mon numerals throughout
- **Month navigation** – prev/next arrows, month picker, and direct year entry
- **Today shortcut** – jump back to the current date from any view
- **Installable PWA** – offline-ready with auto-updating service worker and install prompt

## Tech Stack

| Layer      | Technology                                   |
| ---------- | -------------------------------------------- |
| Frontend   | React 19, TypeScript, Vite 7                 |
| Styling    | Tailwind CSS 4, shadcn/ui (Radix primitives) |
| Routing    | [wouter](https://github.com/molefrog/wouter) |
| Animation  | framer-motion                                |
| PWA        | vite-plugin-pwa                              |
| Production | Express static server                        |
| Tooling    | pnpm, esbuild, Prettier, tsc                 |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) 10+

### Install

```bash
pnpm install
```

### Develop

```bash
pnpm dev
```

Starts the Vite dev server on `http://localhost:3000` (exposed on your network via `--host`).

### Type Check

```bash
pnpm check
```

### Calendar Regression Tests

```bash
pnpm test:calendar
```

### Format

```bash
pnpm format
```

## Production

Build the client bundle and the Express server into `dist/`:

```bash
pnpm build
```

Then run the production server (serves the built SPA from `dist/public`):

```bash
pnpm start
```

The app listens on `PORT` (defaults to `3000`) and serves `index.html` for all routes to support client-side navigation.

## Deployment

A [Vercel](https://vercel.com) configuration is included (`vercel.json`) that builds only the static client:

```json
{
  "buildCommand": "pnpm vite build",
  "outputDirectory": "dist/public",
  "framework": "vite"
}
```

Alternatively, deploy anywhere that runs Node and use `pnpm build && pnpm start`.

## Project Structure

```
├── client/
│   ├── index.html            # App shell (Mon fonts: Noto Sans Myanmar, Space Grotesk)
│   └── src/
│       ├── components/
│       │   ├── ui/           # shadcn/ui components (button, card, select, sonner, tooltip)
│       │   ├── ErrorBoundary.tsx
│       │   └── InstallPrompt.tsx
│       ├── contexts/         # Theme provider
│       ├── lib/
│       │   └── myanmarCalendar.ts   # Gregorian → Myanmar/Mon conversion core
│       ├── pages/
│       │   ├── Home.tsx      # Calendar page
│       │   └── NotFound.tsx
│       ├── App.tsx           # Router + providers
│       └── main.tsx          # Entry point
├── server/
│   └── index.ts              # Express production server
├── patches/                  # pnpm patched dependencies
└── vite.config.ts
```

## Calendar Conversion

The conversion logic in [`client/src/lib/myanmarCalendar.ts`](client/src/lib/myanmarCalendar.ts) implements the classic Myanmar calendar algorithm: Gregorian dates are converted to Julian Day Numbers, then resolved against era constants and intercalary-month (Watat) exception tables to produce:

- Myanmar year type (common / Watat / intercalary variants)
- Month index and name (including First Waso, Late Tagu, Late Kason)
- Fortnight day and moon phase
- Sabbath status

The calculation is regression-tested against canonical `mmcal` vectors. Public-holiday closures are maintained separately because government announcements can change independently of the lunisolar calendar. The 2026 list uses the Myanmar Ministry of Foreign Affairs, the Myanmar National Portal / Ministry of Information, and official mission holiday notices. The Kason full moon is stored as **30 April 2026**, corroborated by the Ministry of Information's dated 1388 ME record; this avoids reproducing a conflicting 30 May entry on one summary page.

The 2027 list follows the Union Government announcement and the official Myanmar Embassy schedules published in August 2026. It includes the four announced bridge holidays and the nine-day Thingyan closure. Eid-ul-Adha and Deepavali remain deliberately undated until the government publishes their exact dates.

## License

MIT
