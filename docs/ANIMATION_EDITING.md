# Animation Editing Guide

## Frame sequence

Runtime textures are `assets/avatar/frames/frame-001.webp` through `frame-075.webp`. They are 960 x 1280 alpha WebPs derived from the owner-supplied 1536 x 2048 transparent PNGs in `source-assets/stella-75-poses/`.

The authored clips are:

- 001-005: idle, breathing, blink, ready.
- 006-017: walk screen-right while page progress advances.
- 018-029: walk screen-left while page progress reverses.
- 030-034: turn and settle.
- 035-044: point upward-left.
- 045-054: point upward-right.
- 055-061: open-palm presentation.
- 062-068: think and discover.
- 069-075: pleased recognition.

The renderer uses walk frames only while scroll position is changing. After 150 ms without travel, it settles into a section gesture selected by `SignalWorld.poseFrame()`:

- Systems: upward-right point, 045-054 and return.
- Scale: upward-left point, 035-044 and return.
- Stable Diffusion: think/discover, 062-068.
- Transfer: open-palm presentation, 055-061.
- Leadership: open-palm presentation, 055-061 and return.
- Contact: pleased recognition, 069-075.

## Bottom stage

The story is divided into six bottom-stage stations. During the first 22% of each incoming chapter, the character walks from the preceding station to the new one; the remaining 78% drives that chapter's gesture while horizontal position holds. `SignalWorld.avatar()` fixes the feet to one baseline and never adds chapter-specific vertical lift. `updateScroll()` supplies `characterTrack` and travel `direction`; the CSS `.character-track` mirrors station progress visually.

Change `height`, `bottom`, or `edge` in `avatar()` to tune scale, foot registration, or horizontal margins. Keep source aspect ratio at 3:4. The shared foot pivot sits 6.25% above the sprite canvas bottom; the current plane baseline accounts for that padding.

## Leadership

`sceneLeadership()` is a sequential call-and-response. Contributions enter from alternating sides, settle onto a rising shared path, connect to the preceding contribution, and briefly light the next handoff. The character uses the presentation clip rather than a walk, bow, or conducting loop.

## Runtime limits

- Runtime textures are 960 x 1280, increased from the previous 512 x 768 set.
- The lazy cache holds at most six textures, about 28 MiB of base-level RGBA texture data.
- Device pixel ratio is capped at 1.5 desktop and 1.25 mobile.
- Average frame cost above 22 ms switches procedural geometry to lower detail.
- Hidden tabs stop the render loop; `pagehide` deletes textures, buffers, programs, and listeners.

This remains a pre-rendered texture sequence, not a Blender rig, GLB, mesh, or continuously interpolated skeletal animation.
