import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis as unknown as Window & typeof globalThis;
globalThis.document = {
	getElementById(id: string) {
		if (id === "menu-iframe") {
			return { contentWindow: { postMessage() {} } };
		}
		return null;
	},
} as unknown as Document;
globalThis.localStorage = {
	length: 0,
	clear: () => {},
	key: () => null,
	removeItem: () => {},
	getItem: () => JSON.stringify(["Ghost1"]),
	setItem: () => {},
} satisfies Storage;

const { menuMethods } = await import("../ui/ts/ui/app-menu.js");

test("menuMethods covers toggleMenu, toggleHtmlMenu, syncMenuGhosts, hideMenu, and quick actions", async () => {
	const mockApp: typeof menuMethods & {
		elements: {
			menuContainer: { style: { display: string } };
			quickActionsPanel: { style: { display: string } };
			androidMenuPanel?: { hidden: boolean };
			androidMenuBtn?: { setAttribute: (name: string, val: string) => void };
		};
		ghostController: {
			ghosts: Array<{ name: string }> | null;
			currentGhost: { name: string; shells: string[] } | null;
			shells: string[] | null;
			currentShell: string | null;
			scanGhosts?: () => Promise<void>;
		};
		currentBalloonTheme: string;
		availableBalloons: Array<{ name: string; dir_name: string }>;
		availablePlugins?: unknown[];
		cachedMenuCaptions?: Record<string, string>;
		scanBalloons?: () => Promise<void>;
	} = {
		...menuMethods,
		elements: {
			menuContainer: { style: { display: "none" } },
			quickActionsPanel: { style: { display: "flex" } },
		},
		ghostController: {
			ghosts: [{ name: "Ghost1" }, { name: "Ghost2" }],
			currentGhost: { name: "Ghost1", shells: ["master"] },
			shells: ["master"],
			currentShell: "master",
		},
		currentBalloonTheme: "default",
		availableBalloons: [{ name: "Default", dir_name: "default" }],
	};

	// 1. toggleHtmlMenu
	mockApp.toggleHtmlMenu(0);
	assert.equal(mockApp.elements.menuContainer.style.display, "block");
	mockApp.toggleHtmlMenu(0);
	assert.equal(mockApp.elements.menuContainer.style.display, "none");

	// 2. toggleMenu (non-Tauri)
	delete globalThis.__TAURI__;
	delete globalThis.__TAURI_INTERNALS__;
	mockApp.toggleMenu(null, null, 0);

	// 3. syncMenuGhosts (non-Tauri + iframe postMessage)
	mockApp.syncMenuGhosts(0);

	// 4. toggleQuickActionsPanel & hideQuickActionsPanel
	mockApp.toggleQuickActionsPanel();
	assert.equal(mockApp.elements.quickActionsPanel.style.display, "none");
	mockApp.toggleQuickActionsPanel();
	assert.equal(mockApp.elements.quickActionsPanel.style.display, "flex");
	mockApp.hideQuickActionsPanel();
	assert.equal(mockApp.elements.quickActionsPanel.style.display, "none");

	// 5. hideMenu (also closes androidMenuPanel)
	let expandedAttr = "true";
	mockApp.elements.androidMenuPanel = { hidden: false };
	mockApp.elements.androidMenuBtn = {
		setAttribute(name: string, val: string) {
			if (name === "aria-expanded") expandedAttr = val;
		},
	};
	mockApp.elements.menuContainer.style.display = "block";
	mockApp.hideMenu();
	assert.equal(mockApp.elements.menuContainer.style.display, "none");
	assert.equal(mockApp.elements.androidMenuPanel.hidden, true);
	assert.equal(expandedAttr, "false");

	// 6. toggleMenu with Tauri available success
	const tauriInternals: {
		invoke: (cmd: string, args?: unknown) => Promise<void>;
		transformCallback: (cb: unknown) => unknown;
	} = {
		invoke: async (cmd: string) => {
			if (cmd === "show_menu_window") return;
		},
		transformCallback: (cb: unknown) => cb,
	};
	globalThis.__TAURI_INTERNALS__ = tauriInternals;
	globalThis.window = globalThis as unknown as Window & typeof globalThis;

	let syncCalled = false;
	const originalSync = mockApp.syncMenuGhosts;
	mockApp.syncMenuGhosts = async () => {
		syncCalled = true;
	};
	mockApp.toggleMenu(10, 20, 0);
	await new Promise((r) => setTimeout(r, 10));
	assert.equal(syncCalled, true);
	mockApp.syncMenuGhosts = originalSync;

	// 7. toggleMenu with Tauri show_menu_window fail falling back to toggleHtmlMenu
	let htmlMenuToggled = false;
	const originalToggleHtml = mockApp.toggleHtmlMenu;
	mockApp.toggleHtmlMenu = () => {
		htmlMenuToggled = true;
	};
	tauriInternals.invoke = async (cmd: string) => {
		if (cmd === "show_menu_window") throw new Error("fail");
	};
	mockApp.toggleMenu(10, 20, 0);
	await new Promise((r) => setTimeout(r, 10));
	assert.equal(htmlMenuToggled, true);
	mockApp.toggleHtmlMenu = originalToggleHtml;

	delete globalThis.__TAURI_INTERNALS__;

	// 8. syncMenuGhosts full coverage: iframe postMessages and Tauri emits
	const posted: Array<{ msg: unknown; origin: string }> = [];
	const mockIframe = {
		contentWindow: {
			postMessage(msg: unknown, origin: string) {
				posted.push({ msg, origin });
			},
		},
	};
	globalThis.document = {
		getElementById: (id: string) => (id === "menu-iframe" ? mockIframe : null),
	} as unknown as Document;

	// Test non-tauri branch with invalid JSON in localStorage to trigger catch branch
	globalThis.localStorage.getItem = () => "INVALID_JSON{";
	mockApp.syncMenuGhosts(0);
	assert.ok(posted.length >= 4);

	// Test with fallback ghost controller (no ghosts array, no shells array)
	mockApp.ghostController = {
		ghosts: null,
		currentGhost: null,
		shells: null,
		currentShell: null,
	};
	mockApp.syncMenuGhosts(1);

	// Test Tauri branch with emit
	const emitted: unknown[] = [];
	globalThis.__TAURI_INTERNALS__ = {
		invoke: async (cmd: string, args: unknown) => {
			if (cmd === "plugin:event|emit") {
				emitted.push(args);
				return;
			}
		},
		transformCallback: (cb: unknown) => cb,
	};
	mockApp.cachedMenuCaptions = { "biffbutton.caption": "Check Mail" };
	await mockApp.syncMenuGhosts(0);
	assert.ok(emitted.length > 0);

	delete globalThis.__TAURI_INTERNALS__;

	// Test SinglePageUi (Android) scans balloons when empty and posts plugins + balloons to #menu-iframe
	posted.length = 0;
	mockApp.availableBalloons = [];
	mockApp.availablePlugins = [{ name: "DemoPlugin" }];
	let scannedBalloons = false;
	mockApp.scanBalloons = async () => {
		scannedBalloons = true;
		mockApp.availableBalloons = [{ name: "NAM", dir_name: "nam" }];
	};
	await mockApp.syncMenuGhosts(0);
	assert.equal(scannedBalloons, true);
	const ghostsMsg = posted.find(
		(p) => (p.msg as { type?: string })?.type === "sync-ghosts",
	)?.msg as { plugins?: unknown[] } | undefined;
	assert.deepEqual(ghostsMsg?.plugins, [{ name: "DemoPlugin" }]);
	const balloonsMsg = posted.find(
		(p) => (p.msg as { type?: string })?.type === "sync-balloons",
	)?.msg as { balloons?: unknown[] } | undefined;
	assert.deepEqual(balloonsMsg?.balloons, [{ name: "NAM", dir_name: "nam" }]);
	const scopeDefaultMsg = posted.find(
		(p) => (p.msg as { type?: string })?.type === "sync-scope",
	)?.msg as { resetSubmenu?: boolean } | undefined;
	assert.equal(scopeDefaultMsg?.resetSubmenu, false);

	// Test scanGhosts is called when gc.ghosts is empty ([]) and resetSubmenu: true is forwarded
	posted.length = 0;
	let scannedGhosts = false;
	mockApp.ghostController = {
		ghosts: [],
		currentGhost: null,
		shells: ["master"],
		currentShell: "master",
		scanGhosts: async () => {
			scannedGhosts = true;
			mockApp.ghostController.ghosts = [{ name: "mock_nanai" }];
		},
	};
	await mockApp.syncMenuGhosts(0, { resetSubmenu: true });
	assert.equal(scannedGhosts, true);
	const scopeResetMsg = posted.find(
		(p) => (p.msg as { type?: string })?.type === "sync-scope",
	)?.msg as { resetSubmenu?: boolean } | undefined;
	assert.equal(scopeResetMsg?.resetSubmenu, true);
	const rescannedGhostsMsg = posted.find(
		(p) => (p.msg as { type?: string })?.type === "sync-ghosts",
	)?.msg as { ghosts?: Array<{ name: string }> } | undefined;
	assert.deepEqual(rescannedGhostsMsg?.ghosts, [{ name: "mock_nanai" }]);

	// Test syncMenuGhosts resolves shells from scanned gc.ghosts / get_ghost_info when currentGhost.shells is []
	posted.length = 0;
	mockApp.ghostController = {
		ghosts: [
			{
				name: "mock_nanai",
				shells: [{ name: "master", display_name: "Master" }],
			} as unknown as { name: string },
		],
		currentGhost: { name: "mock_nanai", shells: [] },
		shells: [],
		currentShell: "master",
	};
	await mockApp.syncMenuGhosts(0);
	const shellsFromScannedMsg = posted.find(
		(p) => (p.msg as { type?: string })?.type === "sync-shells",
	)?.msg as
		| { shells?: Array<{ name?: string; display_name?: string }> }
		| undefined;
	assert.equal(shellsFromScannedMsg?.shells?.[0]?.name, "master");
	assert.equal(shellsFromScannedMsg?.shells?.[0]?.display_name, "Master");

	posted.length = 0;
	globalThis.__TAURI_INTERNALS__ = {
		invoke: async (cmd: string) => {
			if (cmd === "get_ghost_info") {
				return {
					path: "/data/user/0/com.nanai_android_mascot.app/files/ghost/mock_nanai",
					shells: [{ name: "master", display_name: "Resolved Master" }],
				};
			}
			return undefined;
		},
		transformCallback: (cb: unknown) => cb,
	};
	mockApp.ghostController = {
		ghosts: [{ name: "mock_nanai" }],
		currentGhost: { name: "mock_nanai", shells: [] },
		shells: [],
		currentShell: "master",
	};
	await mockApp.syncMenuGhosts(0);
	delete globalThis.__TAURI_INTERNALS__;
	const shellsFromInfoMsg = posted.find(
		(p) => (p.msg as { type?: string })?.type === "sync-shells",
	)?.msg as
		| { shells?: Array<{ name?: string; display_name?: string }> }
		| undefined;
	assert.equal(shellsFromInfoMsg?.shells?.[0]?.display_name, "Resolved Master");
	assert.equal(
		(mockApp.ghostController.currentGhost as { path?: string } | null)?.path,
		"/data/user/0/com.nanai_android_mascot.app/files/ghost/mock_nanai",
	);

	assert.ok(true);
});
