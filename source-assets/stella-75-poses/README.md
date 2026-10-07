# Stella — 75 transparent cartoon poses

75 individually generated anime cartoon poses based on the Stella character reference sheet: short dark curls, hoop earrings, red jumper, white shirt, wide blue jeans, silver left-wrist watch, bare feet.

## Files

- `poses/`: exactly 75 numbered RGBA PNG images.
- `stella-character-master.png`: neutral full-body character render.
- `stella-75-movement-contact-sheet.png`: 5120 × 6400 numbered sheet, in pose order.
- `pose-map.json`: filenames, clip frame lists, dimensions, shared foot pivot and visible bounds.
- `pose-guide.csv` and `POSE_GUIDE.md`: all 75 proposed actions and pose assignments.

## Resolution and alignment

Each pose uses a 1536 × 2048 transparent canvas. Native renders are 1024 × 1536, placed without scaling or resampling. Extra transparent space provides room for gestures; it does not add character detail. The waist centre is aligned horizontally and the lowest visible foot is aligned vertically to the shared anchor (768, 1920). Artwork, fingers and curls are retained. Alignment uses whole-pixel translation only. No pose is produced by mirroring another image.

## Clip ranges

| Frames | Action | Playback |
| --- | --- | --- |
| 001–005 | Idle, breathing, blink, ready to walk | Use 001 as rest; briefly insert blink |
| 006–017 | Walk toward screen-right | Loop while moving right |
| 018–029 | Walk toward screen-left | Loop while moving left |
| 030–034 | Small turn and settle toward visitor | Play once |
| 035–044 | Raise hand and point upward-left on screen | Play once, hold 044 |
| 045–054 | Raise hand and point upward-right on screen | Play once, hold 054 |
| 055–061 | Open-palm presentation toward screen-left | Play once, hold 061 |
| 062–068 | Think, touch chin, discover | Play once, hold 068 |
| 069–075 | Pleased recognition and celebration | Play once, hold 075 |

Left and right in the clip names mean the direction in the displayed image, not anatomical handedness. Play pointing and presenting clips in reverse when returning to rest. Treat clips independently; do not play all 75 in a single loop.

## Using the poses in WebGL

These PNGs are pre-rendered sprites. Display them on a transparent plane, sprite, or billboard; this package contains no rig, GLB, mesh, skeleton, or executable website integration. Keep the camera-facing plane's aspect ratio at 1536/2048. Position its local foot anchor consistently using `shared_pivot_px` from the JSON. With an ordinary centred quad, the pivot is (0, -0.4375 × planeHeight), so place the quad centre 0.4375 × planeHeight above the intended foot position.

Control page travel separately from pose selection: use scroll progress to position the character on the desired S-shaped path. Use travel direction to choose a walk clip. Pause page travel beside a heading or project, select a point/present/reaction clip, and hold its final pose. When scroll reverses, reverse the current gesture before switching to walking. Start with walking at about 10 frames/second and gestures at about 8; tune for the site's displayed size and actual scroll speed.

Load only the active clip and nearby clips rather than all high-resolution textures at once. Produce smaller runtime textures as appropriate for the displayed size, retaining these PNGs as source assets. Respect reduced-motion preferences by showing a static neutral or pointing pose.

## Animation limits

The poses provide independent stock artwork and small gesture variations. Image generation retains minor differences in clothing folds, face details, body angle, and gait, so this is not a mathematically interpolated or rig-rendered animation. Canvas and foot registration reduce positional jumps but do not eliminate shape drift. Validate walking cadence and clip transitions in the actual website. For fully continuous 3D motion, use a rigged character and skeletal animation as a further production step.

Artwork was made with the built-in image-generation tool; technical assembly used Pillow. Images were generated individually against the locked master and ten frames were corrected against neighbouring poses. Contact-sheet cells were assembled from final files; they were not cropped into low-resolution individual assets.
