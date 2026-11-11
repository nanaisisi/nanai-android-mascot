import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis;
globalThis.document = {
	getElementById(id) {
		if (id === "menu-iframe") {
			return { contentWindow: { postMessage() {} } };
		}
		return null;
	},
};
globalThis.localStorage = {
	getItem: () => JSON.stringify(["Ghost1"]),
	setItem: () => {},
};

const { menuMethods } = await import("../ui/ts/ui/app-menu.js");

test("menuMethods covers toggleMenu, toggleHtmlMenu, syncMenuGhosts, hideMenu, and quick actions", async () => {
	const mockApp = {
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

	// 5. hideMenu
	mockApp.elements.menuContainer.style.display = "block";
	mockApp.hideMenu();
	assert.equal(mockApp.elements.menuContainer.style.display, "none");

	// 6. toggleMenu with Tauri available success
	globalThis.__TAURI_INTERNALS__ = {
		invoke: async (cmd) => {
			if (cmd === "show_menu_window") return;
		},
		transformCallback: (cb) => cb,
	};
	globalThis.window = globalThis;

	let syncCalled = false;
	const originalSync = mockApp.syncMenuGhosts;
	mockApp.syncMenuGhosts = () => {
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
	globalThis.__TAURI_INTERNALS__.invoke = async (cmd) => {
		if (cmd === "show_menu_window") throw new Error("fail");
	};
	mockApp.toggleMenu(10, 20, 0);
	await new Promise((r) => setTimeout(r, 10));
	assert.equal(htmlMenuToggled, true);
	mockApp.toggleHtmlMenu = originalToggleHtml;

	delete globalThis.__TAURI_INTERNALS__;

	// 8. syncMenuGhosts full coverage: iframe postMessages and Tauri emits
	const posted = [];
	const mockIframe = {
		contentWindow: {
			postMessage(msg, origin) {
				posted.push({ msg, origin });
			},
		},
	};
	globalThis.document = {
		getElementById: (id) => (id === "menu-iframe" ? mockIframe : null),
	};

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
	const emitted = [];
	globalThis.__TAURI_INTERNALS__ = {
		invoke: async (cmd, args) => {
			if (cmd === "plugin:event|emit") {
				emitted.push(args);
				return;
			}
		},
		transformCallback: (cb) => cb,
	};
	mockApp.cachedMenuCaptions = { "biffbutton.caption": "Check Mail" };
	mockApp.syncMenuGhosts(0);
	assert.ok(emitted.length > 0);

	delete globalThis.__TAURI_INTERNALS__;
	assert.ok(true);
});
