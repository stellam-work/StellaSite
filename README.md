# Stella Mortarotti - Full WebGL Motion Portfolio

This self-contained site preserves the supplied shoreline entry and all six portfolio chapters. It extends the approved chapter-one scroll choreography across the complete page and renders the supplied character sequence as WebGL textures over section-specific procedural scenes.

## Run

From this folder:

```sh
python3 -m http.server 4173
```

Open `http://localhost:4173/`. Add `?debug=1` to show the active section, local scroll progress, selected character frame, texture-cache size, quality mode, reduced-motion state, and WebGL status.

The files must be served over HTTP. Opening `index.html` directly is not supported because browser media and texture-loading policies vary for local files.

## Structure

- `index.html`: preserved entry, all six chapters, evidence dialogs, thesis/contact journeys, and fallback markup.
- `styles.css`: responsive composition, sticky reading stage, reduced-motion and forced-colour behavior.
- `app.js`: section-relative scroll state, dialog behavior, video lifecycle, navigation state, and renderer lifecycle.
- `renderer.js`: raw WebGL scene, 75-frame texture loader, directional walk cycles, chapter gestures, procedural scenes, fallbacks, and cleanup.
- `assets/`: optimized runtime video, poster, and WebP character frames.
- `source-assets/stella-75-poses/`: final owner-supplied transparent PNG frames, clip guides, pose map, and contact sheet.
- `docs/`: storyboard, animation adjustment guide, verification record, and licence/provenance notes.

## Motion adjustment points

The main tuning points are intentionally centralized:

- `app.js`, `updateScroll()`: reading marker, global bottom-track progress, scroll direction, navigation, and fallback position.
- `renderer.js`, `poseFrame()`: frame-to-progress keyframes and reduced-motion stills.
- `renderer.js`, `avatar()`: fixed foot baseline, horizontal track travel, character scale, and mobile bounds.
- `renderer.js`, `sceneSystems()`: disorder-to-pipeline transformation.
- `styles.css`, `.scene` and `.contact-scene`: scroll distance and sticky reading duration.

No build step or installed dependency is required. The isolated first-chapter prototype is delivered separately in the parent package.
