/**
 * @file basics.test.ts
 * @brief Tests for window creation, retrieval, focus management, pinning, titles, and viewport clamping
 */

import assert from "node:assert/strict";
import { beforeEach, describe, expect, it } from "vitest";
import { InternalWindowManager } from "../../../ui/ts/core/internal-window-manager.js";
import { MockDomElement, createMockDomElement } from "./mock-dom.js";

describe("InternalWindowManager & VirtualWindow - Basics", () => {
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

	it("creates and retrieves virtual windows with default options", () => {
		const win = manager.getOrCreateWindow({
			scopeId: 0,
			title: "Sakura Scope",
			x: 50,
			y: 60,
			width: 300,
			height: 200,
		});

		assert.equal(win.scopeId, 0);
		assert.equal(win.id, "virtual_win_0");
		assert.equal(win.titleElement?.textContent, "Sakura Scope");
		assert.equal(win.element.style.left, "50px");
		assert.equal(win.element.style.top, "60px");
		assert.equal(win.element.style.width, "300px");
		assert.equal(win.element.style.height, "200px");

		assert.equal(manager.getWindow(0), win);
		assert.equal(manager.getAllWindows().length, 1);
		assert.equal(manager.getActiveWindow(), win);
	});

	it("supports focus management: bringToFront and sendToBack", () => {
		const win1 = manager.getOrCreateWindow({ scopeId: 1, title: "Win 1" });
		const win2 = manager.getOrCreateWindow({ scopeId: 2, title: "Win 2" });

		expect(win2.zIndex).toBeGreaterThan(win1.zIndex);
		assert.equal(manager.getActiveWindow(), win2);

		manager.bringToFront(win1);
		expect(win1.zIndex).toBeGreaterThan(win2.zIndex);
		assert.equal(manager.getActiveWindow(), win1);

		manager.sendToBack(win1);
		expect(win1.zIndex).toBeLessThan(win2.zIndex);
		assert.equal(win1.element.classList.contains("is-focused"), false);
	});

	it("supports pinning always on top", () => {
		const win = manager.getOrCreateWindow({
			scopeId: "pin_test",
			pinnable: true,
		});
		assert.equal(win.isPinned, false);

		win.togglePin();
		assert.equal(win.isPinned, true);
		assert.equal(win.element.classList.contains("is-pinned"), true);
		expect(win.zIndex).toBeGreaterThanOrEqual(5000);

		win.togglePin();
		assert.equal(win.isPinned, false);
		assert.equal(win.element.classList.contains("is-pinned"), false);
	});

	it("supports setTitle, show, hide, and close", () => {
		const win = manager.getOrCreateWindow({ scopeId: 5, title: "Original" });
		win.setTitle("Updated Title");
		assert.equal(win.titleElement?.textContent, "Updated Title");

		win.hide();
		assert.equal(win.isVisible, false);
		assert.equal(win.element.style.display, "none");

		win.show();
		assert.equal(win.isVisible, true);
		assert.equal(win.element.style.display, "block");

		win.close();
		assert.equal(manager.getWindow(5), undefined);
		assert.equal(manager.getAllWindows().length, 0);
	});

	it("clamps windows to viewport boundaries", () => {
		const win = manager.getOrCreateWindow({
			scopeId: 6,
			x: 750,
			y: 550,
			width: 200,
			height: 150,
		});
		win.element.offsetLeft = 750;
		win.element.offsetTop = 550;
		win.element.offsetWidth = 200;
		win.element.offsetHeight = 150;

		win.clampToViewport(800, 600);
		assert.equal(win.element.style.left, "600px"); // 800 - 200
		assert.equal(win.element.style.top, "450px"); // 600 - 150
	});

	it("cleans up listeners on destroy", () => {
		manager.getOrCreateWindow({ scopeId: 99 });
		manager.destroy();
		assert.equal(manager.getAllWindows().length, 0);
	});
});
