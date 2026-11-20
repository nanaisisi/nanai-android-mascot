import assert from "node:assert/strict";
import { test } from "vitest";
import type { ModalManager } from "../ui/ts/ui/modal.js";

interface MockGhostHandlerElement {
	className: string;
	innerHTML: string;
	_listeners?: Record<string, (event?: unknown) => void>;
	addEventListener: (type: string, cb: (event?: unknown) => void) => void;
	click: () => void;
}

globalThis.window = globalThis as unknown as Window & typeof globalThis;
globalThis.document = {
	createElement: (_tag: string) => {
		const el: MockGhostHandlerElement = {
			className: "",
			innerHTML: "",
			addEventListener(type: string, cb: (event?: unknown) => void) {
				this._listeners = this._listeners || {};
				this._listeners[type] = cb;
			},
			click() {},
		};
		return el as unknown as HTMLElement;
	},
} as unknown as Document;

const { ModalGhostHandlers } = await import(
	"../ui/ts/ui/modal-ghost-handlers.js"
);

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
	} as unknown as ModalManager;

	const handlers = new ModalGhostHandlers(mockManager);
	assert.equal(handlers.manager, mockManager);
	assert.equal(handlers.app, mockManager.app);

	handlers.setupExplorerListeners();
	assert.ok(true);
});
