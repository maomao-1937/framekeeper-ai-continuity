# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Delegated: a dependency-light static web application with plain HTML, CSS, and JavaScript, plus Node's built-in test runner. This keeps the MVP clone-and-run simple and makes GitHub Pages-compatible hosting possible later without making deployment part of today's claim.

## Users

Inferred from today's brief and trend research: independent AI-video and AI-short-drama creators who generate a story across multiple shots and need to keep characters, wardrobe, props, places, and time-of-day details consistent.

## Product Purpose

FrameKeeper turns a small production bible and a list of shots into an immediate continuity report. It highlights contradictions and missing anchors, then composes prompt-ready shot text that carries the approved details forward. Success means a creator can load the included demo, understand the drift within seconds, correct it, and export a reusable continuity pack without an account or API key.

## Positioning

Unlike storyboard generators, FrameKeeper does not invent the story or hide decisions behind a model. It is a deterministic, local-first continuity layer: creators define canonical facts once, every flagged mismatch explains the exact field and expected value, and exports remain portable JSON and Markdown.

## Operating Context

Creators use the tool between script breakdown and image/video generation. They maintain canonical character and scene facts, review a shot list, resolve flagged drift, copy locked prompts into any generation tool, and export the project for later sessions or collaborators.

## Capabilities and Constraints

- Fully local in the browser; no uploads, accounts, telemetry, paid APIs, or model calls.
- Includes a synthetic demo project, editable bible fields, editable shots, explainable checks, prompt composition, JSON import/export, and Markdown export.
- The MVP checks explicit structured facts. It does not inspect generated video frames or infer facts from free-form prose.
- Today's authorized delivery is a new public repository under `maomao-1937`; deployment to another platform is out of scope.

## Evidence on Hand

- TrendRadar snapshot dated 2026-10-07 includes the social signal “看完AI短剧只想说真人短剧完了”.
- The GitHub discovery snapshot dated 2026-10-07 shows `harry0703/MoneyPrinterTurbo`, an AI short-video workflow project, at 128,964 stars and active the same day.
- GitHub repository searches found storyboard-generation projects but no exact match for a deterministic browser continuity checker plus prompt-lock workflow. This is a search result, not proof that no adjacent project exists.
- No customer testimonials, usage metrics, or adoption claims exist and none may be fabricated.

## Product Principles

1. Show the mismatch and its source; never return a mysterious score.
2. Keep creative decisions with the creator and make every generated prompt editable.
3. Work offline and export ordinary files that outlive the tool.
4. Demonstrate the complete loop with realistic synthetic production data.
5. Prefer one dependable continuity check over broad but unverifiable “AI magic”.

## Accessibility & Inclusion

The web interface must remain keyboard-operable, preserve visible focus, not rely on color alone for issue severity, respect reduced-motion preferences, and function at desktop and mobile widths.
