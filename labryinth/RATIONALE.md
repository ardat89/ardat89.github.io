# Design Rationale: Chrono Labyrinth (04 Temporality × 05 Possibility)

**1. Idea.** *Chrono Labyrinth* is a 2D bird’s-eye survival maze where the participant steers the Weaver (`◆`) away from geometric Sentinels (`▲`, `⬢`, `✳`) using arrow keys or on-screen directional controls. Rather than navigating a static map, the participant’s movement history and survival duration continuously reconfigure which corridors are open or impassable.

**2. Premise A and B.** The experience combines **Premise 04: Temporality** (“interaction happens in time”) and **Premise 05: Possibility** (“a system makes some actions possible and others impossible”). Temporality lives in `ruleUpdateTrailMemory()` and `ruleTriggerTemporalShift()`: the player leaves a fading six-second Echo Trail and faces a Shift Pulse every ten seconds that either spawns a new Sentinel (Mode 1) or increases Sentinel velocity (Mode 2). Possibility lives in `ruleUpdatePhaseGates()` and `ruleIsWalkableTile()`: eight corridor Phase Gates alternate between open (`⊶`) and sealed (`╬`) on every Shift Pulse, or when the player presses `F` to manually invert gate polarity at the cost of advancing the clock by two seconds. Crucially, the two premises depend on each other: crossing an open gate leaves an Echo Trail on its threshold that Echo-Seals (`⛌`) the doorway for six seconds. Using a shortcut blocks pursuers behind you, but simultaneously eliminates your own possibility of backtracking.

**3. Theory.** First, Gaver’s (1991) concept of *sequential and perceptible affordances*—where acting on one perceived possibility reveals or forecloses subsequent possibilities over time—shaped our three distinct non-color gate states (`OPEN ⊶`, `PULSE_SEALED ╬`, and `ECHO_SEALED ⛌` with a radial decay ring). A limit of Gaver’s framework is that it treats affordances as stable physical properties; in our maze, an open corridor’s passability is ephemeral and reverses mid-approach. Second, Bogost’s (2007) concept of *procedural rhetoric and possibility space*—that arguments are made through rule constraints rather than static visuals—shaped our `TRAIL_SEALS_GATES` rule, where past movement literally narrows future spatial freedom. As a counterpoint, strict procedural constraints can feel punishing when multiple Sentinels converge, prompting us to add the manual Phase Flip (`F`) escape valve.

**4. What I learned.** During testing, locking a gate the instant a player touched it trapped them inside the doorway. Observing this, I revised `ruleUpdatePhaseGates()` so gates arm upon entry and seal only after the player steps onto an adjacent tile.

---

### Live Link & References

- **Live Experience Link**: `ardat89.github.io/labryinth`
- Bogost, I. (2007). *Persuasive Games: The Expressive Power of Videogames*. MIT Press. https://mitpress.mit.edu/9780262514880/persuasive-games/
- Gaver, W. W. (1991). Technology affordances. In *Proceedings of the SIGCHI Conference on Human Factors in Computing Systems (CHI ’91)* (pp. 79–84). ACM. https://doi.org/10.1145/108844.108856
