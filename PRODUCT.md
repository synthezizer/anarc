# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Delegated: **Astro** (static output) + **GSAP with ScrollTrigger** for animation and scroll choreography + **Lenis** for smooth scrolling, written in **TypeScript**. Deployed to **Cloudflare Pages**.

Why: the owner asked for rich animation, graphical elements, and scroll-driven motion without heavy bulk, in modular code. Astro ships zero JS by default and hydrates only the components that need it, so pages that are mostly motion stay light. Its component/layout model keeps every section, effect, and content entry in its own file. GSAP and ScrollTrigger are the most capable and best-tested way to do timeline and scroll work, and Lenis is small. Canvas/WebGL pieces can be added as isolated islands later if a page needs them.

Code organization is a hard requirement: small single-purpose components, motion logic kept apart from markup (reusable animation modules, not inline one-offs), and content kept apart from presentation (Astro content collections). No spaghetti.

## Users

The visitor is anyone who reaches anarc.cc and wants to look around: friends, peers, collaborators, curious strangers. No conversion goal exists. Success means the visitor explores and gets a sense of who the owner is and what they make.

## Product Purpose

anarc.cc is the owner's personal "everything" website, a long-lasting home on the web for whatever they're making or into at the time. It is a portfolio in the broad sense, not one discipline's case-study showcase. The domain is deliberately non-specific so the site can change over the years without being renamed.

## Positioning

A personal site that belongs to one person and is built to evolve. Its value comes from personality and craft, not from fitting a portfolio template.

## Capabilities and Constraints

- Must make it easy to add, remove, and reshuffle sections and work over time without rewrites. The site's scope will change.
- Static-first. Every page must work fast on Cloudflare Pages with no server runtime.
- Animation and scroll effects are a core part of the experience. They must stay performant and should respect `prefers-reduced-motion`.
- Open: which sections exist at launch (the owner will fill in content).

## Brand Commitments

- Domain: **anarc.cc**.
- Aesthetic (owner-pinned, binding): **the layout of a mid-2000s Orkut/MySpace-style social profile, dense.** Owner-supplied reference: an Orkut profile. Copy its LAYOUT only, never its colours or content: a logo + link bar on top; three columns (left: framed photo, name, details, icon nav; center: tabs, status, about, updates feed; right: music player, featured projects, projects with status, contact) of rounded, collapsible panels with header rows. No fake browser/OS chrome. **Skin: committed to Frutiger Aero** (2026-10-07): glass panels, split-gloss header bars, aqua pill controls, sky-gradient page. Gradients are allowed only in that Aero register. A full-width profile banner (owner-supplied image, Discord banner proportions 5:2, min 600×240, side-cropping on narrow screens) fades into the sky at the top. No hand-drawn complex SVG scenery or elements; only simple SVG. No repeated elements (name, quote, mood each appear once). Rejected so far (2026-10-07): pastel kawaii, pastel neobrutalism, saturated neobrutalism with OS windows and chunky display fonts (cliché), and a sparse editorial take on MySpace (missed the point). Never bland, corporate or template-like.
- Name, handle, bio, and tagline: **not yet provided**. The owner will fill these in. Don't invent them. Use clearly marked placeholders.

## Evidence on Hand

- None yet. The owner supplies all content themselves. Never infer, suggest, or name projects from anything outside what the owner explicitly provides, and never make up projects, clients, quotes, stats, or biography.

## Product Principles

1. **Built to change.** Structure beats pages. New sections and work should drop in as content, not as rewrites.
2. **Personal over professional template.** This is one person's place on the web, not a résumé.
3. **Motion with restraint in weight.** Expressive animation, but no bloated bundles or janky scroll.
4. **Clean, modular code.** Readable components and isolated motion modules are part of the product, not an afterthought.
5. **Never fabricate.** Placeholders stay visibly placeholders until the owner fills them.

## Accessibility & Inclusion

Honor `prefers-reduced-motion` with calm fallbacks for all scroll and animation effects. Keep content readable and navigable without JavaScript.
