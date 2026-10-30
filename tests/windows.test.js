import assert from "node:assert/strict";
import { test, vi } from "vitest";

globalThis.window = globalThis;
let promptReturn = "90";
globalThis.prompt = (_msg, def) =>
	promptReturn !== undefined ? promptReturn : def;
let lastAlertMessage = "";
globalThis.alert = (msg) => {
	lastAlertMessage = String(msg || "");
};
let confirmReturn = true;
globalThis.confirm = () => confirmReturn;

let windowsList = [];
const invokedCmds = [];
let windowCmdShouldFail = false;
let shioriStatusReturn = false;
let shioriShouldFail = false;

const defaultTauriInternals = {
	metadata: {
		currentWindow: {
			label: "main",
		},
	},
	invoke: async (cmd, args) => {
		invokedCmds.push({ cmd, args });
		if (cmd === "plugin:window|get_all_windows") return windowsList;
		if (
			cmd.startsWith("plugin:window|") &&
			cmd !== "plugin:window|get_all_windows"
		) {
			if (windowCmdShouldFail) throw new Error(`${cmd} failed`);
			return null;
		}
		if (cmd === "get_shiori_status") {
			if (shioriShouldFail) throw new Error("SHIORI fail");
			return shioriStatusReturn;
		}
		return null;
	},
	transformCallback: (cb) => cb,
};

globalThis.__TAURI_INTERNALS__ = defaultTauriInternals;

const elements = {};
let returnNullElements = false;
const getEl = (id) => {
	if (returnNullElements) return null;
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

const domLoadedListeners = [];
globalThis.document = {
	getElementById(id) {
		return getEl(id);
	},
	querySelector(sel) {
		return getEl(sel.replace(".", "").replace("#", ""));
	},
	addEventListener(type, cb) {
		if (type === "DOMContentLoaded") {
			domLoadedListeners.push(cb);
		}
	},
};

const desktopFeatures = await import("../ui/windows/desktop-features.js");
const multiWindow = await import("../ui/windows/multi-window.js");

test("desktop-features.js 100% coverage", async () => {
	// Trigger DOMContentLoaded listeners (lines 208-209)
	for (const cb of domLoadedListeners) cb();

	// Status display when elements exist vs when elements are null
	returnNullElements = true;
	desktopFeatures.updateStatusDisplay();
	returnNullElements = false;

	// Transparency toggle ON and OFF
	desktopFeatures.toggleTransparency();
	assert.equal(desktopFeatures.featureStates.transparency, true);
	desktopFeatures.toggleTransparency();
	assert.equal(desktopFeatures.featureStates.transparency, false);

	// adjustOpacity: explicit value, prompt default, invalid/out-of-range values
	await desktopFeatures.adjustOpacity("80");
	promptReturn = "75";
	await desktopFeatures.adjustOpacity();
	await desktopFeatures.adjustOpacity("10"); // < 30 early return
	await desktopFeatures.adjustOpacity("150"); // > 100 early return
	await desktopFeatures.adjustOpacity("invalid"); // NaN early return

	// AlwaysOnTop success and failure (line 58)
	windowCmdShouldFail = false;
	await desktopFeatures.toggleAlwaysOnTop();
	windowCmdShouldFail = true;
	await desktopFeatures.toggleAlwaysOnTop();

	desktopFeatures.configureTopmost();

	// Drag and resetPosition success and failure (lines 71, 77)
	windowCmdShouldFail = false;
	desktopFeatures.enableDragMode();
	desktopFeatures.resetPosition();
	await new Promise((r) => setTimeout(r, 10));

	windowCmdShouldFail = true;
	desktopFeatures.enableDragMode();
	desktopFeatures.resetPosition();
	await new Promise((r) => setTimeout(r, 20));
	windowCmdShouldFail = false;

	// System tray toggle ON and OFF
	desktopFeatures.toggleSystemTray();
	assert.ok(lastAlertMessage.includes("システムトレイ: 表示"));
	desktopFeatures.toggleSystemTray();
	assert.ok(lastAlertMessage.includes("システムトレイ: 非表示"));
	desktopFeatures.configureTray();

	// Hotkeys with key and cancelled (empty key)
	promptReturn = "Ctrl+Alt+M";
	desktopFeatures.configureHotkeys();
	promptReturn = "";
	desktopFeatures.configureHotkeys();
	desktopFeatures.testHotkeys();

	// Desktop monitoring ON and OFF
	desktopFeatures.enableDesktopMonitoring();
	assert.ok(lastAlertMessage.includes("開始"));
	desktopFeatures.enableDesktopMonitoring();
	assert.ok(lastAlertMessage.includes("停止"));
	desktopFeatures.configureMonitoring();

	// Startup checked true and false
	getEl("startup-setting").checked = true;
	desktopFeatures.toggleStartup();
	getEl("startup-setting").checked = false;
	desktopFeatures.toggleStartup();

	// Multi-monitor
	desktopFeatures.configureMultiMonitor();

	// Performance modes: eco, balanced, high
	getEl("performance-mode").value = "eco";
	desktopFeatures.setPerformanceMode();
	assert.equal(getEl("performance-status").textContent, "エコ");

	getEl("performance-mode").value = "balanced";
	desktopFeatures.setPerformanceMode();
	assert.equal(getEl("performance-status").textContent, "バランス");

	getEl("performance-mode").value = "high";
	desktopFeatures.setPerformanceMode();
	assert.equal(getEl("performance-status").textContent, "高性能");

	// Interval and Memory limit (with elements and with null elements)
	desktopFeatures.updateInterval();
	desktopFeatures.updateMemoryLimit();
	assert.equal(getEl("memory-value").textContent, "100MB");

	const origGetById = globalThis.document.getElementById;
	globalThis.document.getElementById = (id) => {
		if (
			id === "interval-value" ||
			id === "memory-value" ||
			id === "performance-status"
		) {
			return null;
		}
		return getEl(id);
	};
	desktopFeatures.setPerformanceMode();
	desktopFeatures.updateInterval();
	desktopFeatures.updateMemoryLimit();
	globalThis.document.getElementById = origGetById;
});

test("multi-window.js 100% coverage", async () => {
	vi.useFakeTimers();

	// Update window status with and without DOM elements
	multiWindow.updateWindowStatus("ghost", true);
	assert.equal(getEl("ghost-status").textContent, "実行中");
	multiWindow.updateWindowStatus("ghost", false);
	assert.equal(getEl("ghost-status").textContent, "停止");

	returnNullElements = true;
	multiWindow.updateWindowStatus("ghost", true);
	multiWindow.updateWindowStatus("ghost", false);
	returnNullElements = false;

	// findWindow when Tauri is NOT available
	delete globalThis.__TAURI__;
	delete globalThis.__TAURI_INTERNALS__;
	await multiWindow.toggleGhostWindow();
	// connectYAYA when Tauri is NOT available (lines 109-111)
	await multiWindow.connectYAYA();
	assert.equal(multiWindow.windowStates.yaya, false);

	// Restore Tauri
	globalThis.__TAURI_INTERNALS__ = defaultTauriInternals;

	// toggleLabeledWindow when window is NOT found in list
	windowsList = [];
	await multiWindow.toggleGhostWindow();

	// toggleLabeledWindow when window IS found: open -> close -> error (line 27)
	windowsList = ["ghost-floating", "desktop-features", "balloon_window_0"];
	multiWindow.windowStates.ghost = false;
	windowCmdShouldFail = false;
	await multiWindow.toggleGhostWindow(); // show, unminimize, setFocus
	assert.equal(multiWindow.windowStates.ghost, true);

	await multiWindow.toggleGhostWindow(); // hide
	assert.equal(multiWindow.windowStates.ghost, false);

	windowCmdShouldFail = true;
	await multiWindow.toggleGhostWindow(); // triggers catch (line 27)
	windowCmdShouldFail = false;

	multiWindow.configureGhostWindow();
	await multiWindow.toggleSettingsWindow();

	// resetSettings confirm true and false
	confirmReturn = true;
	multiWindow.resetSettings();
	confirmReturn = false;
	multiWindow.resetSettings();

	// testBalloonWindow when window exists on timeout vs does not exist on timeout
	windowsList = ["balloon_window_0"];
	await multiWindow.testBalloonWindow();
	await vi.advanceTimersByTimeAsync(3500);

	windowsList = ["balloon_window_0"];
	await multiWindow.testBalloonWindow();
	windowsList = [];
	await vi.advanceTimersByTimeAsync(3500);

	multiWindow.configureBalloon();

	// connectYAYA: connected=true, connected=false, and error
	shioriShouldFail = false;
	shioriStatusReturn = true;
	await multiWindow.connectYAYA();
	assert.equal(multiWindow.windowStates.yaya, true);

	shioriStatusReturn = false;
	await multiWindow.connectYAYA();
	assert.equal(multiWindow.windowStates.yaya, false);

	shioriShouldFail = true;
	await multiWindow.connectYAYA();
	shioriShouldFail = false;

	multiWindow.debugYAYA();

	// initializeAllWindows & timer
	multiWindow.initializeAllWindows();
	await vi.advanceTimersByTimeAsync(1200);

	// minimize, restore, closeAllWindows (confirm true and false)
	multiWindow.minimizeAllWindows();
	multiWindow.restoreAllWindows();
	confirmReturn = true;
	multiWindow.closeAllWindows();
	confirmReturn = false;
	multiWindow.closeAllWindows();

	multiWindow.toggleAlwaysOnTop();
	multiWindow.updateOpacity();
	multiWindow.toggleAutoMinimize();
	multiWindow.toggleSystemTray();

	vi.useRealTimers();
});

test("splashscreen.js 100% coverage", async () => {
	vi.useFakeTimers();
	globalThis.__TAURI__ = { version: "2.0" };

	await import("../ui/windows/splashscreen.js");

	await vi.advanceTimersByTimeAsync(4500);
	assert.equal(
		getEl("loading-text").textContent,
		"スプラッシュ完了 - 手動で閉じてください",
	);

	// Also test when loadingTextElement is null and __TAURI__ is undefined
	delete globalThis.__TAURI__;
	returnNullElements = true;
	vi.resetModules();
	await import("../ui/windows/splashscreen.js");
	await vi.advanceTimersByTimeAsync(4500);
	returnNullElements = false;

	vi.useRealTimers();
});
