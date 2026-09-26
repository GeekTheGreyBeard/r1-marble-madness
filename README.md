# Marble Madness · Rabbit R1 Creation

A portrait-first, playful tilt maze for Rabbit R1. Roll a vivid marble through four progressively longer runs. The camera looks ahead in the direction of travel, so the next choice is visible before the marble reaches it. Walls and moving opponents cost a life; tangent contact remains safe.

## controls and options

- **waffle menu:** the in-board `▦` control exposes every game action and option: bounce, super bounce, tilt, audio, pause, and restart.
- **bounce:** clears one board-unit-high obstacle and travels one board unit in the marble's last steering direction.
- **super bounce:** collect orange star orbs, then use **super bounce** to clear and travel up to three board units. It consumes one charge.
- **R1 sensor path:** choose **enable tilt**. The browser requests orientation permission where required and maps `DeviceOrientationEvent.gamma` to horizontal steering and `beta` to vertical steering, with clamping.
- **desktop fallback:** arrow keys or WASD steer; tap/hold a board edge to simulate tilt. Space triggers bounce; Shift+Space triggers super bounce.
- **audio:** enabled from the waffle menu after a user gesture. The game uses lightweight Web Audio synthesized tones for background pulses, jumps, pickups, collisions, and clears. Choose **audio off** to mute.

## gameplay and fairness

The board is 1,400 units tall while the viewport is 520 units tall. Longer routes and moving hazards expand across the four levels. Normal bounce passes only obstacles no taller than one board unit. Super bounce allows up to three units. Enemies cannot be cleared by bouncing; the player must route around them. Collision randomly presents one of three playful visual failures: explosion, crumble, or melt.

## sensor assessment and constraint

The public Rabbit Creations material does not publish a dedicated R1 accelerometer SDK or sensor contract. This project uses only browser-standard `DeviceOrientationEvent` when the deployed R1 creation web view exposes it and permission is granted. It does not claim proprietary accelerometer, crown, haptics, physical tilt, or physical audio support.

## local run and test

```sh
cd /home/gtgb/OS3/r1-marble-madness
python3 -m http.server 8000
# separately
node --check app.js
node --check game.js
node test.mjs
```

The simulated tests cover scrolling camera bounds/look-ahead, normal and super-bounce distances, power consumption, collision/failure state, progression, timer loss, and desktop fallback. Browser testing additionally covers the visible waffle controls and audio mute state. Physical R1 tilt and audio remain pending on-device verification.

## published creation

The HTTPS-hosted Creation is at `https://geekthegreybeard.github.io/r1-marble-madness/`.

`marble-madness-r1-card.json` is the Creation-card configuration and `marble-madness-r1-install-qr.png` encodes that exact configuration. On the R1, use **Creations card → Create tab → Add via QR code**, then scan the QR. Installation and physical-device behavior are unverified until scanned and tested.
