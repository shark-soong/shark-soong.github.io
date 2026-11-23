---
title: Starship Belly Flop Landing with Reinforcement Learning
summary: Taught a simulated SpaceX Starship to perform the belly-flop landing (belly-down glide → flip → vertical touchdown) with PPO in Unity ML-Agents on a custom 6-DOF physics model — 85% landing success at the final curriculum stage after ~12M steps.
date: 2026-06-22
period: "Mar – Jun 22, 2026"
role: Team of 4 · Implementation & concept · Convergence Capstone Design 1
tags: [Unity, C#, ML-Agents, PPO, Reinforcement learning, Physics simulation]
featured: true
---

## Overview

A capstone project asking a simple question: **can a rocket learn the belly-flop maneuver from reward design alone**, without PID loops or trajectory planning? Real vehicles rely on carefully tuned control laws; we built a detailed physics environment and let a PPO agent work out throttle, thrust vectoring and flap control by itself.

- Team of four, working through every stage together. **My role: implementation and the project concept** — both the original idea (semiconductor fab scheduling) and the belly-flop pivot were my proposals.
- Unity + ML-Agents, using a Starship SN20 3D model with our own physics.
- Final presentation: June 22, 2026.

## What we built

**Physics (C#)** — We turned off Unity's built-in gravity, center-of-mass and inertia, and wrote our own 6-DOF model:

- Mass and center of mass shift as fuel burns, and the inertia tensor is recomputed every step.
- Drag interpolates between belly-on and nose-on areas by angle of attack. The simulated belly-down terminal velocity (~77 m/s) lands close to the real vehicle's (~66 m/s).
- Four flaps (aft ones 3.5× stronger, giving shuttlecock-like stability), three gimbaled engines.

**MDP**

- 20-dimensional normalized observations: position, velocity, body axes, angular rate, altitude, fuel, current commands.
- MultiDiscrete actions {3, 3, 3}: throttle (off / 40% / 100%), pitch gimbal (0 / ±15°), pitch flaps.
- Landing counts only if four conditions hold at touchdown: speed < 6 m/s, tilt ≤ 10°, angular rate ≤ 0.5 rad/s, within 20 m of the pad.

**Reward**

- Potential-based shaping on speed, horizontal distance and altitude (Ng et al., 1999).
- A smoothstep tilt schedule for the flip.
- One-time bonuses at the 500 m and 150 m phase boundaries.
- A soft-gated touchdown score that can't be high unless the agent actually slows down.
- Penalties for chattering, climbing, spinning, leaving the area and hovering.

**Training** — PPO with a curriculum that starts with low, vertical drops and works up to tilted, offset, fast-falling spawns.

## Making it learnable

The first design was too ambitious to train:

- **Actions:** 162 combinations across five branches (yaw gimbal, roll flaps) could land but never produced a belly flop, so we restricted control to the pitch plane — 27 combinations.
- **Discretization:** a paper suggested 11 levels per action; that didn't learn, and 3 did.
- **Curriculum:** a 12-stage curriculum became 5.

Reward weights were re-tuned repeatedly by watching rollouts for overshoot and hovering.

## Results

- **~12M steps**, landing success **85%** at the final stage (0–500 m range).
- Cumulative reward jumped from ~15 to 40+ around 3.7M steps as the curriculum advanced, then converged near 57.
- Touchdown quality improved over training: pad error ~13 → 5 m, tilt ~5° → 1.7°, impact speed around 2 m/s.

## Limits and next steps

- **Actuator chatter:** discrete actions make the gimbal and flaps snap between −15° and +15°, which real actuators can't follow.
- **Sim-to-real gap:** no wind, sensor noise or fuel slosh.
- **Scope:** training covered only 0–500 m in the pitch plane.
- **Proposed follow-up:** continuous actions, roll/yaw control, and the full flight from launch to landing.

## What I learned

- In RL, the MDP — observations, actions, rewards — matters more than the algorithm.
- When a problem won't learn, shrink it until it does, then grow it back.
- Sanity-check the simulator against reality (terminal velocity) before trusting the agent.
