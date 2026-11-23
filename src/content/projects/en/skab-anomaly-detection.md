---
title: SKAB Industrial Anomaly Detection
summary: Real-time anomaly detection on water-circulation sensor data. Rebuilt a course project with four learned models and a leak-free evaluation — detected all 20 unseen files with a 30.5 s median delay.
date: 2026-11-20
period: "May 28 – Jun 17, 2026 (final project) · v2 Nov 20, 2026"
role: Individual · Sensor Big Data Processing (Spring 2026)
tags: [Python, PyTorch, LightGBM, scikit-learn, Time series]
featured: true
---

## Overview

Final project for the Sensor Big Data Processing course (Spring 2026), using the public **SKAB (Skoltech Anomaly Benchmark)** dataset: a water-circulation rig where anomalies are created by closing a valve (20 files — 16 valve1, 4 valve2 — sampled at 1 Hz from 8 sensors).

- **HW4 (course, May 28 – Jun 17, 2026):** picked key sensors with visualization, PCA and derivative analysis, then hand-built a weighted "Hyper Feature" with fixed thresholds to detect the changepoint.
- **v2 (self-directed follow-up, Nov 20, 2026):** replaced each HW4 step with a learned model and fixed the evaluation.

I split the question in two:

- **Goal A — prediction:** using only past data, can we tell that an anomaly will start in H seconds?
- **Goal B — detection:** once an anomaly starts, can we alarm with minimal delay and few false alarms?

## Course context

The course paired 15 lectures based on MIT 6.0002 (*Introduction to Computational Thinking and Data Science*) with five labs and four assignments that took sensor data through a full pipeline: **acquisition → parsing & cleansing → database → visualization → analysis.** The final project is the last step.

| HW | Topic | Data | What I did |
|---|---|---|---|
| 1 | Parsing & cleansing | Harmonic Drive torque | Set the outlier band (≈ ±15 Nm) from the **median** of per-batch max/min, filled gaps with neighbor means, exported the 114 cycles closest to the mean amplitude as JSON |
| 2 | Database design | Accelerometer | Designed a 5-table ERD and built it in MariaDB; queried per-window, per-channel statistics with JOIN / GROUP BY / HAVING |
| 3 | Visualization | SKAB valve faults | Compared line, box, violin, heatmap and pairplot views — no single sensor was enough, and a **pairplot** showed separation better than correlation coefficients |
| 4 | Analysis (final) | SKAB valve anomalies, 20 files | This page |

Lecture ideas drove the v2 decisions:

- **Lecture 10, experimental data — overfitting and cross-validation:** choose models by performance on data they never saw → file-level 5-fold CV.
- **Lecture 13, classification — the accuracy trap and ROC:** on imbalanced data, report ROC-AUC, PR-AUC, F1 and false-alarm counts instead of accuracy.
- **Lecture 15, statistical sins:** plot the data, sanity-check, don't form the hypothesis after seeing the result → re-scored HW4 with false alarms and measured the time leak directly with a control model.
- **Lab 5 — PCA:** PCA finds the direction of greatest variance → why I re-checked HW4's sensor choice with permutation importance.

## What was wrong with HW4

Re-scoring HW4 with false alarms included, the reported 3-of-5 success was really **one file close to success.**

| Issue | Detail |
|---|---|
| Used future data | Deciding time t used the next 50 s → not real-time, ≥50 s delay by design |
| Normalization leak | Test files were z-scored with their own mean and std |
| Uncounted false alarms | Only the changepoint region was checked → alarms 200–516 s early were missed |
| Hand-tuned rules | Weights and thresholds set by hand on a cumulative mean |
| Time-leak risk | In 18 of 20 files the anomaly starts at exactly 600 s |

## How I rebuilt it

| HW4 step | v2 replacement |
|---|---|
| PCA (linear) | LSTM-Autoencoder — trained on normal data, reconstruction error as the score |
| Hand-weighted sum | Logistic Regression |
| Hand-written rules | LightGBM on 56 window statistics |
| Eyeballed patterns | 1D-CNN on raw 60 s × 8-sensor windows |
| Eyeballed sensor choice | Checked with permutation importance |

- **Causal windows:** each decision uses only the past 60 s.
- **No leakage:** baseline = median of each file's first 300 s; scale from training folds only.
- **File-level 5-fold CV:** every file is scored once as unseen data. Thresholds are chosen on held-out validation files by minimizing `mean delay + 120 × false alarms`; an alarm needs 3 consecutive seconds above threshold.
- **Gaps:** interpolated stretches longer than 5 s are flagged, and alarms inside them don't count as false alarms.
- **Time-leak control:** for Goal A, windows are demeaned and a time-only model measures how much elapsed time alone can predict.

## Results

**Detection (Goal B) — achieved**

| Model | Detected | Median delay | False alarms | F1 |
|---|---|---|---|---|
| Logistic Regression | 20/20 | 30.5 s | 21 | 0.778 |
| **LightGBM** | **20/20** | **30.5 s** | **9** | **0.867** |
| 1D-CNN | 20/20 | 40.0 s | 8 | 0.823 |
| LSTM-AE (normal-only) | 17/20 | 64.0 s | 2 | 0.604 |

Aligning all files at anomaly onset showed that the ~30 s delay is not a model limit: it matches **how long the flow takes to actually drop after the valve closes (median 39 s).**

**Prediction (Goal A) — not possible on this data**

Every sensor-based model scored AUC 0.41–0.58 (chance), while the time-only control scored 0.99–1.00. SKAB anomalies are triggered by a person closing a valve at a fixed time, so there is no physical precursor — any "early prediction" on this data most likely comes from leaked time information.

**Checking HW4's sensor choice:** picking flow rate (RateRMS) was right — every model relied on it — but the weight on Accelerometer2RMS had no basis. PCA finds directions of high variance, not directions that separate normal from anomalous.

## What I learned

- **Evaluation comes before the metric.** Fixing future-data use, normalization leakage and uncounted false alarms changed the conclusion entirely.
- If you don't know how the data was generated (anomalies always at 600 s), a model learns the shortcut, not the signal. A control model that measures the leak directly was the most convincing check.
- A negative result ("prediction is impossible here") is still a real finding when it comes from a leak-controlled experiment.

## Limits and next steps

- Only 20 files with one anomaly each, so confidence intervals are wide; generalization to other operating conditions is untested.
- Next: an ensemble of fast LightGBM and low-false-alarm LSTM-AE, and domain adaptation for changing operating conditions.
