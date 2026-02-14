# MEMORY.md - Long-Term Memory

## Cole Sullivan (CIO, Family Office)
- **Role:** CIO at family office, 5.5 years
- **Background:** 15 years sell-side equity research analyst (oil services sector)
- **Portfolio:** Public equities (passive + active), PE, VC, private credit, real estate, direct deals
- **Needs:** Investment analyst support — monitor public equities, ad hoc analysis on other investments
- **Timezone:** Central (Houston)
- **Preferences:** Haiku model to manage costs; token efficiency matters to him

## Working Relationship
- Use local file storage to minimize token usage (watchlists, notes, prior analyses)
- Keep responses concise and action-oriented
- Batch related analyses together
- Cache context locally so he doesn't repeat himself

## Active Setup (as of Feb 13, 2026)

**Automation:**
- Morning Brief: Runs 8 AM CT daily, delivers to WhatsApp
  - Covers: Hyperscalers (NVDA, MSFT, AMZN, GOOG, META, TSLA), semis (TSM, MRVL, AVGO, AMD), AI infra (SNOW, PANW, DLR, EQIX), energy/data center (XOM, CVX, NEE, EPD, ET, OXY), 31-ticker watchlist
  - Format: Bullet summary with story links, trading-angle focus
  - Requires Brave Search API (configured as of Feb 13)
  - First full brief delivered Feb 13 at 14:57 UTC

**Watchlist (31 tickers):**
- Energy/Midstream: EPD, ET, MPLX, PAA, XOM, OXY
- Industrials: EPSN, EQT, FAST, GNRC, PWR, RKLB, SEI, TISI, XYL
- Financials/Alternatives: MAIN, STEL, EBMT, FFIN
- Tech/Semis: AMZN, GOOG, TSLA, TSM, MRVL, AVGO, PANW, SNOW
- Healthcare/Commodities: LLY, ENVX, GLD, FCX
- File saved locally: `/home/node/.openclaw/workspace/watchlist.md`

**In Progress**
- Gmail setup: Account (clark.openclawbot@gmail.com) + app password ready
  - IMAP poller script written but needs npm dependency install
  - Alternative: WhatsApp file upload for Excel/CSV/models (simpler approach)
  - Cole prefers email but open to WhatsApp as workaround
- Comp table analysis framework (pending email/data flow)

**Known Issues**
- Telegram has persistent 404 errors from env vars (OPENCLAW_STARTER_PROXY_URL, etc.) baked into gateway startup
  - Cause: Environment variables injected by gateway process at startup
  - Workaround: Disable streamMode on Telegram (done)
  - Real fix: Locate startup script/systemd service and remove env vars (not found yet)
  - WhatsApp is cleaner alternative
  
**Channels**
- WhatsApp: Primary (connected, clean) — +17135034555
- Telegram: Secondary/backup (has 404 issues but functional)
