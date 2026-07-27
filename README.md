# Behind the Ice Wall — landing page

A static, single-page marketing site for the novel *Behind the Ice Wall* by Joseph Cassius. No build step, no framework, no dependencies beyond one Google Fonts request — just HTML, CSS, and vanilla JS.

## Structure

```
index.html          the whole page
css/style.css        all styles (design tokens, layout, components, dark mode)
js/main.js            theme toggle, scroll reveal, accordion, smooth-scroll, hero parallax
images/               cover art, interior illustrations, favicons, social-share image
favicon.ico
```

## Before you deploy

Every "buy" button links to:

```
https://dltools8.gumroad.com/l/behind-the-ice-wall
```

If that URL ever changes, update it — it's a plain link, so a find-and-replace across `index.html` for that string is all that's needed (7 occurrences, including the sticky mobile buy bar).

## Deploying

This is a plain static site, so any of the following work with zero configuration:

**Cloudflare Pages**
1. Push this folder to a Git repo (or use `wrangler pages deploy .` from inside this folder with [Wrangler](https://developers.cloudflare.com/workers/wrangler/) installed).
2. In the Cloudflare dashboard: Pages → Create a project → connect the repo.
3. Build command: none. Output directory: `/` (repo root, or wherever this folder lives).

**Vercel**
1. `vercel` from inside this folder (with the [Vercel CLI](https://vercel.com/docs/cli)), or import the repo in the dashboard.
2. Framework preset: "Other" / static. No build command needed.

**Netlify**
1. Drag-and-drop this folder onto [app.netlify.com/drop](https://app.netlify.com/drop), or connect the repo.
2. Build command: none. Publish directory: `/` (this folder).

## Notes

- All internal links use relative paths (`css/style.css`, `images/cover.jpg`, etc.), so the site works whether it's deployed at a domain root or a subpath.
- Dark/light mode is remembered per-visitor via `localStorage` and otherwise follows the OS/browser preference on first visit.
- Respects `prefers-reduced-motion` throughout (disables the hero entrance animation, parallax, and scroll reveals).
- The FAQ accordion uses native `<details>/<summary>` — it works even with JavaScript disabled.
- The illustrations section is a swipeable horizontal gallery (touch swipe, or the arrow buttons on tablet/desktop).
- On phones, a slim "Get the Book" bar sticks to the bottom of the screen once you scroll past the hero, and hides again once the main Buy section is on screen.
- The text nav links (Synopsis/Chapters/Author/FAQ) only appear at desktop widths — there's no hamburger menu, so showing them any earlier crowded the header on tablets.
