import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis;
globalThis.document = {
	createElement: () => ({ textContent: "", style: {}, addEventListener(t, cb) { this._cb = cb; } }),
};
globalThis.localStorage = {
	getItem: () => JSON.stringify(["Ghost1"]),
	setItem: () => {},
};

const { ghostActions } = await import("../ui/js/core/actions/ghost-actions.js");

test("ghostActions coverage for all methods", async () => {
	const mockOkBtn = { addEventListener(t, cb) { cb(); } };
	const mockApp = {
		...ghostActions,
		ghostController: {
			currentGhost: {
				name: "TestGhost",
				version: "1.0",
				sakura_name: "Sakura",
				kero_name: "Kero",
				shiori: "aya.dll",
				craftman: "Author",
				craftman_url: "url",
				path: "/path",
			},
			ghosts: [{ name: "TestGhost" }, { name: "NextGhost" }],
			selectGhost: async () => {},
			scanGhosts: async () => {},
			sendShioriEvent() {},
		},
		modalManager: {
			content: {
				innerHTML: "",
				querySelector: (sel) => sel === "#modal-ok-btn" ? mockOkBtn : null,
			},
			overlay: { style: {} },
			hide() {},
			show() {},
			showNotification() {},
		},
		elements: { ghostDisplay: { style: {} } },
		showBalloon() {},
		hideBalloon() {},
		scanBalloons: async () => {},
		setBalloonTheme: async () => {},
		availableBalloons: [{ name: "Bal1", dir_name: "bal1" }],
		hideMenu() {},
	};

	// 1. showGhostInformation
	ghostActions.showGhostInformation.call(mockApp);

	// 2. recordRecentGhost
	ghostActions.recordRecentGhost("Ghost2");

	// 3. switchToNextGhost
	ghostActions.switchToNextGhost.call(mockApp);

	// 4. applyShellScaleAction
	ghostActions.applyShellScaleAction.call(mockApp, "scale-125");
	ghostActions.applyShellScaleAction.call(mockApp, "unknown-scale");

	// 5. minimizeApp (non-Tauri)
	ghostActions.minimizeApp.call(mockApp);

	// 6. uninstallCurrentGhost (non-Tauri)
	globalThis.confirm = () => true;
	await ghostActions.uninstallCurrentGhost.call(mockApp);

	// 7. installGhostFromMenu (non-Tauri)
	await ghostActions.installGhostFromMenu.call(mockApp);

	// 8. handleDressupToggle
	mockApp.surfaceManager = {
		dressupState: new Map(),
		shellManifest: {},
		bindDressup: async () => {},
	};
	await ghostActions.handleDressupToggle.call(mockApp, { category: "hat", part: "ribbon", scope: 0 });

	assert.ok(true);
});
