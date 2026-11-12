/**
 * @file tests/windows/desktop-features.test.ts
 * @brief desktop-features.js の単体テストおよびカバレッジテスト
 */

import assert from "node:assert/strict";
import { test } from "vitest";
import { createWindowsMockEnvironment } from "./helpers.js";

test("desktop-features.js 100% coverage", async () => {
	const env = createWindowsMockEnvironment();

	const desktopFeatures = await import("../../ui/windows/desktop-features.ts");

	// Trigger DOMContentLoaded listeners (lines 208-209)
	for (const cb of env.domLoadedListeners) cb();

	// Status display when elements exist vs when elements are null
	env.returnNullElements = true;
	desktopFeatures.updateStatusDisplay();
	env.returnNullElements = false;

	// Transparency toggle ON and OFF
	desktopFeatures.toggleTransparency();
	assert.equal(desktopFeatures.featureStates.transparency, true);
	desktopFeatures.toggleTransparency();
	assert.equal(desktopFeatures.featureStates.transparency, false);

	// adjustOpacity: explicit value, prompt default, invalid/out-of-range values
	await desktopFeatures.adjustOpacity("80");
	env.promptReturn = "75";
	await desktopFeatures.adjustOpacity();
	await desktopFeatures.adjustOpacity("10"); // < 30 early return
	await desktopFeatures.adjustOpacity("150"); // > 100 early return
	await desktopFeatures.adjustOpacity("invalid"); // NaN early return

	// AlwaysOnTop success and failure (line 58)
	env.windowCmdShouldFail = false;
	await desktopFeatures.toggleAlwaysOnTop();
	env.windowCmdShouldFail = true;
	await desktopFeatures.toggleAlwaysOnTop();

	desktopFeatures.configureTopmost();

	// Drag and resetPosition success and failure (lines 71, 77)
	env.windowCmdShouldFail = false;
	desktopFeatures.enableDragMode();
	desktopFeatures.resetPosition();
	await new Promise((r) => setTimeout(r, 10));

	env.windowCmdShouldFail = true;
	desktopFeatures.enableDragMode();
	desktopFeatures.resetPosition();
	await new Promise((r) => setTimeout(r, 20));
	env.windowCmdShouldFail = false;

	// System tray toggle ON and OFF
	desktopFeatures.toggleSystemTray();
	assert.ok(env.lastAlertMessage.includes("システムトレイ: 表示"));
	desktopFeatures.toggleSystemTray();
	assert.ok(env.lastAlertMessage.includes("システムトレイ: 非表示"));
	desktopFeatures.configureTray();

	// Hotkeys with key and cancelled (empty key)
	env.promptReturn = "Ctrl+Alt+M";
	desktopFeatures.configureHotkeys();
	env.promptReturn = "";
	desktopFeatures.configureHotkeys();
	desktopFeatures.testHotkeys();

	// Desktop monitoring ON and OFF
	desktopFeatures.enableDesktopMonitoring();
	assert.ok(env.lastAlertMessage.includes("開始"));
	desktopFeatures.enableDesktopMonitoring();
	assert.ok(env.lastAlertMessage.includes("停止"));
	desktopFeatures.configureMonitoring();

	// Startup checked true and false
	const startupSetting = env.getEl("startup-setting");
	if (startupSetting) startupSetting.checked = true;
	desktopFeatures.toggleStartup();
	if (startupSetting) startupSetting.checked = false;
	desktopFeatures.toggleStartup();

	// Multi-monitor
	desktopFeatures.configureMultiMonitor();

	// Performance modes: eco, balanced, high
	const perfMode = env.getEl("performance-mode");
	if (perfMode) perfMode.value = "eco";
	desktopFeatures.setPerformanceMode();
	assert.equal(env.getEl("performance-status")?.textContent, "エコ");

	if (perfMode) perfMode.value = "balanced";
	desktopFeatures.setPerformanceMode();
	assert.equal(env.getEl("performance-status")?.textContent, "バランス");

	if (perfMode) perfMode.value = "high";
	desktopFeatures.setPerformanceMode();
	assert.equal(env.getEl("performance-status")?.textContent, "高性能");

	// Interval and Memory limit (with elements and with null elements)
	desktopFeatures.updateInterval();
	desktopFeatures.updateMemoryLimit();
	assert.equal(env.getEl("memory-value")?.textContent, "100MB");

	const origGetById = globalThis.document.getElementById;
	globalThis.document.getElementById = ((id: string) => {
		if (
			id === "interval-value" ||
			id === "memory-value" ||
			id === "performance-status"
		) {
			return null;
		}
		return env.getEl(id) as unknown as HTMLElement;
	}) as unknown as typeof globalThis.document.getElementById;
	desktopFeatures.setPerformanceMode();
	desktopFeatures.updateInterval();
	desktopFeatures.updateMemoryLimit();
	globalThis.document.getElementById = origGetById;
});
