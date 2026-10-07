# Bite Playground

A library of Bite motion prototypes using EA Connect mobile screens.

[Live site](https://bite-playground.jtiu.chatgpt.site)

## Prototypes

- **Gravity transition:** compare the original fall-and-reveal animation with the direct-to-banner intro. Each preview has its own controls; **Replay both** starts them together.
- **Soft launch banner animations:** compare the stacked assemble-and-float banner with the slow orbit banner.

Both pages have a **Blue gradient** switch for the Bite background. The choice is remembered on this device, applies to both previews, and does not restart their animations. Other app tabs retain their original backgrounds.

The current copy, geometric assets, Figtree font, avatars, navigation, reduced-motion handling, and daily refresh-time logic are included.

## Run locally

The built website is checked into `dist/`. With Python 3 installed, run:

```sh
python3 -m http.server 8000 --directory dist
```

Open <http://localhost:8000>. Use an HTTP server rather than opening the HTML files directly: the comparison previews use same-origin messaging and root-relative routes.

## Edit and rebuild

Edit the files in `source/`, then run:

```sh
python3 -B build.py
```

The build uses only the Python standard library. No npm installation, ChatGPT environment, or Figma connection is required. It regenerates all four HTML documents in `dist/` and the assembled `source/playground.html` fragment. Keep `dist/assets/`: these are the original build inputs, including the font, avatars, logos, and SVG shapes.

## Structure

| Location | Purpose |
| --- | --- |
| `source/shell-before.html`, `source/shell-after.html` | Shared prototype-library navigation and layout |
| `source/gravity-transition.html`, `source/gravity-transition.js` | Current mobile app and intro controller |
| `source/gravity-banner.js`, `source/gravity-banner.css` | Direct-to-banner assembly and floating motion |
| `source/gravity-original-document.html` | Preserved original gravity prototype |
| `source/gravity-comparison.*`, `source/gravity-preview.*` | Side-by-side comparison and preview controls |
| `source/stack-banner.html`, `source/stack-motion.js` | Shared stacked banner and its standalone animation |
| `source/soft-launch-*` | Banner comparison, orbit motion, assets, and reset-time display |
| `source/bite-home.*`, `source/connect-*`, `source/connect.css` | Homepage and other app screens |
| `source/document-template.html` | Portable HTML shell used by the build |
| `dist/assets/` | Fonts, avatars, icons, and brand shapes |
| `build.py`, `build_soft_launch.py`, `build_gravity_comparison.py` | Static build pipeline |
| `dist/` | Ready-to-serve website |

## Hosting

Serve `dist/` as the web root on a static host. The current links use root-relative paths, so mounting the site under a subdirectory requires updating those links. The existing ChatGPT-hosted site remains available at the link above.

For Vercel, import this repository with the repository root as the Root Directory. The checked-in `vercel.json` selects the **Other** framework and serves `dist/`, skipping dependency installation and build commands because the built HTML is committed. Commit rebuilt `dist/` pages with source changes. A connected Vercel project can deploy new pushes automatically. GitHub Pages is not configured.

## Motion and dependencies

The original gravity prototype loads Matter.js 0.20.0 from a CDN and needs an internet connection for that script. Current banner and direct-to-banner motion use the browser's Web Animations API. Lucide is bundled in `source/vendor/`; the font and image assets are included locally and embedded into the generated pages.

The current direct-to-banner intro is gated to the first Bite open after the daily refresh, can be skipped by tapping during playback, and respects reduced-motion preferences. The original preview is intentionally preserved for comparison. Manual replay controls are available in both previews.

The refresh calculation uses midnight in `America/Los_Angeles` and formats the banner time in `America/Toronto`. The simulated status-bar clock currently uses Toronto time as configured in the prototype.

Developer reference: [Gravity · Fancy Components](https://www.fancycomponents.dev/docs/components/physics/gravity).
