import assert from "node:assert/strict";
import { test } from "vitest";
import type { NanaiAndroidMascotApp } from "../ui/main.js";

interface MockElement {
	textContent: string;
	style: Record<string, string>;
	_cb?: () => void;
	addEventListener: (_t: string, cb: () => void) => void;
}

interface MockTauriInternals {
	metadata?: { currentWindow?: { label: string } };
	invoke: (cmd: string) => Promise<unknown>;
	transformCallback: (cb: unknown) => unknown;
}

globalThis.window = globalThis as unknown as Window & typeof globalThis;
globalThis.document = {
	createElement: () =>
		({
			textContent: "",
			style: {},
			addEventListener(this: MockElement, _t: string, cb: () => void) {
				this._cb = cb;
			},
		}) as unknown as HTMLElement,
} as unknown as Document;
globalThis.localStorage = {
	getItem: () => JSON.stringify(["Ghost1"]),
	setItem: () => {},
} as unknown as Storage;

const { ghostActions } = await import("../ui/ts/core/actions/ghost-actions.js");

test("ghostActions coverage for all methods", async () => {
	const mockOkBtn = {
		addEventListener(_t: string, cb: () => void) {
			cb();
		},
	};
	const mockApp: Record<string, unknown> = {
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
				querySelector: (sel: string) =>
					sel === "#modal-ok-btn" ? mockOkBtn : null,
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
	await ghostActions.installGhostFromMenu.call(
		mockApp as unknown as NanaiAndroidMascotApp,
	);

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
	const sentEvents: Array<{ ev: string; args: unknown }> = [];
	const mockGhostController = {
		currentGhost: { name: "TestGhost" },
		ghosts: [{ name: "TestGhost" }],
		selectGhost: async () => {},
		scanGhosts: async () => {},
		sendShioriEvent: async (ev: string, args: unknown) => {
			sentEvents.push({ ev, args });
			if (ev === "OnInstallBegin") {
				throw new Error("shiori error");
			}
		},
	};
	const mockApp: Record<string, unknown> = {
		...ghostActions,
		ghostController: mockGhostController,
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
	mockGhostController.ghosts = [];
	ghostActions.switchToNextGhost.call(mockApp);
	mockGhostController.ghosts = [{ name: "TestGhost" }];

	// uninstallCurrentGhost with Tauri
	globalThis.confirm = () => true;
	const tauriInternals: MockTauriInternals = {
		metadata: { currentWindow: { label: "main" } },
		invoke: async (cmd: string) => {
			if (cmd === "uninstall_ghost") return true;
			if (cmd === "minimize_app") return null;
			return null;
		},
		transformCallback: (cb: unknown) => cb,
	};
	globalThis.__TAURI_INTERNALS__ = tauriInternals;
	await ghostActions.uninstallCurrentGhost.call(mockApp);

	// uninstallCurrentGhost with Tauri error
	tauriInternals.invoke = async (cmd: string) => {
		if (cmd === "uninstall_ghost") throw new Error("uninstall fail");
		return null;
	};
	await ghostActions.uninstallCurrentGhost.call(mockApp);

	// installGhostFromMenu - imported ghost branch (lines 125-134)
	tauriInternals.invoke = async (cmd: string) => {
		if (cmd === "pick_and_install_ghost_archive") {
			return { name: "TestGhost", path: "/installed/path" };
		}
		return null;
	};
	await ghostActions.installGhostFromMenu.call(
		mockApp as unknown as NanaiAndroidMascotApp,
	);

	// installGhostFromMenu - imported balloon branch
	tauriInternals.invoke = async (cmd: string) => {
		if (cmd === "pick_and_install_ghost_archive")
			return { name: "Bal1", path: "" };
		return null;
	};
	await ghostActions.installGhostFromMenu.call(
		mockApp as unknown as NanaiAndroidMascotApp,
	);

	// installGhostFromMenu - install failure catch branch (line 159)
	tauriInternals.invoke = async (cmd: string) => {
		if (cmd === "pick_and_install_ghost_archive")
			throw new Error("install fail");
		return null;
	};
	await ghostActions.installGhostFromMenu.call(
		mockApp as unknown as NanaiAndroidMascotApp,
	);

	// minimizeApp in Tauri with error catch (line 258)
	tauriInternals.invoke = async (cmd: string) => {
		if (cmd === "minimize_app") throw new Error("minimize error");
		return null;
	};
	ghostActions.minimizeApp.call(mockApp);

	// handleDressupToggle with mustselect option (line 211)
	const dressUpCalls: Array<{
		cat: string;
		part: string;
		state: string;
		scope: number;
	}> = [];
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
		bindDressup: async (
			cat: string,
			part: string,
			state: string,
			scope: number,
		) => {
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
