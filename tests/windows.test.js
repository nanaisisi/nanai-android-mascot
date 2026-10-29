import assert from "node:assert/strict";
import { test, vi } from "vitest";

globalThis.window = globalThis;
globalThis.prompt = (_msg, def) => def || "90";
let lastAlertMessage = "";
globalThis.alert = (msg) => { lastAlertMessage = String(msg || ""); };
globalThis.confirm = () => true;

let windowsList = [];
const invokedCmds = [];
let dragShouldFail = false;

globalThis.__TAURI_INTERNALS__ = {
	metadata: {
		currentWindow: {
			label: "main",
			startDragging: async () => {
				if (dragShouldFail) throw new Error("drag error");
			},
			center: async () => {
				if (dragShouldFail) throw new Error("center error");
			},
			setOpacity: async () => {},
			setAlwaysOnTop: async () => {},
		},
	},
	invoke: async (cmd, args) => {
		invokedCmds.push({ cmd, args });
		if (cmd === "plugin:window|get_all_windows") return windowsList;
		if (cmd === "get_shiori_status") return false; // test false branch
		return null;
	},
	transformCallback: (cb) => cb,
};

const elements = {};
const getEl = (id) => {
	if (!elements[id]) {
		elements[id] = {
			textContent: "",
			checked: true,
			value: "100",
			classList: {
				classes: new Set(),
				add(c) {
					this.classes.add(c);
				},
				remove(c) {
					this.classes.delete(c);
				},
				contains(c) {
					return this.classes.has(c);
				},
			},
		};
	}
	return elements[id];
};

globalThis.document = {
	getElementById(id) {
		return getEl(id);
	},
	querySelector(sel) {
		return getEl(sel.replace(".", "").replace("#", ""));
	},
	addEventListener() {},
};

const desktopFeatures = await import("../ui/windows/desktop-features.js");
const multiWindow = await import("../ui/windows/multi-window.js");

test("desktop-features.js methods test (covers lines 70-71, 83, 85-87, 172)", async () => {
	desktopFeatures.updateStatusDisplay();
	desktopFeatures.toggleTransparency();
	await desktopFeatures.adjustOpacity("80");
	await desktopFeatures.toggleAlwaysOnTop();
	desktopFeatures.configureTopmost();

	// Test drag and reset position success
	dragShouldFail = false;
	desktopFeatures.enableDragMode();
	desktopFeatures.resetPosition();

	// Test drag and reset position failure (lines 70-71 catch)
	dragShouldFail = true;
	desktopFeatures.enableDragMode();
	desktopFeatures.resetPosition();
	await new Promise((r) => setTimeout(r, 20));

	// Test system tray toggle and configure (lines 83, 85-87)
	desktopFeatures.toggleSystemTray();
	assert.ok(lastAlertMessage.includes("システムトレイ: 表示"));
	desktopFeatures.toggleSystemTray();
	assert.ok(lastAlertMessage.includes("システムトレイ: 非表示"));
	desktopFeatures.configureTray();

	// Test hotkeys
	desktopFeatures.configureHotkeys();
	desktopFeatures.testHotkeys();

	// Test monitoring
	desktopFeatures.enableDesktopMonitoring();
	desktopFeatures.configureMonitoring();

	// Test startup, multi-monitor, performance, interval, and memory limit (line 172)
	desktopFeatures.toggleStartup();
	desktopFeatures.configureMultiMonitor();
	desktopFeatures.setPerformanceMode();
	desktopFeatures.updateInterval();
	desktopFeatures.updateMemoryLimit();
	assert.equal(getEl("memory-value").textContent, "100MB");

	assert.ok(true);
});

test("multi-window.js methods test (covers lines 11, 14-16, 27-41, 107-108, 116-117, 133-134, 152)", async () => {
	vi.useFakeTimers();

	// Test updateWindowStatus active / inactive (lines 27-41)
	multiWindow.updateWindowStatus("ghost", true);
	assert.equal(getEl("ghost-status").textContent, "実行中");
	assert.equal(getEl("ghost-status").classList.contains("active"), true);

	multiWindow.updateWindowStatus("ghost", false);
	assert.equal(getEl("ghost-status").textContent, "停止");
	assert.equal(getEl("ghost-status").classList.contains("active"), false);

	// Test toggleLabeledWindow when window is NOT found (lines 11, 14-16)
	windowsList = [];
	await multiWindow.toggleGhostWindow();

	// Test toggleLabeledWindow when window IS found in window labels list
	windowsList = ["ghost-floating", "desktop-features", "balloon_window_0"];

	// Open ghost window
	await multiWindow.toggleGhostWindow();
	assert.equal(multiWindow.windowStates.ghost, true);

	// Close ghost window
	await multiWindow.toggleGhostWindow();
	assert.equal(multiWindow.windowStates.ghost, false);

	multiWindow.configureGhostWindow();
	await multiWindow.toggleSettingsWindow();
	multiWindow.resetSettings();

	// Test testBalloonWindow timer
	await multiWindow.testBalloonWindow();
	vi.advanceTimersByTime(3500);

	multiWindow.configureBalloon();

	// Test connectYAYA when SHIORI returns false (lines 107-108)
	await multiWindow.connectYAYA();
	assert.equal(multiWindow.windowStates.yaya, false);

	// Test connectYAYA error handling
	const origInvoke = globalThis.__TAURI_INTERNALS__.invoke;
	globalThis.__TAURI_INTERNALS__.invoke = async (cmd) => {
		if (cmd === "get_shiori_status") throw new Error("SHIORI fail");
		return origInvoke(cmd);
	};
	await multiWindow.connectYAYA();

	// Test debugYAYA (lines 116-117)
	multiWindow.debugYAYA();
	assert.ok(lastAlertMessage.includes("YAYAデバッグ"));

	// Test initializeAllWindows & timer (lines 133-134)
	multiWindow.initializeAllWindows();
	vi.advanceTimersByTime(1200);

	// Test minimize, restore (line 152), close all, sliders
	multiWindow.minimizeAllWindows();
	multiWindow.restoreAllWindows();
	multiWindow.closeAllWindows();
	multiWindow.toggleAlwaysOnTop();
	multiWindow.updateOpacity();
	multiWindow.toggleAutoMinimize();
	multiWindow.toggleSystemTray();

	vi.useRealTimers();
	assert.ok(true);
});

test("splashscreen.js covers lines 15 and 26-38 timer delays and completion text", async () => {
	vi.useFakeTimers();
	globalThis.__TAURI__ = { version: "2.0" };

	await import("../ui/windows/splashscreen.js");

	// Advance fake timers through initial 800ms + text steps (600ms/500ms) + final 200ms (lines 15, 26-38)
	vi.advanceTimersByTime(4000);

	assert.equal(
		getEl("loading-text").textContent,
		"スプラッシュ完了 - 手動で閉じてください",
	);

	vi.useRealTimers();
	delete globalThis.__TAURI__;
});
