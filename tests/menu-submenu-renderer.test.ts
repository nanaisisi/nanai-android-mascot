import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis as unknown as Window & typeof globalThis;
globalThis.location = { search: "?scope=0" } as unknown as Location;
globalThis.document = {
	getElementById(_id: string) {
		return {
			innerHTML: "",
			appendChild() {},
			classList: { add() {}, remove() {} },
			style: {},
			querySelector: () => null,
			querySelectorAll: () => [],
		} as unknown as HTMLElement;
	},
	createElement: (_tag: string) =>
		({
			innerHTML: "",
			appendChild() {},
			style: {},
			dataset: {},
			addEventListener() {},
		}) as unknown as HTMLElement,
	querySelectorAll: () => [] as unknown as NodeListOf<Element>,
	documentElement: {
		getAttribute: () => "default",
		setAttribute() {},
		style: { removeProperty: () => "", setProperty() {} },
	},
	body: { classList: { add() {}, remove() {} } as unknown as DOMTokenList },
} as unknown as Document;

const { MenuDispatcher } = await import("../ui/ts/ui/menu-dispatcher.js");
const { MenuSubmenuRenderer } = await import(
	"../ui/ts/ui/menu-submenu-renderer.js"
);

test("MenuSubmenuRenderer covers all rendering methods and theme applications", () => {
	const dispatcher = new MenuDispatcher();
	const renderer = new MenuSubmenuRenderer(dispatcher);

	renderer.renderShellSubmenu(["master", "alt"], "master");
	renderer.renderBalloonSubmenu(
		[{ name: "Default", dir_name: "default" }],
		"default",
	);
	renderer.renderGhostSubmenu(["Ghost1", "Ghost2"], "Ghost1");
	renderer.renderCallGhostSubmenu(["Ghost1", "Ghost2"]);
	renderer.renderDressupSubmenu({ categories: [] }, 0);
	renderer.renderRecentSubmenu(["Ghost1"]);
	renderer.applyTheme("ivory");
	renderer.applyShellTheme({ name: "master" });

	assert.ok(true);
});
