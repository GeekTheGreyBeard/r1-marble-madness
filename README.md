# Marble Madness · Rabbit R1 Creation

A portrait-first tilt maze for Rabbit R1. Guide the steel marble to the orange exit through four increasingly difficult mazes. Walls and moving opponents cost one life; tangent contact is intentionally safe, so a player is not punished for a near miss. Each level grants three lives and restarts at its start after a collision.

## controls

- **R1 sensor path:** select **enable tilt**. The app requests browser orientation permission when the runtime requires it, then maps `DeviceOrientationEvent.gamma` to horizontal steering and `beta` to vertical steering. Values are capped to prevent extreme input.
- **R1 controls:** pause and restart are visible 44px targets. They remain accessible by touch; the R1 crown can move focus to them where the R1 web runtime maps crown movement to browser focus.
- **desktop fallback:** arrow keys or WASD steer. Click/tap and hold toward an edge of the board to simulate a tilt direction.

## sensor assessment and constraint

The public Rabbit Creations gallery describes creations as experiences made for and installed on R1, but its currently exposed page does not publish a dedicated, documented R1 accelerometer SDK or sensor contract. This project therefore uses the browser-standard `DeviceOrientationEvent` only when the deployed R1 creation web view exposes it and permission is granted. It does **not** claim access to a proprietary R1 accelerometer API, raw accelerometer samples, the crown, or haptics. If orientation is unavailable, denied, or not forwarded by the R1 runtime, the on-screen desktop-style fallback remains playable.

Before installing on R1, host this folder over HTTPS and verify the creation runtime provides device orientation events. On-device validation should cover permission behavior, the axis signs in portrait orientation, sensitivity, and whether crown navigation reaches the controls. No GitHub repository, public gallery entry, Rabbit resource, or credits were created.

## local run

```sh
cd /home/gtgb/OS3/r1-marble-madness
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## test

```sh
node test.mjs
```

The automated tests are simulated JavaScript tests. They cover level escalation, wall/opponent geometry helpers, safe tangent contacts, respawn/life rules, clear/win progression, timer loss, and the normalized keyboard/touch input path. They do not verify an R1 device sensor.

## project layout

- `index.html` — portrait game shell and R1 controls
- `app.js` — rendering, controls, browser orientation adapter, pause/restart
- `game.js` — deterministic game physics and level data
- `styles.css` — responsive portrait visual system and theme toggle
- `test.mjs` — simulated logic tests
