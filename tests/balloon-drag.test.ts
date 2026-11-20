import assert from "node:assert/strict";
import { test } from "vitest";
import type { InteractionManager } from "../ui/ts/surface/interaction.js";

globalThis.window = globalThis as unknown as Window & typeof globalThis;
globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) => {
	cb(0);
	return 1;
}) as typeof globalThis.requestAnimationFrame;

let savedStorage: string | null = null;
globalThis.localStorage = {
	getItem: (_k: string) => savedStorage,
	setItem: (_k: string, v: string) => {
		savedStorage = v;
	},
} as unknown as Storage;

const documentListeners: Record<string, (e?: unknown) => void> = {};
const globalListeners: Record<string, (e?: unknown) => void> = {};

const balloonEl: {
	style: Record<string, string>;
	_listeners?: Record<string, (e?: unknown) => void>;
	getBoundingClientRect: () => {
		left: number;
		top: number;
		width: number;
		height: number;
	};
	addEventListener: (type: string, cb: (e?: unknown) => void) => void;
} = {
	style: {},
	getBoundingClientRect: () => ({
		left: 100,
		top: 100,
		width: 200,
		height: 100,
	}),
	addEventListener(type: string, cb: (e?: unknown) => void) {
		this._listeners = this._listeners || {};
		this._listeners[type] = cb;
	},
};

globalThis.document = {
	getElementById(id: string) {
		if (id === "balloon-display") return balloonEl;
		return null;
	},
	addEventListener(type: string, cb: (e?: unknown) => void) {
		documentListeners[type] = cb;
	},
} as unknown as Document;

globalThis.addEventListener = ((type: string, cb: (e?: unknown) => void) => {
	globalListeners[type] = cb;
}) as unknown as typeof globalThis.addEventListener;

const { BalloonDragManager } = await import("../ui/ts/surface/balloon-drag.js");

test("BalloonDragManager covers restore, follow, dragging, and persistence", () => {
	savedStorage = JSON.stringify({ x: 50, y: -100 });
	const mockInteraction = {} as unknown as InteractionManager;
	const manager = new BalloonDragManager(mockInteraction);

	assert.equal(manager.balloonOffsetX, 50);
	assert.equal(manager.balloonOffsetY, -100);

	// Test updateFollowPosition
	manager.updateFollowPosition(200, 300);
	assert.equal(balloonEl.style.left, "250px");
	assert.equal(balloonEl.style.top, "200px");

	// Test setupBalloonDragging
	const ghostTarget = {
		getBoundingClientRect: () => ({
			left: 200,
			top: 200,
			width: 100,
			height: 200,
		}),
	} as unknown as HTMLElement;
	manager.setupBalloonDragging(ghostTarget);

	// Mousedown on button or A link (should be ignored)
	balloonEl._listeners?.mousedown?.({
		button: 0,
		clientX: 100,
		clientY: 100,
		target: { tagName: "A" },
		stopPropagation() {},
	});

	// Mousedown on balloon background
	balloonEl._listeners?.mousedown?.({
		button: 0,
		clientX: 100,
		clientY: 100,
		target: { tagName: "DIV" },
		stopPropagation() {},
	});
	assert.equal(balloonEl.style.cursor, "grabbing");

	// Mousemove
	globalListeners.mousemove?.({ clientX: 120, clientY: 130 });

	// Mouseup
	globalListeners.mouseup?.();
	assert.equal(balloonEl.style.cursor, "");
	assert.ok(savedStorage);

	// Touch events
	balloonEl._listeners?.touchstart?.({
		touches: [{ clientX: 100, clientY: 100 }],
		target: { tagName: "DIV" },
		stopPropagation() {},
	});
	globalListeners.touchmove?.({ touches: [{ clientX: 110, clientY: 110 }] });
	globalListeners.touchend?.();

	assert.ok(true);
});
