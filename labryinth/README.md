# Chrono Labyrinth · Premise 04 (Temporality) × Premise 05 (Possibility)

**One-Line Description:** A 2D bird’s-eye survival labyrinth where your movement leaves a fading trail and periodic 10-second Shift Pulses dynamically open and seal corridor Phase Gates, forcing every movement in time to reshape the space of possible routes.

---

## Premises Combined

1. **Premise 04 — Temporality**: *Interaction happens in time. Promise: Design time as much as space.*
   - Implemented in `ruleUpdateTrailMemory()` and `ruleTriggerTemporalShift()` in `script.js`.
   - Survival score scales with time (`SCORE_PER_SECOND`), player movement leaves a 6-second fading **Echo Trail** (`TRAIL_MEMORY_SEC`), and every 10 seconds (`ESCALATION_INTERVAL_SEC`) a **Shift Pulse** either spawns a new Sentinel (**Mode 1: Spawn**) or accelerates Sentinel velocity (**Mode 2: Speed**).
2. **Premise 05 — Possibility**: *A system makes some actions possible and others impossible. Promise: Design the space of possibilities, not the object.*
   - Implemented in `ruleUpdatePhaseGates()`, `ruleIsWalkableTile()`, and `handleManualPhaseFlip()` in `script.js`.
   - Eight strategic **Phase Gates** (`3` = Phase A, `4` = Phase B in `DESIGN.MAZE_LAYOUT`) alternate between **OPEN (`⊶`)** and **PULSE-SEALED (`╬`)** on every Shift Pulse or when the player presses `F` (`FLIP GATES`).
   - **How They Interact (Dependency & Tension):** When the Weaver crosses an open Phase Gate, the **Echo Trail** left on that tile **Echo-Seals (`⛌`)** the gate behind them for `TRAIL_MEMORY_SEC` (6 seconds). This blocks pursuing Sentinels from following through that shortcut, but also eliminates the participant's own possibility of backtracking through that doorway until the memory decays.

---

## How to Use (Desktop, Tablet & Portrait Mobile)

- **Steer Weaver (`◆`)**:
  - **Keyboard**: Press **Arrow Keys (`↑ ↓ ← →`)**.
  - **Touch / Portrait Phone**: **Swipe directly on the maze (`↑ ↓ ← →`)** (continuous swipes without lifting your finger are supported!) or use the **Two-Thumb D-Pad Dock** (automatically enabled on touch and narrow portrait screens, or toggled via **`🎮 DPAD: ON`**).
- **Choose Preset or Random Maze Layout**: Select **Map 1: Classic**, **Map 2: Rings**, or **Map 3: Crossroads** (keys **`1`**, **`2`**, **`3`**) or click **`🎲 RANDOM MAZE (G)`** (key **`G`**) on either the Start Overlay, top toolbar, or thumb dock to procedurally generate a new symmetric, dead-end-free labyrinth.
- **Flip Phase Gates (`⊶` ⇄ `╬`)**: Press **`F`**, click **`⇄ FLIP GATES`**, or perform a **2-finger tap on the maze** to manually invert Phase A and Phase B gates (adds a `+2.0s` time penalty toward the next Shift Pulse and has a `6s` cooldown).
- **Start / Pause / Resume**: Press **`Space`** or **`P`**, or click **`START / PAUSE`**.
- **Reset to `t = 0.0s`**: Press **`R`** or click **`↻ RESET`**.
- **Switch Comparison Modes**: Press **`M`** or click **`MODE 1: SPAWN`** / **`MODE 2: SPEED`**.
- **Live Code Inspector & Reset Defaults**: Press **`C`** or click the **`CODE`** tab to adjust `DESIGN` constants in real time (including `DESIGN.GATE_COUNT` from `0` to `16` gates in balanced pairs), or click **`↻ RESET CODE TO DEFAULTS`** to restore all `DESIGN` parameters to their original settings while keeping the top **`↻ RESET`** button for resetting the active game run.

---

## Credits

- **Course & Toolkit**: Built for **NMED 3203 — Interactive Media Applications Lab**, combining *Premise 04: Temporality (Ghost Chase)* and *Premise 05: Possibility (Sand Box)*.
- **Architecture & Visuals**: Plain HTML5 Canvas, CSS3 variables (Dark Radar & Blueprint Light themes), and vanilla JavaScript (`DESIGN → state → input → rule → output`) with Web Audio API synthesized sound cues and non-color geometric symbols (`◆`, `▲`, `⬢`, `✳`, `⊶`, `╬`, `⛌`).

---

## AI Use Note

- **Tools Used**: Google AI Studio was used to help structure the `DESIGN → state → input → rule → output` architecture, add the Phase Gate possibility layer (`ruleUpdatePhaseGates`), and format the live `CODE` inspector.
- **What Was Corrected / Rejected**:
 *Alternative Input Requirement*: Initial movement relied strictly on physical keyboard arrow keys; we added the toggleable on-screen D-Pad (`#onscreen-dpad`) and `⇄` flip button so the experience is fully playable on phones and touchscreens without a physical keyboard.
