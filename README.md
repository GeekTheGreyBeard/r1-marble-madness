# Marble Madness · Rabbit R1 Creation

A portrait-first tilt maze for Rabbit R1. Roll a vivid marble through four longer runs; the **fixed 240×282 R1 game frame stays in place** while the larger maze scrolls beneath it with directional camera look-ahead. Walls and moving opponents cost a life; tangent contact remains safe.

## fixed R1 display and controls

The page is a single, non-scrolling **240×282** game shell sized for the cited R1 display footprint. The canvas is fixed inside that shell. HUD, notice, tilt button, and waffle button are overlays inside the frame, so controls do not expand the device display. Only the world/map translates when the camera follows the marble.

- **tilt:** the visible `tilt` button at the lower-left of the frame is always available. Tap it to enable the existing motion-control path. Its status is repeated in the waffle menu.
- **waffle menu:** the in-frame `▦` button exposes bounce, super bounce, audio, pause, restart, display mode, and control/status help.
- **desktop fallback:** arrow keys or WASD steer; tap/hold a board edge to simulate tilt. Space triggers bounce; Shift+Space triggers super bounce.
- **bounce:** clears one board-unit-high obstacle and travels one board unit in the last steering direction.
- **super bounce:** collect orange star orbs, then use **super bounce** to clear and travel up to three board units. It consumes one charge.
- **audio:** starts from a user gesture and uses lightweight Web Audio synthesized pulses, jumps, pickups, collisions, and clears. It fails gracefully and can be muted.

## sensor path and limitation

This Creation preserves its browser-standard motion path rather than claiming an undocumented Rabbit-specific API:

1. Tap **tilt** in the fixed game frame.
2. If the runtime implements `DeviceOrientationEvent.requestPermission()`, the game requests it from that button's user gesture and accepts only `granted`.
3. While enabled, `DeviceOrientationEvent.gamma` maps to horizontal steering and `beta` maps to vertical steering; both values are clamped.
4. If the API, permission, or events are unavailable, the game states that tilt is unavailable and leaves keyboard/pointer controls ready.

The current official public Creations page describes QR-installed R1-optimized creations, but it does not document a dedicated Creation accelerometer/sensor SDK or a Rabbit-specific motion contract. The physical R1 sensor path is therefore **not verified** by this release; automated checks simulate the game input/state path only. The browser must serve the Creation over HTTPS for permission-capable runtimes.

## gameplay and fairness

The world is 1,400 logical units tall and the logical camera window is 320×376 (scaled into the 240×282 physical frame). Longer routes and moving hazards expand across four levels. Normal bounce passes only obstacles no taller than one board unit. Super bounce allows up to three units. Enemies cannot be cleared by bouncing; route around them. Collision presents explosion, crumble, or melt failures.

## local run and test

```sh
cd /home/gtgb/OS3/r1-marble-madness
python3 -m http.server 8000
# separately
node --check app.js
node --check game.js
node test.mjs
```

The simulated tests cover the fixed viewport bounds and physical dimensions, scrolling camera/look-ahead, normal and super-bounce distances, power consumption, collision/failure states, progression, timer loss, and desktop fallback. Manual browser checks cover the fixed shell, in-frame waffle menu, visible tilt control, pointer fallback, and permission-state messaging. They do not prove physical R1 motion or audio.

## published creation

The HTTPS-hosted Creation is at `https://geekthegreybeard.github.io/r1-marble-madness/`.

`marble-madness-r1-card.json` is the Creation-card configuration and `marble-madness-r1-install-qr.png` encodes that exact configuration. On R1, use **Creations card → Create tab → Add via QR code**, then scan the QR. Installation and physical-device behavior remain unverified until scanned and tested on-device.
