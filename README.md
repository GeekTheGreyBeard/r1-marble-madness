# Marble Madness — Rabbit R1 Creation

A portrait 240×282, internally scrolling tilt maze with **20 distinct levels** and beginner, standard, and pro difficulties. Each board has alternating full-edge gates requiring cross-field steering. The 60 level/difficulty combinations are certified with radius-expanded collision geometry, active hazard avoidance, no edge-only path, and a 60 Hz dynamic steering simulation that reaches each goal without a lost life (`node dynamics-test.mjs`). `node regression-test.mjs` checks startup/control wiring, tilt path, short/long and powered bounce, difficulty effects, bombs, dizzy safety, final progression, and restart. Simulation is not physical Rabbit R1 validation.

Tap splash, choose difficulty and Start. Enable browser-standard DeviceOrientationEvent tilt from the visible button when supported, or use the touch D-pad / board-edge touch / keyboard arrows and WASD. Center pad or Space bounces; hold 400 ms for a longer bounce. A waffle menu pauses, resumes and restarts. Bombs warn before exploding; dizziness never costs a life. Synthesized audio begins after a gesture.

Hosted creation: https://geekthegreybeard.github.io/r1-marble-madness/ . The `marble-madness-r1-card.json` specifies the release URL; `marble-madness-r1-install-qr.png` encodes it for R1 Creations → Create → Add via QR code. On-device installation, tilt, audio, and playability have not been tested on physical hardware.

Run `node regression-test.mjs && node dynamics-test.mjs`. Serve `index.html` over HTTPS for orientation permissions.
