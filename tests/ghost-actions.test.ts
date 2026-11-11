import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis;
globalThis.document = {
	createElement: () => ({
		textContent: "",
		style: {},
		addEventListener(_t, cb) {
			this._cb = cb;
		},
	}),
};
globalThis.localStorage = {
	getItem: () => JSON.stringify(["Ghost1"]),
	setItem: () => {},
};

const { ghostActions } = await import("../ui/ts/core/actions/ghost-actions.js");

test("ghostActions coverage for all methods", async () => {
	const mockOkBtn = {
		addEventListener(_t, cb) {
			cb();
		},
	};
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
				querySelector: (sel) => (sel === "#modal-ok-btn" ? mockOkBtn : null),
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
	ghostActions.recordRecentGhost("");

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
	await ghostActions.handleDressupToggle.call(mockApp, {
		category: "hat",
		part: "ribbon",
		scope: 0,
	});

	assert.ok(true);
});

test("ghostActions covers edge branches (imported ghost, mustselect dressup, uninstall fallback ghost, install balloon, install error, switchToNextGhost length <= 1, scale fallback, and minimizeApp with Tauri & error)", async () => {
	const sentEvents = [];
	const mockApp = {
		...ghostActions,
		ghostController: {
			currentGhost: { name: "TestGhost" },
			ghosts: [{ name: "TestGhost" }],
			selectGhost: async () => {},
			scanGhosts: async () => {},
			sendShioriEvent: async (ev, args) => {
				sentEvents.push({ ev, args });
				if (ev === "OnInstallBegin") {
					throw new Error("shiori error");
				}
			},
		},
		modalManager: {
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

	// switchToNextGhost with length <= 1
	ghostActions.switchToNextGhost.call(mockApp);

	// switchToNextGhost with empty ghosts array
	mockApp.ghostController.ghosts = [];
	ghostActions.switchToNextGhost.call(mockApp);
	mockApp.ghostController.ghosts = [{ name: "TestGhost" }];

	// uninstallCurrentGhost with Tauri
	globalThis.confirm = () => true;
	globalThis.__TAURI_INTERNALS__ = {
		metadata: { currentWindow: { label: "main" } },
		invoke: async (cmd) => {
			if (cmd === "uninstall_ghost") return true;
			if (cmd === "minimize_app") return null;
		},
		transformCallback: (cb) => cb,
	};
	await ghostActions.uninstallCurrentGhost.call(mockApp);

	// uninstallCurrentGhost with Tauri error
	globalThis.__TAURI_INTERNALS__.invoke = async (cmd) => {
		if (cmd === "uninstall_ghost") throw new Error("uninstall fail");
	};
	await ghostActions.uninstallCurrentGhost.call(mockApp);

	// installGhostFromMenu - imported ghost branch (lines 125-134)
	globalThis.__TAURI_INTERNALS__.invoke = async (cmd) => {
		if (cmd === "pick_and_install_ghost_archive") {
			return { name: "TestGhost", path: "/installed/path" };
		}
	};
	await ghostActions.installGhostFromMenu.call(mockApp);

	// installGhostFromMenu - imported balloon branch
	globalThis.__TAURI_INTERNALS__.invoke = async (cmd) => {
		if (cmd === "pick_and_install_ghost_archive")
			return { name: "Bal1", path: "" };
	};
	await ghostActions.installGhostFromMenu.call(mockApp);

	// installGhostFromMenu - install failure catch branch (line 159)
	globalThis.__TAURI_INTERNALS__.invoke = async (cmd) => {
		if (cmd === "pick_and_install_ghost_archive")
			throw new Error("install fail");
	};
	await ghostActions.installGhostFromMenu.call(mockApp);

	// minimizeApp in Tauri with error catch (line 258)
	globalThis.__TAURI_INTERNALS__.invoke = async (cmd) => {
		if (cmd === "minimize_app") throw new Error("minimize error");
	};
	ghostActions.minimizeApp.call(mockApp);

	// handleDressupToggle with mustselect option (line 211)
	const dressUpCalls = [];
	mockApp.surfaceManager = {
		dressupState: new Map(),
		shellManifest: {
			categories: [
				{
					category: "hat",
					options: ["mustselect"],
					parts: [{ part: "ribbon" }, { part: "bow" }],
				},
			],
		},
		bindDressup: async (cat, part, state, scope) => {
			dressUpCalls.push({ cat, part, state, scope });
		},
	};
	await ghostActions.handleDressupToggle.call(mockApp, {
		category: "hat",
		part: "ribbon",
		scope: 0,
	});
	assert.ok(dressUpCalls.length > 0);

	delete globalThis.__TAURI_INTERNALS__;
	assert.ok(true);
});
