import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis as unknown as Window & typeof globalThis;
globalThis.location = { search: "?scope=0" } as unknown as Location;
const classList = {
	classes: new Set<string>(),
	add(c: string) {
		this.classes.add(c);
	},
	remove(c: string) {
		this.classes.delete(c);
	},
	contains(c: string) {
		return this.classes.has(c);
	},
};
globalThis.document = {
	body: { classList: classList as unknown as DOMTokenList },
} as unknown as Document;
globalThis.parent = globalThis as unknown as Window;

const { MenuDispatcher } = await import("../ui/ts/ui/menu-dispatcher.js");

test("MenuDispatcher covers constructor, setScope, and dispatchAction", async () => {
	const dispatcher = new MenuDispatcher();
	assert.equal(dispatcher.currentScope, 0);

	// 1. setScope (scope > 0 adds subchar-mode, scope 0 removes)
	dispatcher.setScope(1);
	assert.equal(classList.contains("subchar-mode"), true);
	dispatcher.setScope(0);
	assert.equal(classList.contains("subchar-mode"), false);

	// 2. dispatchAction with empty action
	await dispatcher.dispatchAction("");

	// 3. dispatchAction with null payload
	await dispatcher.dispatchAction("talk", null);

	// 4. dispatchAction with object payload
	await dispatcher.dispatchAction("switch-ghost", { name: "Ghost2" });

	// 5. dispatchAction with Tauri available (emit & invoke hide_menu_window)
	globalThis.__TAURI_INTERNALS__ = {
		invoke: async (cmd: string) => {
			if (cmd === "hide_menu_window") return;
		},
		transformCallback: (cb: unknown) => cb,
	};
	globalThis.window = globalThis as unknown as Window & typeof globalThis;

	await dispatcher.dispatchAction("balloon");
	await dispatcher.dispatchAction("request-sync");

	delete globalThis.__TAURI_INTERNALS__;
	assert.ok(true);
});
