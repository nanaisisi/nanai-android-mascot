# Window Dragging and Menu Interaction Analysis

## Overview
This document summarizes the investigation into the interaction conflict between CSS window dragging (`-webkit-app-region: drag` / `app-region: drag`) and custom menu opening (`contextmenu` / right-click / long-press) in Tauri webview windows.

## Problem Statement
1. **Window Dragging Issue**: Users experienced difficulty moving specific auxiliary windows (such as character or menu windows).
2. **CSS Drag Intervention**: Adding `-webkit-app-region: drag` / `app-region: drag` enabled window movement.
3. **Menu Opening Failure**: However, applying `app-region: drag` caused right-click, contextmenu, and pointer events on the container to be captured by the OS window manager for dragging, preventing the custom in-house menu window from opening.

## Root Cause Analysis
- In Chromium / WebView2 / Tauri, CSS `-webkit-app-region: drag` instructs the WebView to forward mouse events directly to the operating system window manager to handle window dragging.
- As a side effect, DOM event listeners (`mousedown`, `click`, `contextmenu`, `pointerdown`) on elements marked as `drag` are bypassed or swallowed, disabling interactive UI behaviors like opening context menus.

## Proposed Solutions & Best Practices
1. **Avoid CSS `app-region: drag` on Interactive Elements**:
   - Keep interactive display areas and menu containers strictly non-draggable (`app-region: no-drag`).
2. **Use Programmatic Tauri Dragging (`startDraggingWindow`)**:
   - Handle window dragging programmatically in TypeScript/JavaScript via Tauri's `startDraggingWindow()` API on `mousedown` / `pointerdown` for left-clicks (`button === 0`) after passing transparency and movement threshold checks.
   - Leave right-clicks (`button === 2`) and context menus untouched so `openCharacterMenu` executes reliably without triggering window drag sessions.

## Verification Plan
- Verify that left-click drag moves the window smoothly using `startDraggingWindow()`.
- Verify that right-click / contextmenu / long-press correctly triggers `openCharacterMenu` and displays `menu_window`.
