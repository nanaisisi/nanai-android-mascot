/**
 * @file interactions.test.ts
 * @brief Tests for window resizing handles and dragging interactions
 */

import assert from "node:assert/strict";
import { beforeEach, describe, it } from "vitest";
import { InternalWindowManager } from "../../../ui/ts/core/internal-window-manager.js";
import { createMockDomElement, type MockDomElement } from "./mock-dom.js";

describe("InternalWindowManager & VirtualWindow - Interactions", () => {
	let container: MockDomElement;
	let manager: InternalWindowManager;

	beforeEach(() => {
		const docBody = createMockDomElement("body");
		globalThis.document = {
			body: docBody as unknown as HTMLElement,
			createElement: (tag: string) =>
				createMockDomElement(tag) as unknown as HTMLElement,
			getElementById: (id: string) => {
				if (id === "main-display") return container as unknown as HTMLElement;
				return null;
			},
		} as unknown as Document;

		container = createMockDomElement("div");
		container.id = "main-display";
		container.clientWidth = 800;
		container.clientHeight = 600;
		docBody.appendChild(container);

		manager = new InternalWindowManager(container as unknown as HTMLElement);
	});

	it("handles resizing handles interaction without crashing", () => {
		const win = manager.getOrCreateWindow({
			scopeId: 77,
			resizable: true,
		});
		assert.equal(win.resizeHandles.length, 8);
		const seHandle = win.resizeHandles.find(
			(h) => (h as unknown as MockDomElement).dataset.dir === "se",
		);
		assert.ok(seHandle);

		let mouseMoveCb: ((e?: unknown) => void) | null = null;
		let mouseUpCb: (() => void) | null = null;
		globalThis.addEventListener = ((evt: string, cb: (e?: unknown) => void) => {
			if (evt === "mousemove") mouseMoveCb = cb;
			if (evt === "mouseup") mouseUpCb = cb as () => void;
		}) as unknown as typeof globalThis.addEventListener;
		globalThis.removeEventListener =
			(() => {}) as unknown as typeof globalThis.removeEventListener;

		seHandle?.dispatchEvent({
			type: "mousedown",
			clientX: 100,
			clientY: 100,
			stopPropagation() {},
		} as unknown as MouseEvent);
		assert.equal(win.isResizing, true);

		mouseMoveCb?.({ clientX: 150, clientY: 150 });
		mouseUpCb?.();

		assert.equal(win.isResizing, false);
	});

	it("handles mouse/touch dragging without crashing", () => {
		const win = manager.getOrCreateWindow({
			scopeId: 88,
		});
		assert.ok(win.titleBarElement);

		let mouseMoveCb: ((e?: unknown) => void) | null = null;
		let mouseUpCb: (() => void) | null = null;
		globalThis.addEventListener = ((evt: string, cb: (e?: unknown) => void) => {
			if (evt === "mousemove") mouseMoveCb = cb;
			if (evt === "mouseup") mouseUpCb = cb as () => void;
		}) as unknown as typeof globalThis.addEventListener;
		globalThis.removeEventListener =
			(() => {}) as unknown as typeof globalThis.removeEventListener;

		win.titleBarElement?.dispatchEvent({
			type: "mousedown",
			clientX: 50,
			clientY: 50,
			target: win.titleBarElement,
			stopPropagation() {},
		} as unknown as MouseEvent);
		assert.equal(win.isDragging, true);

		mouseMoveCb?.({ clientX: 80, clientY: 90 });
		mouseUpCb?.();

		assert.equal(win.isDragging, false);
	});
});
