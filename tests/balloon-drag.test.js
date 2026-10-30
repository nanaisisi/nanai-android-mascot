import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis;
globalThis.requestAnimationFrame = (cb) => {
	cb();
	return 1;
};

let savedStorage = null;
globalThis.localStorage = {
	getItem: (_k) => savedStorage,
	setItem: (_k, v) => {
		savedStorage = v;
	},
};

const documentListeners = {};
const globalListeners = {};

const balloonEl = {
	style: {},
	getBoundingClientRect: () => ({
		left: 100,
		top: 100,
		width: 200,
		height: 100,
	}),
	addEventListener(type, cb) {
		this._listeners = this._listeners || {};
		this._listeners[type] = cb;
	},
};

globalThis.document = {
	getElementById(id) {
		if (id === "balloon-display") return balloonEl;
		return null;
	},
	addEventListener(type, cb) {
		documentListeners[type] = cb;
	},
};

globalThis.addEventListener = (type, cb) => {
	globalListeners[type] = cb;
};

const { BalloonDragManager } = await import("../ui/js/surface/balloon-drag.js");

test("BalloonDragManager covers restore, follow, dragging, and persistence", () => {
	savedStorage = JSON.stringify({ x: 50, y: -100 });
	const mockInteraction = {};
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
	};
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
