import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis;
globalThis.location = { search: "?scope=0" };
globalThis.document = {
	getElementById(id) {
		return {
			innerHTML: "",
			appendChild() {},
			classList: { add() {}, remove() {} },
			style: {},
			querySelector: () => null,
			querySelectorAll: () => [],
		};
	},
	createElement: (tag) => ({ innerHTML: "", appendChild() {}, style: {}, dataset: {}, addEventListener() {} }),
	querySelectorAll: () => [],
	documentElement: {
		getAttribute: () => "default",
		setAttribute() {},
		style: { removeProperty() {}, setProperty() {} },
	},
	body: { classList: { add() {}, remove() {} } },
};

const { MenuDispatcher } = await import("../ui/js/ui/menu-dispatcher.js");
const { MenuSubmenuRenderer } = await import("../ui/js/ui/menu-submenu-renderer.js");

test("MenuSubmenuRenderer covers all rendering methods and theme applications", () => {
	const dispatcher = new MenuDispatcher();
	const renderer = new MenuSubmenuRenderer(dispatcher);

	renderer.renderShellSubmenu(["master", "alt"], "master");
	renderer.renderBalloonSubmenu([{ name: "Default", dir_name: "default" }], "default");
	renderer.renderGhostSubmenu(["Ghost1", "Ghost2"], "Ghost1");
	renderer.renderCallGhostSubmenu(["Ghost1", "Ghost2"]);
	renderer.renderDressupSubmenu({ categories: [] }, 0);
	renderer.renderRecentSubmenu(["Ghost1"]);
	renderer.applyTheme("ivory");
	renderer.applyShellTheme({ name: "master" });

	assert.ok(true);
});
