# Marble Madness · Rabbit R1 Creation

A portrait-first tilt maze for Rabbit R1. Roll a vivid marble through four longer runs; the **fixed 240×282 R1 game frame stays in place** while the larger maze scrolls beneath it. The marble remains near the center of the display with only a modest forward look-ahead. Solid walls, spikes, moving opponents and grounded pit falls cost a life; tangent contact remains safe. Rebound walls and bumpers safely reflect the marble.

## launch flow and fixed display

The page is a single, non-scrolling **240×282** game shell. The game begins on a Marble Madness splash screen. Tap anywhere on the splash (including **tap to continue**), then choose **start game** from the main menu. Once running, the board fills the usable display; its compact HUD and controls are overlays, not a header or separate frame.

- **waffle menu:** tap `☰` during play to open a full overlay above the board. It pauses simulation, timer, synthesized audio, and input. Choose **continue**, the close control, or press Escape to dismiss it and resume.
- **tilt:** the visible `tilt` button at the lower-left is available while playing. Tap it to enable the browser-standard motion-control path. Its state is repeated in the waffle menu.
- **desktop fallback:** arrow keys or WASD steer; tap/hold a board edge to simulate tilt. Space triggers bounce; hold Space for a long bounce. A collected super charge automatically doubles either distance.
- **circular D-pad:** in touch steering, each outer sector rolls in its arrow direction and the center bounces. Once tilt is enabled, directional sectors disappear and only a visible bounce button remains.
- **bounce:** release the D-pad center button before 400 ms for one board unit, or at/after 400 ms for three board units in the last steering direction. One board unit is 22 logical pixels.
- **super bounce:** collect orange star orbs to double either bounce distance to two or six units. Each successful charged bounce consumes one charge; a blocked bounce consumes none. Swept collision prevents skipping tall walls and opponents.
- **audio:** starts from a user gesture and uses lightweight Web Audio synthesized pulses, jumps, pickups, collisions, and clears. It fails gracefully and can be muted.

## sensor path and limitation

This Creation preserves its browser-standard motion path rather than claiming an undocumented Rabbit-specific API:

1. Tap **tilt** in the fixed game frame.
2. If the runtime implements `DeviceOrientationEvent.requestPermission()`, the game requests it from that button's user gesture and accepts only `granted`.
3. While enabled, `DeviceOrientationEvent.gamma` maps to horizontal steering and `beta` maps to vertical steering; both values are clamped.
4. If the API, permission, or events are unavailable, the game states that tilt is unavailable and leaves keyboard/pointer controls ready.

The physical R1 sensor and audio paths are **not verified** by this release. Automated checks simulate the game input/state path only. The browser must serve the Creation over HTTPS for permission-capable runtimes.

## gameplay and fairness

The world is 1,400 logical units tall and the logical camera window is 320×376 (scaled into the 240×282 physical frame). The eased camera translates the map internally; neither the physical frame nor its canvas expands. Choose beginner, standard, or pro on the start screen independently of the four board levels. Beginner has harmless outer walls and no active black holes; standard outer walls repel and black holes pull; pro outer walls cost a life and black-hole pull doubles. Sand slows, and merry-go-rounds rotate steering briefly with a visible dizzy indicator. Each board entry and completion has a short warp transition. Four progressive routes add angry moving marble opponents and power-ups. Violet-black bottomless pits cost a life on grounded overlap; jumping over them is safe. Gold half walls are lower than a normal wall and clearable with bounce, while teal rebound walls reflect incoming motion without costing a life unless jumped over. Blue ice preserves momentum, brown sticky patches slow it, cyan bumpers push away, and red spikes hurt unless airborne. Normal bounce passes obstacles no taller than one board unit. Super bounce travels two or six units depending on press duration. Enemies cannot be cleared by bouncing; route around them. Failures include a fall as well as explosion, crumble, or melt.

## local run and test

```sh
cd /home/gtgb/OS3/r1-marble-madness
python3 -m http.server 8000
# separately
node --check app.js
node --check game.js
node test.mjs
```

The checks cover startup/menu markers, hidden overlays, menu pause model, fixed physical viewport values, scrolling camera/look-ahead, short/long normal and super-bounce distances, difficulty matrix, gravity, sand and merry-go-round hazards, warp transitions, power consumption, each new obstacle interaction, restart to level one, tilt/touch pad modes, collision/failure states, progression, timer loss, angry marble rendering, and desktop fallback. The earlier release was exercised in a 240×282 touch browser through splash, start, active timer, waffle pause, and resume. Physical R1 startup, motion, and audio for this update still require on-device confirmation.

## published creation

The HTTPS-hosted Creation is at `https://geekthegreybeard.github.io/r1-marble-madness/`.

`marble-madness-r1-card.json` is the Creation-card configuration and `marble-madness-r1-install-qr.png` encodes that exact configuration. The release query on the card URL forces a fresh entry document rather than an earlier cached page; an existing installation may need the updated QR scanned again. The app now explicitly hides inactive overlay panels with `[hidden]`, uses a bundled classic script for older embedded browsers, and raises the waffle control above the D-pad. On R1, use **Creations card → Create tab → Add via QR code**, then scan the QR. Installation and physical-device behavior remain unverified until scanned and tested on-device.
