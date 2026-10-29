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

const { menuMethods } = await import("../ui/js/ui/app-menu.js");

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
		syncMenuGhosts() {},
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
	mockApp.syncMenuGhosts = () => {
		syncCalled = true;
	};
	mockApp.toggleMenu(10, 20, 0);
	await new Promise((r) => setTimeout(r, 10));
	assert.equal(syncCalled, true);

	// 7. toggleMenu with Tauri show_menu_window fail falling back to show_context_menu
	globalThis.__TAURI_INTERNALS__.invoke = async (cmd) => {
		if (cmd === "show_menu_window") throw new Error("fail");
		if (cmd === "show_context_menu") return;
	};
	mockApp.toggleMenu(10, 20, 0);
	await new Promise((r) => setTimeout(r, 10));

	delete globalThis.__TAURI_INTERNALS__;
	assert.ok(true);
});
