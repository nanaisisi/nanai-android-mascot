/**
 * @file tests/windows/internal-window-manager.test.ts
 * @brief Android/Web向け仮想マルチウィンドウマネージャーの単体・統合テスト
 */

import assert from "node:assert/strict";
import { beforeEach, describe, expect, it } from "vitest";
import { InternalWindowManager } from "../../ui/ts/core/internal-window-manager.js";

interface MockDomElement {
	tagName: string;
	id: string;
	className: string;
	dataset: Record<string, string>;
	style: Record<string, string>;
	title: string;
	innerHTML: string;
	textContent: string;
	offsetLeft: number;
	offsetTop: number;
	offsetWidth: number;
	offsetHeight: number;
	clientWidth: number;
	clientHeight: number;
	children: MockDomElement[];
	parentNode: MockDomElement | null;
	removed?: boolean;
	classList: {
		add(cls: string): void;
		remove(cls: string): void;
		contains(cls: string): boolean;
		toggle(cls: string): void;
	};
	appendChild(child: MockDomElement): MockDomElement;
	remove(): void;
	addEventListener(
		event: string,
		handler: (e?: unknown) => void,
		options?: unknown,
	): void;
	removeEventListener(event: string, handler: (e?: unknown) => void): void;
	dispatchEvent(event: unknown): boolean;
	closest(selector: string): MockDomElement | null;
}

// Node環境下でのDOM要素モック生成ヘルパー
function createMockDomElement(tag = "div"): MockDomElement {
	const classListSet = new Set<string>();
	const listeners: Record<string, Array<(e?: unknown) => void>> = {};
	const children: MockDomElement[] = [];

	const el: MockDomElement = {
		tagName: tag.toUpperCase(),
		id: "",
		className: "",
		dataset: {},
		style: {},
		title: "",
		innerHTML: "",
		textContent: "",
		offsetLeft: 100,
		offsetTop: 100,
		offsetWidth: 200,
		offsetHeight: 150,
		clientWidth: 200,
		clientHeight: 150,
		children,
		parentNode: null,
		classList: {
			add(cls: string) {
				classListSet.add(cls);
				el.className = Array.from(classListSet).join(" ");
			},
			remove(cls: string) {
				classListSet.delete(cls);
				el.className = Array.from(classListSet).join(" ");
			},
			contains(cls: string) {
				return classListSet.has(cls);
			},
			toggle(cls: string) {
				if (classListSet.has(cls)) {
					classListSet.delete(cls);
				} else {
					classListSet.add(cls);
				}
				el.className = Array.from(classListSet).join(" ");
			},
		},
		appendChild(child: MockDomElement) {
			child.parentNode = el;
			children.push(child);
			return child;
		},
		remove() {
			el.removed = true;
			if (el.parentNode && Array.isArray(el.parentNode.children)) {
				const idx = el.parentNode.children.indexOf(el);
				if (idx !== -1) el.parentNode.children.splice(idx, 1);
			}
		},
		addEventListener(event: string, handler: (e?: unknown) => void) {
			if (!listeners[event]) listeners[event] = [];
			listeners[event].push(handler);
		},
		removeEventListener(event: string, handler: (e?: unknown) => void) {
			if (!listeners[event]) return;
			listeners[event] = listeners[event].filter((h) => h !== handler);
		},
		dispatchEvent(event: unknown) {
			const type = (event as { type?: string })?.type || "click";
			const list = listeners[type] || [];
			for (const fn of list) {
				fn(event);
			}
			return true;
		},
		closest(selector: string) {
			if (selector === "button" && el.tagName === "BUTTON") return el;
			return null;
		},
	};
	return el;
}

describe("InternalWindowManager & VirtualWindow", () => {
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
		win.element.offsetLeft = 80;
		win.element.offsetTop = 90;
		win.element.offsetWidth = 250;
		win.element.offsetHeight = 180;

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

	it("cleans up listeners on destroy", () => {
		manager.getOrCreateWindow({ scopeId: 99 });
		manager.destroy();
		assert.equal(manager.getAllWindows().length, 0);
	});
});
