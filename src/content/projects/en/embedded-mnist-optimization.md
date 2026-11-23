---
title: MNIST Inference Optimization on an MCU (TVM · TFLM · CMSIS-NN)
summary: Cut on-device inference for the same MNIST model on an Arduino Nano 33 BLE (Cortex-M4) from 909.5 ms (TVM plain C) to 100.3 ms (optimized TFLM) — about 9.1× — across an embedded systems design course.
date: 2026-06-18
period: "Mar – Jun 18, 2026 · project May 28 – Jun 18"
role: Individual · Embedded Systems Design (Spring 2026)
tags: [C, C++, Arduino, TensorFlow Lite Micro, CMSIS-NN, Apache TVM, Quantization]
featured: true
---

## Overview

Three assignments and a term project for Embedded Systems Design, all on an **Arduino Nano 33 BLE** (nRF52840, Cortex-M4F @ 64 MHz, 1 MB Flash, 256 KB SRAM, DSP/SIMD extensions).

| Stage | Topic | Result |
|---|---|---|
| HW2 | Designed an MNIST CNN, ported it to the board, INT8-quantized it | Accuracy kept at 0.9924; ~600 ms → ~190 ms |
| HW3 | Compiled the model to C with Apache TVM, then hand-optimized the code | 909,532 µs → 526,122 µs (1.73×) |
| Project | Profiled and modified the TFLM runtime and CMSIS-NN kernels | 238,811 µs → ~100,300 µs (2.38×), 30/30 correct |

HW3 and the project used the byte-identical model file, so the results compare directly: CMSIS-NN's SIMD path alone beat my best hand-tuned plain-C version by 3.8×.

## Term project: TFLM runtime optimization

**Constraints:** loop unrolling and SIMD were mandatory, accuracy had to stay ≥ 0.98, and progress was graded at three checkpoints (Jun 4, 11, 18).

**Finding the bottleneck**

- Hooked `tflite::MicroProfiler` into the interpreter: the five CONV layers took 95.5% of the time, and the last two alone took 73.6% as input channels grew 1 → 64.
- Traced the Invoke call path down to `arm_convolve_s8` (im2col) and `arm_nn_mat_mult_kernel_s8_s16` (the SMLAD inner loop).

**Optimizations**

| Round | Change | Time |
|---|---|---|
| Baseline | AllOpsResolver, 100 KB arena, model in Flash | 238,811 µs |
| 1 | Fully unrolled the 3×3 im2col; widened the GEMM loop from 4 to 8 columns (16 SMLADs per iteration); specialized fixed kernel size and batch | 154,589 µs (−35%) |
| 2 | Switched the toolchain from -Os to -O2/-O3 + `-funroll-loops` on the hot files; tried the D2I convolution scheme from a 2024 thesis and rejected it (slower) | 129,000 µs |
| 3 | Copied the model into SRAM (shrank the arena 100 → 20 KB, trimmed the op resolver to four ops); rewrote MEAN as an integer-only path (~8 ms → 0.3 ms); removed dead branches | ~100,300 µs |

- Verified on the first 30 MNIST test images: 30/30 correct, with per-image latency steady at 100.26–100.31 ms.
- A 4-pixel SIMD variant ran out of registers and was slower (127 ms), so I reverted it.

## A mistake I caught

In round 2 I reported 74 ms from a custom `read_and_pad` replacement. In round 3 I re-measured accuracy and found it was answering only 2 of 30 images correctly — the change had silently halved the SMLAD count. I corrected the round-2 result to 129 ms. The lesson: **build a bit-exact golden test against the original kernel before optimizing.** Every later change was checked for correctness, not just speed.

## Earlier assignments

- **HW2 — CNN design and quantization:** searched from an overfitting class model through a too-large BN model to a compact 3-conv network (42k parameters, ~1.65M MACs). Found that batch-norm collapsed accuracy to 0.1 after INT8 quantization and removed it. Full-integer PTQ shrank the model 172 KB → 49 KB and ran ~3.2× faster.
- **HW3 — TVM to C:** built with an AOT/CRT C target for Cortex-M4, wired up the runtime headers by hand, and applied loop unrolling, invariant hoisting and strength reduction to the hottest conv layer. Unrolling did almost all the work (−41.9%); TVM's own opt_level=3 only reached 1.16×.

## What I learned

- Measure → isolate the bottleneck → change → re-measure. The same unrolling saved 381 ms in a hot layer and 5 ms in a cold one.
- Library SIMD paths beat hand-written plain C; check what the hardware can already do before writing code.
- Memory placement (Flash vs SRAM) and compiler flags mattered as much as code changes.
- Correctness first: I presented a fast but wrong result at one checkpoint. Next time I'd verify assumptions with objdump and the DWT cycle counter instead of estimating.
