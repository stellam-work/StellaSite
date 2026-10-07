# Verification Report

This file records only checks actually performed for this package. See the final dated section for commands, environments, results, and limitations.

## Intended coverage

- Static asset, syntax, and reference checks.
- Desktop and mobile browser rendering.
- Forward, reverse, rapid, anchor-jump, and mid-page-reload scroll states.
- Evidence dialog keyboard behavior.
- Reduced-motion behavior.
- WebGL failure and missing-character fallback paths.
- Console errors and basic frame/cache telemetry.
- Fresh extraction and local-server startup.

## Important asset limitation

The supplied character is a sequence of transparent still renders. It is not a Blender file, a rig, a GLB, or skeletal animation. This prototype renders the sequence as scroll-selected WebGL textures and does not claim continuous mesh deformation.

## Run record - 5 October 2026 UTC

Environment: Linux 6.18.44 x86_64, Node.js 24.19.0, Python 3.12.14.

### Passed

- `node --check app.js` and `node --check renderer.js`: both scripts parsed successfully after the final edits.
- Local HTTP run: `python3 -m http.server 4173` served the prototype. `curl` returned HTTP 200 for the page, `renderer.js`, and a representative character texture. The served HTML was byte-identical to `index.html`.
- Local references: an automated scan found 10 local `src`/`href` references and zero missing files.
- Document structure: 18 IDs were found with zero duplicates; all six hash links resolve to an existing ID.
- Preserved content: automated literal checks passed for the first-chapter heading, role, paragraph, the exit heading, exit role, and exit paragraph. The supplied profile URLs remain present.
- Character assets: exactly 50 runtime WebP frames and 50 editable PNG source frames are present. ImageMagick reported every runtime frame as 512 x 768 sRGBA and every source frame as 768 x 1152 sRGBA.
- Motion mapping: a 1,001-sample route check found chapter-one frames monotonic from 001 to 025 and exit frames monotonic from 026 to 034. The intended frame-022 reading hold remained stable at local progress 0.72, 0.78, and 0.84. Because pose is a pure function of section progress, the same static check also confirms mathematical forward/reverse determinism.
- Static resilience hooks: checks confirmed the six-texture cache bound, texture-load error handler, WebGL context-loss handler, animation-frame cancellation, and explicit renderer cleanup are present.
- Media inspection: `ffprobe` read all video sources. Desktop MP4 is H.264, 1280 x 720, 30 fps, 8.8 s; mobile MP4 is H.264, 540 x 960, 30 fps, 8.8 s; WebM is VP9, 1280 x 720, 30 fps, 8.8 s.
- Package integrity: the final ZIP contains 118 files and `unzip -t` reported no compressed-data errors. A clean extraction was served from its extracted top-level folder on port 4181; the page and representative frame 032 returned HTTP 200, and the served page matched the extracted `index.html` byte for byte.

### Not runtime-verified

- Browser screenshots, canvas pixels, actual GPU rendering, texture presentation, visual continuity, clipping, and measured frame consistency.
- Desktop/mobile/touch layouts, orientation changes, rapid physical scrolling, reverse scrolling, anchor jumps, and mid-page reload behavior in a real browser.
- Keyboard focus order, evidence-dialog focus return, screen-reader output, and forced-colours rendering in a real browser.
- Actual reduced-motion rendering, WebGL unavailability, texture-request failure, and context-loss recovery. Those paths were implemented and statically inspected only.
- Video autoplay behavior and external profile navigation under real browser policies.

### Browser limitation

No browser binary was installed. `npx playwright --version` attempted to obtain Playwright but the configured package registry returned HTTP 403. A system package-index refresh was also attempted and the Ubuntu repositories returned HTTP 403, so Chromium could not be installed. No browser, screenshot, console, GPU, touch, or emulated-device result is claimed.

## Full-site extension - 6 October 2026 UTC

### Passed

- Final `node --check` runs parsed `app.js` and `renderer.js` successfully.
- The document contains all six original sections in the original order: systems, scale, experiments, transfer, leadership, and contact.
- Structured comparison against the supplied v5.2 source found identical visible content inside every chapter's reading block, including the contact block.
- The restored thesis PDF is byte-identical to the supplied v5.2 copy.
- An automated reference scan found 11 local references with zero missing files. It found 28 IDs with no duplicates and 10 hash links with no missing targets.
- All six motion routes were sampled at 10,001 progress points. Every route was monotonic and bounded to its intended range: systems 001-025, scale 026-034, experiments 009-014, transfer 015-025, leadership 035-042, and contact 043-050.
- Frame-use analysis found a maximum of two chapter routes per frame, below the owner's stop threshold of more than three. Frames 009-014 are shared only by systems and experiments; frames 015-025 are shared only by systems and transfer.
- The full site still contains exactly 50 optimized WebP frames and 50 editable PNG source frames.
- Section-local state, previous-to-current side interpolation, navigation state, fallback still selection, and transfer evidence labels are recalculated from layout on every scheduled update, including initial load and resize/orientation events.
- A local HTTP server on port 4174 returned the full page, CSS, both scripts, every directly referenced poster/video, a representative character frame, and the thesis PDF with HTTP 200. The served page was byte-identical to the source `index.html`.
- Combined-delivery check: the archive contained 184 files and passed `unzip -t` with no compressed-data errors. Cleanly extracted copies of both the full site and isolated prototype were served on ports 4184 and 4185; each page and representative character texture returned HTTP 200, and each served page was byte-identical to its extracted `index.html`.

### Still not runtime-verified

The browser limitation above remains unchanged. Actual WebGL pixels, visual spacing, clipping, console state, touch behavior, focus behavior, context loss, reduced-motion rendering, real rapid scrolling, and measured frame consistency remain unverified in a browser or on a physical device.

## Go-live edits - 6 October 2026 UTC

### Passed

- All 50 replacement cartoon poses were present with one-to-one filenames from `frame-001.png` through `frame-050.png`. Every copied editable source was byte-identical to the user-supplied archive.
- Source inspection reported 50 RGB PNGs at 1360 x 2048. Runtime processing produced exactly 50 alpha-enabled WebPs at 512 x 768; ImageMagick reported `srgba` and `opaque=false` for every frame.
- A generated runtime contact sheet was composited over a dark background and visually inspected. All 50 full-body cartoon figures were present, the outer pale background was removed, and white clothing details remained visible.
- Pose filenames, chapter routes, progress keyframes, and reduced-motion holds were not changed during the style replacement.
- Automated text scans found zero remaining `CV-supplied evidence` strings in the full site or isolated prototype. Evidence buttons, dialogs, thesis link, email link, and evidence content remain.
- `03 · Stable Diffusion` appears in both the chapter navigation and the chapter's visible scene label.
- The leadership renderer parses successfully and contains the new two-lane editorial/finance alignment and shared operating spine. A source assertion confirmed the old trigonometric orbit is absent from `sceneLeadership()`.
- Final `node --check` runs passed for both scripts in both builds.
- Local HTTP runs on ports 4186 and 4187 returned both pages and representative cartoon frames with HTTP 200. The full-site run also returned CSS, both scripts, frames 001/011/040/050, and the thesis PDF.
- The final go-live ZIP contains 185 files (approximately 120 MB) and passed `unzip -t` with no compressed-data errors. Cleanly extracted full and isolated builds were served on ports 4188 and 4189; both pages matched their extracted `index.html`, and representative frames 001, 011, 040, and 050 returned HTTP 200.

### Still not runtime-verified

The environment still has no browser binary. The new cartoon textures and leadership scene were not observed in a live browser/WebGL canvas, and no browser screenshots, console run, touch/device run, or measured GPU performance result is claimed. The contact sheet inspection verifies the processed image assets themselves, not their final WebGL presentation.

## 75-pose bottom-stage revision - 6 October 2026 UTC

### Passed

- The supplied package contained exactly 75 transparent 1536 x 2048 PNG poses plus clip guides, pose map, character master, and contact sheet. All 75 editable sources in this delivery are byte-identical to the uploaded originals.
- Runtime export produced exactly 75 alpha-enabled 960 x 1280 WebPs. ImageMagick reported `srgba` and `opaque=false` for every file.
- A runtime contact sheet composited over a dark background was visually inspected. All 75 full-body figures were present, transparent, aligned to a common baseline, and retained visibly sharper detail than the prior 512 x 768 derivatives.
- Syntax checks passed for `app.js` and `renderer.js` in both the complete site and isolated prototype.
- Static source assertions confirmed one fixed character baseline, horizontal position derived only from `trackProgress`, no character-side or vertical-lift logic, and no sprite mirroring.
- Station sampling confirmed deterministic monotonic stops at 0%, 20%, 40%, 60%, 80%, and 100% of the bottom rail. Each incoming chapter completes travel in its first 22%, then maps the remaining progress to its gesture.
- Walk-cycle sampling covered all right-walk frames 006-017 for forward travel and all independently authored left-walk frames 018-029 for reverse travel.
- Gesture sampling stayed within contiguous authored clips: Systems 045-054, Scale 035-044, Stable Diffusion 062-068, Transfer 055-061, Leadership 055-061, and Contact 069-075.
- Leadership source inspection confirmed the previous lane/spine implementation is gone. The new background uses sequential alternating entries, a rising shared path, connectors, and handoff pulses; the character uses the incremental presentation clip.
- Local-reference checks found no missing files, duplicate IDs, or missing hash targets.
- Local HTTP serving on ports 4190 and 4191 returned both pages and representative walk, leadership, contact, script, style, and thesis assets with HTTP 200. Served pages matched their source HTML byte for byte.
- The combined 75-pose ZIP contains 261 files (approximately 173 MB) and passed `unzip -t` with no compressed-data errors. Cleanly extracted full and isolated builds were served on ports 4192 and 4193; both pages matched their extracted HTML, and representative forward-walk, reverse-walk, Leadership, Contact, script, and style assets returned HTTP 200.

### Still not runtime-verified

The browser limitation remains. The fixed baseline, station travel, new Leadership call-and-response, texture sharpness inside WebGL, rapid-scroll cadence, touch behavior, canvas pixels, console state, and measured GPU performance were not observed in a browser or physical device. Static asset inspection and source-level behavior checks must not be treated as browser results.
