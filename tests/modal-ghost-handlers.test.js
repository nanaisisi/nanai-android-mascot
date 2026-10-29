import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis;
globalThis.document = {
	createElement: (tag) => ({
		className: "",
		innerHTML: "",
		addEventListener(type, cb) {
			this._listeners = this._listeners || {};
			this._listeners[type] = cb;
		},
		click() {},
	}),
};

const { ModalGhostHandlers } = await import("../ui/js/ui/modal-ghost-handlers.js");

test("ModalGhostHandlers covers constructor and setupExplorerListeners", () => {
	const mockManager = {
		content: {
			querySelector: () => ({ addEventListener() {} }),
			querySelectorAll: () => [],
		},
		app: {
			ghostController: {
				currentGhost: { name: "Ghost1" },
				scanGhosts: async () => [],
			},
		},
	};

	const handlers = new ModalGhostHandlers(mockManager);
	assert.equal(handlers.manager, mockManager);
	assert.equal(handlers.app, mockManager.app);

	handlers.setupExplorerListeners();
	assert.ok(true);
});
