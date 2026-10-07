---
name: FrameKeeper
description: A local-first continuity sheet for multi-shot AI video scenes.
colors:
  ground: "#edf3f2"
  paper: "#fcfefd"
  paper-alt: "#f5f9f8"
  ink: "#193238"
  muted: "#52686c"
  line: "#c7d6d4"
  line-strong: "#9cb5b1"
  teal: "#176d65"
  teal-soft: "#e0efeb"
  coral: "#a84128"
  coral-soft: "#faebe6"
  amber: "#80602b"
  amber-soft: "#f7efda"
typography:
  display:
    fontFamily: "Avenir Next, Avenir, Segoe UI, sans-serif"
    fontSize: "clamp(32px, 3.5vw, 54px)"
    fontWeight: 750
    lineHeight: 1.04
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Avenir Next, Avenir, Segoe UI, sans-serif"
    fontSize: "22px"
    fontWeight: 750
    lineHeight: 1.12
  body:
    fontFamily: "Avenir Next, Avenir, Segoe UI, sans-serif"
    fontSize: "13px"
    lineHeight: 1.45
  label:
    fontFamily: "Avenir Next, Avenir, Segoe UI, sans-serif"
    fontSize: "11px"
    fontWeight: 800
    lineHeight: 1.3
    letterSpacing: "0.09em"
rounded:
  field: "2px"
  square: "0px"
spacing:
  tight: "8px"
  field: "18px"
  panel: "25px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.square}"
    padding: "9px 13px"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "9px 13px"
  field-control:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "10px 11px"
---

# Design System: FrameKeeper

## Overview

**Creative North Star: "The continuity supervisor's script breakdown sheet"**

FrameKeeper is an editing instrument, not a marketing dashboard. Its shot strip is a compact map of a scene; the bible, active shot, and issue/prompt panels expose the same anchors side by side. Ruled fields, large shot numbers, and hairline dividers make drift easy to find without visual noise. The demo contains synthetic content only.

**Key characteristics:** precise, quiet, editable, and visibly traceable from a shot field to its issue and locked prompt.

## Colors

Sea-glass teal signals approved continuity and selected navigation. Signal coral marks a field that contradicts the bible; amber marks an omitted required field. Deep charcoal carries primary text. Pale blue-gray ground and cool paper keep long editing sessions legible. Color is paired with explicit text such as “drift” and “missing”; it is not the only status cue.

## Typography

Avenir Next with system sans-serif fallbacks keeps the sheet compact and readable. The scene title uses the display scale. Panel titles are 20–22px; form labels are uppercase 11px with tracking; body controls use 13px. Large two-digit shot numbers anchor navigation. Exported prompts use a system monospace stack to distinguish generated text from editable metadata.

## Layout

The masthead and scene title lead into a full-width, horizontally scrollable shot strip. At wide widths the workspace uses three ruled columns: bible, shot editor, and checks/prompt. Below 1150px the output spans the width beneath two editing columns. Below 760px the output comes first, followed by shot editor and bible, so mobile users can inspect the current issue without scrolling through the entire form. The page itself must not overflow horizontally at 390px or 1440px; only the shot strip may scroll sideways.

## Elevation & Depth

The workspace is flat. Borders, paper tones, and one-pixel gutters establish grouping. Only transient feedback toasts have a soft shadow. Do not introduce raised card stacks or decorative glow.

## Shapes

Buttons and sheet panels are square. Inputs use a restrained 2px radius. The circular save dot and success mark are functional status details, not a general rounded-card language.

## Components

- Shot tab: large number, concise action, explicit clear/drift/missing label, with a bottom rule for the active tab.
- Field control: visible label, pale border, stronger teal focus state, and enough space for long descriptions.
- Issue row: actual versus expected value and a repair action; missing and contradictory values use distinct wording and colors.
- Locked prompt: read-only monospace output with a dedicated copy action.
- Scene actions: compact square controls for import, export, and project reset, with an emphasized export pack action.

## Do's and Don'ts

- Do preserve the direct edit → issue → prompt feedback loop.
- Do use semantic labels and visible keyboard focus.
- Do use responsive reordering only when it improves the active repair task.
- Don't replace real empty/error states with fake metrics or illustrative dashboard cards.
- Don't use blue-purple gradients, decorative badges, or unexplained icon glyphs.
