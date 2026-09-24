# Session Memory: Full Scene Gestures
Date: 2026-09-24
Status: COMPLETED

## User Prompt
Remove Come closer and pause controls. Require up/down gestures to move smoothly between exactly two landing scenes instead of incremental scrolling.

## Project Context
- Frontend app: React ocean landing.
- Backend/API context: Existing /auth destination retained on second scene.
- Environment/deployment: Local Vite at http://127.0.0.1:5173/.

## Plan (Simple)
Replace native scene snap with discrete gesture transitions; remove redundant navigation and pause UI; verify desktop/mobile.

## TODO List
- [x] Remove top-right auth link, pause button and clickable scene-navigation CTAs.
- [x] Implement one gesture per complete scene transition.
- [x] Verify build, targeted lint and browser behavior.

## What Was Done
- Added 1050ms quintic easing with zero endpoint velocity/acceleration.
- Wheel threshold 24px, touch threshold 36px, wheel gesture separation 220ms; ignore extra input during transitions and consume momentum.
- Preserved keyboard scene navigation, pinch zoom, continuous particles and OS reduced-motion preference.
- Both scenes stay viewport-height. Oversized text scrolls within its copy region to remain readable without introducing additional scene stops.
- Footer auth action remains; no first-screen clickable entry except accessible skip link.

## Files Touched
- src/pages/ocean/index.tsx
- src/pages/ocean/ocean.css

## Key Decisions
- User's latest request supersedes native scroll snapping from previous session.
- Remove manual pause UI; keep platform accessibility preference.

## Validation
- `npm run build`: PASS
- Targeted ESLint: PASS
- UI/server check: YES - 1440x1000, 390x844, 320x568, 844x390 exact endpoints/footer/no horizontal overflow. Mid-transition reverse input does not interrupt. Chrome CDP touch swipe up/down, PageDown, animated canvas, /auth navigation and mobile screenshots verified. No browser runtime errors.
- API/backend check: NO - unchanged.

## Blockers / Notes for Next Agent
- 2026-09-25: Longer/deeper descent requested. Increased endpoint depth from 6% to 12% viewport height, entry travel from 10% (100px cap) to 13% (120px cap), compact drift scale from .35 to .5. Shared depth constant also updates the collision envelope. Build/targeted lint pass; desktop/mobile transition checks verify longer travel and no copy overlap.
- Motion follow-up: extended vertical descent by starting higher within the same safe envelope, curved the scroll path and added velocity-based lean with exponential damping. Wake now emits 22-66 particles/second along movement segments, capped at 260; 40% highlighted bubble rings, 32% tiny stars, remaining dust. Bubbles rise independently and stars drift/fade. Background particles move further with depth. Build and targeted lint pass; browser audit verifies down/up travel, visibility and no text overlap across desktop/mobile.
- Follow-up fix: expanded layout was hiding the entire canvas at scene endpoints. Removed scene opacity/inert suppression, reserved the measured star envelope in compact layouts and reduced vertical drift to 35% there. Copy still fades during transitions. Playwright verified star-center canvas alpha, visible scene, no star/copy overlap and exact endpoints going down/up at 1440x900, 1366x768, 390x844, 320x568 and 844x390. Build and targeted lint pass.
- Existing full-repo lint errors documented in preceding session remain outside scope.
- Real hardware trackpad/mobile not tested; wheel events and emulated touch used.
