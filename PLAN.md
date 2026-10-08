# anarc.cc build plan

Status: **Orkut-style profile layout, committed Frutiger Aero skin.** The banner image is yours to add at `src/assets/banner.png` (or jpg/webp/avif/gif). **Phase 3 (motion) done.** Each item below lives in its own module in `src/motion/modules/`:
- `materialize`: the focal entrance. Glass condenses out of the sky in reading order, with a glint sweep across each gloss bar, once per visit.
- `banner-drift`: the banner sinks and dims as you scroll past it.
- `bubbles`: ambient CSS bubbles. They pause when the tab is hidden and are off under reduced motion.
- Lenis smooth scroll, driven by GSAP's ticker.
- Astro `<ClientRouter />`: tabs swap only the center column (blur cross-fade). The banner persists.
- CSS only: panels animate open and closed, and pills and gloss bars glint on hover.

The world as built:
- Top: italic logo + a rounded link bar.
- Three-column shell (`src/components/shell/ProfileShell.astro`) that every page lives in:
  - left: framed photo, name, quote, mood / location / last login, online now, icon nav
  - center: tabs (home | profile | work), then the page itself. Home shows the status box, an about-me panel and the updates feed; work shows a grid; an entry shows the post.
  - right: vault player, featured projects, projects (status filters), contacting table
- Panels are rounded with header rows. The ▾ actually collapses them (native `<details>`).
- Palette: navy / pale blue on a cool white wash. Tiny Verdana UI, Bodoni Moda italic for the name and logo.
- Phones: a single column, with the photo beside the details.

Each phase below ends at a checkpoint where you approve before the next one starts.

---

## 1. What exists now

A working Astro 7 site with real structure, content plumbing, and a motion hook system. It has no design and no animation.

- Grey wireframe styling. Every block is outlined and labelled (`HOME / HERO`, `WORK CARD`, …) so you can judge structure alone.
- The labels come from `src/styles/skeleton.css`. Phase 2 deletes that file.
- The JS ships 5 KB total today: a motion loader plus one empty module.
- Run it with `npm run dev` and open http://localhost:4321.

## 2. Architecture

```
src/
├── site.config.ts          name, tagline, nav, social links: one place for all of it
├── content.config.ts       content schema (typed, validated at build time)
├── content/work/*.md       one file per piece of work
├── lib/work.ts             data access: getWork(), getFeaturedWork(), formatDate()
├── layouts/BaseLayout.astro    <head>, header, footer, skip link, motion boot
├── components/
│   ├── layout/             SiteHeader, SiteFooter
│   ├── sections/           Section (generic wrapper), Hero
│   └── work/               WorkCard, WorkList
├── pages/                  index, about, 404, work/index, work/[...slug]
├── styles/
│   ├── tokens.css          every colour / type / space / motion value (stand-ins for now)
│   ├── base.css            reset + base elements
│   └── skeleton.css        wireframe outlines (temporary)
└── motion/
    ├── index.ts            startMotion(): finds [data-motion], lazy-loads modules
    ├── registry.ts         name → lazy import
    ├── types.ts            MotionModule contract
    └── modules/reveal.ts   stub (does nothing yet)
```

### Rules that keep it from turning into spaghetti

1. **One job per file.** Components render markup, `lib/` fetches and shapes data, and `motion/modules/` animates. None of them crosses into another's job.
2. **No inline animation code in components.** A component asks for motion with an attribute (`<Section motion="reveal">` or `data-motion="reveal parallax"`). The module owns all of the behaviour.
3. **Every motion module has the same signature:** `(element, { reducedMotion }) => cleanup`. Each one is lazy-loaded as its own chunk, so a page downloads only the motion it uses.
4. **Design values live only in `tokens.css`.** Components reference variables and never hard-code colours or sizes.
5. **Content is separate from presentation.** Adding work means adding a Markdown file. Templates are never edited for content.
6. **Scoped styles.** Each `.astro` component's `<style>` is scoped to that component. Nothing global except tokens and base.
7. **Strictest TypeScript.** `npm run build` runs `astro check` first, so type errors fail the build.

### Adding things later

| You want to… | You do… |
|---|---|
| Add a piece of work | Drop `src/content/work/my-thing.md` in (frontmatter: title, summary, date, tags, cover, links, featured) |
| Hide a draft | `draft: true`, or prefix the filename with `_` |
| Add a whole new section (e.g. a log, photos, anything) | New collection in `content.config.ts` + `pages/<name>/` folder + nav entry in `site.config.ts` |
| Add a new animation | New file in `motion/modules/` + one line in `registry.ts` + `data-motion="name"` in markup |
| Rename / remove "Work" | Edit the nav entry and rename the route folder. Nothing else depends on the name. |

## 3. Pages (current skeleton, open to change)

| Route | Sections |
|---|---|
| `/` | hero (name, tagline, stage for a signature graphic) → selected work (entries with `featured: true`) → about teaser → outro / contact |
| `/work` | header → full list, newest first, with an empty state |
| `/work/<entry>` | back link, title, summary, date/tags, external links → lead media → Markdown body |
| `/about` | header → portrait + bio → contact |
| `/404` | message + link home |

Every piece of copy on these pages is a placeholder for you to replace. The one sample entry is called "Placeholder entry"; delete it once you add real ones.

---

## 4. Phases

### Phase 1: Visual direction (next; decided together)
- I run the direction round. You get a few distinct visual worlds, each with a palette, type, the feel of the first screen, a signature interaction, and an honest risk. You pick one, steer it, or re-roll.
- The result is written down as a short direction contract, so later sessions don't drift.
- **Checkpoint:** you approve the direction. No code changes in this phase.

### Phase 2: Static visual build (no GSAP yet)
- Replace the stand-ins in `tokens.css` with the chosen palette, type scale, and fonts (self-hosted, subset, `font-display: swap`).
- Delete `skeleton.css` and style every component in the new world: nav, links, cards, and buttons all get rebuilt, not just recoloured.
- Build the hero "stage" as real graphics: inline SVG components, or a lazy-loaded canvas island if the direction calls for one.
- Responsive pass at 375 / 768 / 1280 / 1600 widths.
- **Checkpoint:** you review the site completely still.

### Phase 3: Motion system
Packages added only now: `gsap` (core + ScrollTrigger) and `lenis`.

**Infrastructure (built first, small):**
- `motion/scroll.ts`: one Lenis instance driving ScrollTrigger's update loop, so smooth scroll and scroll triggers never disagree. It's disabled entirely under reduced motion.
- No-flash reveals:
  - Content is visible by default.
  - A tiny inline script adds `.motion-ready` to `<html>` before first paint.
  - Reveal targets hide only under that class, and a failsafe un-hides them if JS stalls.
  - Without JS, everything is simply there.
- Every module returns a cleanup: kill its tweens, ScrollTriggers, and observers. That keeps page transitions leak-free.

**Motion vocabulary** (exact choreography comes from the Phase 1 direction):

| Layer | Examples | Notes |
|---|---|---|
| Entrance | section/heading/card reveals, staggered lists | One shared easing and duration family from `tokens.css` |
| Scroll-scrubbed | parallax depth, progress-linked transforms | `transform` / `opacity` only, never layout properties |
| Pinned sequences | a section that holds while its contents play through | At most one or two on the whole site; earned, not everywhere |
| Signature interaction | the hero piece from Phase 1 | The single thing someone remembers |
| Micro | link/hover states, cursor-reactive bits | CSS where possible, JS only when needed |
| Page transitions | Astro `<ClientRouter />` (View Transitions) | Motion re-inits on `astro:page-load` and cleans up on swap |

**Budget and performance:**
- Motion JS stays roughly under 50 KB gzipped (GSAP core, ScrollTrigger, and Lenis together).
- Only pages that use a module load it.
- Animate composited properties only.
- Canvas/WebGL pauses when offscreen or the tab is hidden.
- Target: Lighthouse performance ≥ 95 on mobile, CLS ≈ 0.

**Reduced motion:** every module gets `reducedMotion`. It either jumps to the final state or swaps to a plain opacity fade. Smooth scroll turns off.

- **Checkpoint:** you review the motion on real devices.

### Phase 4: Hardening
- Accessibility: keyboard paths, focus states, contrast, landmarks, and alt text.
- Polish: Open Graph image and meta per page, sitemap, RSS feed if you want one, and a performance audit.

### Phase 5: Deploy to Cloudflare Pages
1. `git init` and push to a GitHub/GitLab repo.
2. In Cloudflare Pages, connect the repo. Build command: `npm run build`. Output directory: `dist`. Node version 22+.
3. Add the custom domain `anarc.cc` (DNS on Cloudflare makes this one click).
4. Every push to `main` deploys, and other branches get preview URLs.

Pure static output, so no adapter or Workers runtime is needed. If you later want server bits (forms, view counts), `@astrojs/cloudflare` adds them per route.

---

## 5. Decisions only you can make

- [ ] Display name / handle, tagline, description (`src/site.config.ts`)
- [ ] Social links (`src/site.config.ts`)
- [ ] Whether the sections are right: keep **Work** and **About**, rename them, or add others
- [ ] Your actual work entries, bio, images
- [ ] Visual direction (Phase 1)
