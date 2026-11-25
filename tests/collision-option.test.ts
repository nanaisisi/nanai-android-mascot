import assert from "node:assert/strict";
import { afterEach, describe, it } from "vitest";
import { setupGhostDragging } from "../ui/ts/surface/interaction/drag-handler.js";
import { surfaceCollisionMethods } from "../ui/ts/surface/surface-collision.js";
import { SurfaceManager } from "../ui/ts/surface/surface-manager.js";

describe("collisionoption-brace (nodrag* / nocontextmenu*)", () => {
	it("checks nodrag and nocontextmenu collisions per scope case-insensitively", () => {
		const manager = {
			...surfaceCollisionMethods,
			nodragCollisions: {
				sakura: ["Knob"],
				kero: ["Tail"],
				char2: ["Wing"],
			},
			nocontextmenuCollisions: {
				sakura: ["Head"],
			},
		};

		assert.equal(
			surfaceCollisionMethods.isNoDragCollision.call(manager, 0, "knob"),
			true,
		);
		assert.equal(
			surfaceCollisionMethods.isNoDragCollision.call(manager, 0, "Tail"),
			false,
		);
		assert.equal(
			surfaceCollisionMethods.isNoDragCollision.call(manager, 1, "TAIL"),
			true,
		);
		assert.equal(
			surfaceCollisionMethods.isNoDragCollision.call(manager, 2, "wing"),
			true,
		);

		assert.equal(
			surfaceCollisionMethods.isNoContextMenuCollision.call(manager, 0, "HEAD"),
			true,
		);
		assert.equal(
			surfaceCollisionMethods.isNoContextMenuCollision.call(manager, 1, "Head"),
			false,
		);
	});
});

describe("nodrag* drag suppression in setupGhostDragging", () => {
	const origAdd = globalThis.addEventListener;
	const origRemove = globalThis.removeEventListener;

	afterEach(() => {
		globalThis.addEventListener = origAdd;
		globalThis.removeEventListener = origRemove;
	});

	it("fires onGhostMouseDown but suppresses onGhostDragStart when isNoDragAtPoint returns true", () => {
		const targetListeners = new Map<string, (e: unknown) => void>();
		const globalListeners = new Map<string, (e: unknown) => void>();
		globalThis.addEventListener = ((type: string, fn: (e: unknown) => void) => {
			globalListeners.set(type, fn);
		}) as typeof globalThis.addEventListener;
		globalThis.removeEventListener =
			(() => {}) as typeof globalThis.removeEventListener;

		const target = {
			style: {},
			classList: { contains: () => false, add: () => {}, remove: () => {} },
			addEventListener: (type: string, fn: (e: unknown) => void) => {
				targetListeners.set(type, fn);
			},
			removeEventListener: () => {},
			querySelector: () => null,
			getBoundingClientRect: () => ({
				left: 0,
				top: 0,
				width: 200,
				height: 300,
			}),
		} as unknown as HTMLElement;

		let mouseDownCount = 0;
		let dragStartCount = 0;
		const handle = setupGhostDragging(target, undefined, undefined, {
			onGhostMouseDown: () => {
				mouseDownCount++;
			},
			onGhostDragStart: () => {
				dragStartCount++;
			},
			isNoDragAtPoint: () => true,
		});

		targetListeners.get("mousedown")?.({
			type: "mousedown",
			button: 0,
			clientX: 50,
			clientY: 50,
			target: { closest: () => null },
		});
		globalListeners.get("mousemove")?.({
			clientX: 90,
			clientY: 90,
		});
		globalListeners.get("mouseup")?.({
			button: 0,
			clientX: 90,
			clientY: 90,
		});

		handle.cleanup();
		assert.equal(mouseDownCount, 1);
		assert.equal(dragStartCount, 0);
	});
});

describe("SurfaceManager collisionoption-brace end-to-end", () => {
	it("parses sakura/kero collisionoption blocks and resolves nodrag/nocontextmenu", async () => {
		const sm = new SurfaceManager();
		await sm.parseSurfacesTxt(
			"sakura.collisionoption\n{\nnodrag0,Knob\nnocontextmenu0,Head\n}\nkero.collisionoption {\nnodrag0,Tail\n}\n",
		);
		assert.equal(sm.isNoDragCollision(0, "knob"), true);
		assert.equal(sm.isNoDragCollision(1, "tail"), true);
		assert.equal(sm.isNoContextMenuCollision(0, "head"), true);
		assert.equal(sm.isNoContextMenuCollision(1, "head"), false);
	});
});
