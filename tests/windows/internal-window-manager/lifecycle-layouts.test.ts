/**
 * @file lifecycle-layouts.test.ts
 * @brief Tests for window minimization, maximization, layout arrangements (cascade/tile), and BackButtonManager integration
 */

import assert from "node:assert/strict";
import { beforeEach, describe, it } from "vitest";
import { InternalWindowManager } from "../../../ui/ts/core/internal-window-manager.js";
import { createMockDomElement, type MockDomElement } from "./mock-dom.js";

describe("InternalWindowManager & VirtualWindow - Lifecycle & Layouts", () => {
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

	it("supports minimize and restore lifecycle", () => {
		const win = manager.getOrCreateWindow({ scopeId: 3, title: "Win 3" });
		assert.equal(win.isMinimized, false);

		win.minimize();
		assert.equal(win.isMinimized, true);
		assert.equal(win.element.classList.contains("is-minimized"), true);
		assert.equal(win.contentElement.style.display, "none");

		win.restore();
		assert.equal(win.isMinimized, false);
		assert.equal(win.element.classList.contains("is-minimized"), false);
		assert.equal(win.contentElement.style.display, "");

		win.toggleMinimize();
		assert.equal(win.isMinimized, true);
		win.toggleMinimize();
		assert.equal(win.isMinimized, false);
	});

	it("supports maximize and restore lifecycle with geometry memory", () => {
		const win = manager.getOrCreateWindow({
			scopeId: 4,
			title: "Win 4",
			x: 80,
			y: 90,
			width: 250,
			height: 180,
		});
		const el = win.element as unknown as MockDomElement;
		el.offsetLeft = 80;
		el.offsetTop = 90;
		el.offsetWidth = 250;
		el.offsetHeight = 180;

		win.maximize();
		assert.equal(win.isMaximized, true);
		assert.equal(win.element.classList.contains("is-maximized"), true);
		assert.equal(win.element.style.left, "0px");
		assert.equal(win.element.style.top, "0px");
		assert.equal(win.element.style.width, "100%");
		assert.equal(win.element.style.height, "100%");

		win.restore();
		assert.equal(win.isMaximized, false);
		assert.equal(win.element.classList.contains("is-maximized"), false);
		assert.equal(win.element.style.left, "80px");
		assert.equal(win.element.style.top, "90px");
		assert.equal(win.element.style.width, "250px");
		assert.equal(win.element.style.height, "180px");

		win.toggleMaximize();
		assert.equal(win.isMaximized, true);
		win.toggleMaximize();
		assert.equal(win.isMaximized, false);
	});

	it("performs cascading and tiling layouts", () => {
		const w1 = manager.getOrCreateWindow({ scopeId: 10 });
		const w2 = manager.getOrCreateWindow({ scopeId: 20 });
		const w3 = manager.getOrCreateWindow({ scopeId: 30 });

		manager.cascadeWindows(10, 10, 20);
		assert.equal(w1.element.style.left, "10px");
		assert.equal(w1.element.style.top, "10px");
		assert.equal(w2.element.style.left, "30px");
		assert.equal(w2.element.style.top, "30px");
		assert.equal(w3.element.style.left, "50px");
		assert.equal(w3.element.style.top, "50px");

		manager.tileWindows();
		assert.ok(w1.element.style.width !== "");
		assert.ok(w2.element.style.width !== "");
		assert.ok(w3.element.style.width !== "");

		manager.minimizeAll();
		assert.equal(w1.isMinimized, true);
		assert.equal(w2.isMinimized, true);
		assert.equal(w3.isMinimized, true);

		manager.restoreAll();
		assert.equal(w1.isMinimized, false);
		assert.equal(w2.isMinimized, false);
		assert.equal(w3.isMinimized, false);
	});

	it("integrates with Android BackButtonManager", async () => {
		const fakeBackButtonManager = {
			handler: null as null | (() => boolean | Promise<boolean>),
			registerBackHandler(fn: () => boolean | Promise<boolean>) {
				this.handler = fn;
				return () => {
					this.handler = null;
				};
			},
		};

		const unregister = manager.registerToBackButtonManager(
			fakeBackButtonManager,
		);
		assert.ok(typeof unregister === "function");

		// No windows -> back button not consumed
		assert.equal(await fakeBackButtonManager.handler?.(), false);

		// With window maximized -> consumes and restores
		const win = manager.getOrCreateWindow({ scopeId: "back_test" });
		win.maximize();
		assert.equal(win.isMaximized, true);
		assert.equal(await fakeBackButtonManager.handler?.(), true);
		assert.equal(win.isMaximized, false);

		// With window normal -> consumes and minimizes
		assert.equal(await fakeBackButtonManager.handler?.(), true);
		assert.equal(win.isMinimized, true);

		// With window minimized -> consumes and closes
		assert.equal(await fakeBackButtonManager.handler?.(), true);
		assert.equal(manager.getWindow("back_test"), undefined);

		unregister();
	});
});
