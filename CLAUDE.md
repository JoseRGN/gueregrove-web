# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the site

No build step. Open `index.html` directly in a browser, or serve it locally:

```powershell
# Python (quickest)
python -m http.server 8080 --directory sitio

# Node (if available)
npx serve sitio
```

## Visual verification

Playwright screenshots (requires `node_modules/` present):

```powershell
cd sitio
node verify-screenshots.js
```

Produces: `screenshot-hero.png`, `screenshot-nav.png`, `screenshot-logo-zoom.png`, `screenshot-servicios.png`, `screenshot-mobile.png`, `screenshot-faq.png`. Run after any visual change.

Install deps if missing: `cd sitio && npm install playwright`

## Architecture

Single-page static site. All files live flat in `sitio/`:

| File | Role |
|------|------|
| `index.html` | Full one-page site — all sections in order: Hero → Ticker → Servicios → Metodología → Blog → Nosotros → FAQ → Contacto → Footer |
| `style.css` | All styles. Uses CSS custom properties (`--black`, `--cream`, `--font-display`, etc.). No preprocessor. |
| `main.js` | Nav scroll/toggle, IntersectionObserver fade-up, FAQ accordion, contact form mock, footer year. |
| `logo.svg` | GG monogram mark. Two mirrored octagons with `fill-rule="evenodd"` void. **Known issue: renders as "E3" at small sizes** — arm too similar in proportion to top/bottom bars at 28–36px display height. |
| `robots.txt` / `sitemap.xml` | SEO files pointing to `gueregrove.com`. |

## Brand constraints

- **Palette**: `--black: #0A0A0A`, `--cream: #F0EDE5`. No other accent colors.
- **Typography**: Barlow Condensed (display/headings, weight 900) + Barlow (body). Loaded from Google Fonts.
- **Voice**: Direct, no-nonsense Spanish. Brand slogan: *"Keep on it."*

## SEO — must not regress

This site is a marketing agency that practices what it preaches. Any change must preserve:

- Two `<script type="application/ld+json">` blocks: `MarketingAgency` schema + `FAQPage` schema. FAQ answers in JSON-LD must stay in sync with the visible `.faq-answer` content.
- `<link rel="canonical">`, Open Graph tags, and Twitter Card tags in `<head>`.
- Semantic HTML5: `<header>`, `<main>`, `<footer>`, `<article>`, `<section>` with `aria-labelledby`, `<address>` for contact info.
- `itemscope`/`itemtype="https://schema.org/Service"` on each `.service-card`.
- `loading="lazy"` on below-fold images; `alt` text on all images.

## CSS patterns

- All spacing/sizing via `clamp()` for fluid typography — don't hardcode `px` for font sizes on headings.
- `.fade-up` + `.visible` classes drive IntersectionObserver entrance animations. Elements get `.fade-up` added by JS; CSS handles the transition.
- Nav background appears (`scrolled` class) only after 50px scroll — applied in `main.js`.
- Grid layouts use `gap: 1px` on a `var(--border)`-colored parent to create hair-line dividers between cells (not borders on children).

## Contact form

Submits via Netlify Forms (AJAX). The form has `name="contact" data-netlify="true" action="/"` plus a hidden `form-name` field required for AJAX submissions. `main.js` uses `fetch()` POST with `URLSearchParams(FormData)` — no additional backend needed once deployed to Netlify.
