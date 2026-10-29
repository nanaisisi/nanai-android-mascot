import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis;
globalThis.prompt = (_msg, def) => def || "90";
globalThis.alert = () => {};
globalThis.confirm = () => true;
globalThis.__TAURI_INTERNALS__ = {
	metadata: {
		currentWindow: { label: "main" },
	},
	invoke: async (cmd) => {
		if (cmd === "plugin:window|get_all_windows") return [];
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

test("desktop-features.js methods test", async () => {
	desktopFeatures.updateStatusDisplay();
	desktopFeatures.toggleTransparency();
	await desktopFeatures.adjustOpacity("80");
	await desktopFeatures.toggleAlwaysOnTop();
	desktopFeatures.configureTopmost();
	desktopFeatures.enableDragMode();
	desktopFeatures.resetPosition();
	desktopFeatures.toggleSystemTray();
	desktopFeatures.configureTray();
	desktopFeatures.configureHotkeys();
	desktopFeatures.testHotkeys();
	desktopFeatures.enableDesktopMonitoring();
	desktopFeatures.configureMonitoring();
	desktopFeatures.toggleStartup();
	desktopFeatures.configureMultiMonitor();
	desktopFeatures.setPerformanceMode();
	desktopFeatures.updateInterval();
	desktopFeatures.updateMemoryLimit();

	assert.ok(true);
});

test("multi-window.js methods test", async () => {
	multiWindow.updateWindowStatus("ghost", true);
	assert.equal(getEl("ghost-status").textContent, "実行中");

	multiWindow.updateWindowStatus("ghost", false);
	assert.equal(getEl("ghost-status").textContent, "停止");

	await multiWindow.toggleGhostWindow();
	multiWindow.configureGhostWindow();
	await multiWindow.toggleSettingsWindow();
	multiWindow.resetSettings();
	await multiWindow.testBalloonWindow();
	multiWindow.configureBalloon();
	await multiWindow.connectYAYA();
	multiWindow.debugYAYA();
	multiWindow.initializeAllWindows();
	multiWindow.minimizeAllWindows();
	multiWindow.restoreAllWindows();
	multiWindow.closeAllWindows();
	multiWindow.toggleAlwaysOnTop();
	multiWindow.updateOpacity();
	multiWindow.toggleAutoMinimize();
	multiWindow.toggleSystemTray();

	assert.ok(true);
});

test("splashscreen.js module load test", async () => {
	await import("../ui/windows/splashscreen.js");
	assert.ok(true);
});
