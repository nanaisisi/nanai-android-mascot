/**
 * @file tests/windows/multi-window.test.ts
 * @brief multi-window.js の単体テストおよびカバレッジテスト
 */

import assert from "node:assert/strict";
import { test, vi } from "vitest";
import { createWindowsMockEnvironment } from "./helpers.js";

test("multi-window.js 100% coverage", async () => {
	vi.useFakeTimers();
	const env = createWindowsMockEnvironment();

	const multiWindow = await import("../../ui/windows/multi-window.js");

	// Update window status with and without DOM elements
	multiWindow.updateWindowStatus("ghost", true);
	assert.equal(env.getEl("ghost-status")?.textContent, "実行中");
	multiWindow.updateWindowStatus("ghost", false);
	assert.equal(env.getEl("ghost-status")?.textContent, "停止");

	env.returnNullElements = true;
	multiWindow.updateWindowStatus("ghost", true);
	multiWindow.updateWindowStatus("ghost", false);
	env.returnNullElements = false;

	// findWindow when Tauri is NOT available
	delete (globalThis as unknown as { __TAURI__?: unknown }).__TAURI__;
	delete (globalThis as unknown as { __TAURI_INTERNALS__?: unknown })
		.__TAURI_INTERNALS__;
	await multiWindow.toggleGhostWindow();
	// connectYAYA when Tauri is NOT available (lines 109-111)
	await multiWindow.connectYAYA();
	assert.equal(multiWindow.windowStates.yaya, false);

	// Restore Tauri
	env.setupEnvironment();

	// toggleLabeledWindow when window is NOT found in list
	env.windowsList = [];
	await multiWindow.toggleGhostWindow();

	// toggleLabeledWindow when window IS found: open -> close -> error (line 27)
	env.windowsList = ["ghost-floating", "desktop-features", "balloon_window_0"];
	multiWindow.windowStates.ghost = false;
	env.windowCmdShouldFail = false;
	await multiWindow.toggleGhostWindow(); // show, unminimize, setFocus
	assert.equal(multiWindow.windowStates.ghost, true);

	await multiWindow.toggleGhostWindow(); // hide
	assert.equal(multiWindow.windowStates.ghost, false);

	env.windowCmdShouldFail = true;
	await multiWindow.toggleGhostWindow(); // triggers catch (line 27)
	env.windowCmdShouldFail = false;

	multiWindow.configureGhostWindow();
	await multiWindow.toggleSettingsWindow();

	// resetSettings confirm true and false
	env.confirmReturn = true;
	multiWindow.resetSettings();
	env.confirmReturn = false;
	multiWindow.resetSettings();

	// testBalloonWindow when window exists on timeout vs does not exist on timeout
	env.windowsList = ["balloon_window_0"];
	await multiWindow.testBalloonWindow();
	await vi.advanceTimersByTimeAsync(3500);

	env.windowsList = ["balloon_window_0"];
	await multiWindow.testBalloonWindow();
	env.windowsList = [];
	await vi.advanceTimersByTimeAsync(3500);

	multiWindow.configureBalloon();

	// connectYAYA: connected=true, connected=false, and error
	env.shioriShouldFail = false;
	env.shioriStatusReturn = true;
	await multiWindow.connectYAYA();
	assert.equal(multiWindow.windowStates.yaya, true);

	env.shioriStatusReturn = false;
	await multiWindow.connectYAYA();
	assert.equal(multiWindow.windowStates.yaya, false);

	env.shioriShouldFail = true;
	await multiWindow.connectYAYA();
	env.shioriShouldFail = false;

	multiWindow.debugYAYA();

	// initializeAllWindows & timer
	multiWindow.initializeAllWindows();
	await vi.advanceTimersByTimeAsync(1200);

	// minimize, restore, closeAllWindows (confirm true and false)
	multiWindow.minimizeAllWindows();
	multiWindow.restoreAllWindows();
	env.confirmReturn = true;
	multiWindow.closeAllWindows();
	env.confirmReturn = false;
	multiWindow.closeAllWindows();

	multiWindow.toggleAlwaysOnTop();
	multiWindow.updateOpacity();
	multiWindow.toggleAutoMinimize();
	multiWindow.toggleSystemTray();

	vi.useRealTimers();
});
