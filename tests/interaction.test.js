import assert from "node:assert/strict";
import { test, vi } from "vitest";

globalThis.window = globalThis;
globalThis.innerWidth = 800;
globalThis.innerHeight = 600;
globalThis.requestAnimationFrame = (cb) => cb();
globalThis.document = {
	getElementById(id) {
		if (id === "balloon-display") {
			return { style: {}, addEventListener() {} };
		}
		return null;
	},
	createElement(tag) {
		if (tag === "canvas") {
			return {
				width: 0,
				height: 0,
				getContext() {
					return {
						drawImage() {},
						getImageData: () => ({ data: [255, 255, 255, 255] }), // non-transparent
					};
				},
			};
		}
		return {};
	},
};
Object.defineProperty(globalThis, "navigator", {
	value: { userAgent: "Mozilla/5.0 (Windows NT 10.0)" },
	configurable: true,
});

const { InteractionManager } = await import("../ui/js/surface/interaction.js");

test("InteractionManager covers dragging, stroke, longpress, docking, and native window move", async () => {
	vi.useFakeTimers();

	const clicked = [];
	const stroked = [];
	let menuToggled = false;
	const mockApp = { toggleMenu() { menuToggled = true; } };
	const manager = new InteractionManager(mockApp);

	const listeners = {};
	const classes = new Set();
	const mockTarget = {
		querySelector: () => ({
			tagName: "IMG",
			getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }),
			naturalWidth: 10,
			naturalHeight: 10,
		}),
		classList: {
			add(c) { classes.add(c); },
			remove(...args) { for (const c of args) classes.delete(c); },
			contains(c) { return classes.has(c); },
		},
		style: {},
		getBoundingClientRect: () => ({ left: 10, top: 10, width: 100, height: 100 }),
		addEventListener(type, cb) {
			listeners[type] = cb;
		},
	};

	const globalListeners = {};
	globalThis.addEventListener = (type, cb) => {
		globalListeners[type] = globalListeners[type] || [];
		globalListeners[type].push(cb);
	};

	const emitGlobal = (type, e) => {
		for (const cb of globalListeners[type] || []) {
			cb(e);
		}
	};

	// 1. Native Tauri desktop dragging
	globalThis.__TAURI_INTERNALS__ = {
		metadata: { currentWindow: { label: "main" } },
		invoke: async (cmd) => {
			if (cmd === "plugin:window|position") return { x: 100, y: 100 };
			if (cmd === "plugin:window|set_position") return;
		},
		transformCallback: (cb) => cb,
	};

	manager.setupDragging(
		mockTarget,
		(x, y, rect) => clicked.push({ x, y, rect }),
		(x, y, rect) => stroked.push({ x, y, rect }),
	);

	listeners.mousedown?.({
		type: "mousedown",
		button: 0,
		cancelable: true,
		preventDefault() {},
		clientX: 10,
		clientY: 10,
	});

	// Wait for native window position promise
	await vi.advanceTimersByTimeAsync(20);
	emitGlobal("mousemove", { clientX: 20, clientY: 20 });
	emitGlobal("mouseup", { clientX: 20, clientY: 20 });

	// 2. Long press menu trigger
	listeners.mousedown?.({
		type: "mousedown",
		button: 0,
		cancelable: true,
		preventDefault() {},
		clientX: 10,
		clientY: 10,
	});
	vi.advanceTimersByTime(700);
	assert.equal(menuToggled, true);
	// Release longpress
	emitGlobal("mouseup", { clientX: 10, clientY: 10 });

	// 3. Docking left & right (non-Tauri)
	delete globalThis.__TAURI_INTERNALS__;
	listeners.touchstart?.({
		type: "touchstart",
		cancelable: true,
		preventDefault() {},
		touches: [{ clientX: 20, clientY: 20 }],
	});
	emitGlobal("touchmove", { touches: [{ clientX: 30, clientY: 30 }] });
	emitGlobal("touchmove", { touches: [{ clientX: 40, clientY: 40 }] });
	emitGlobal("touchend", {});
	assert.equal(classes.has("is-docked-left"), true);

	// Un-dock on click
	listeners.touchstart?.({
		type: "touchstart",
		cancelable: true,
		preventDefault() {},
		touches: [{ clientX: 20, clientY: 20 }],
	});
	emitGlobal("touchend", {});
	assert.equal(classes.has("is-docked-left"), false);

	vi.useRealTimers();
	assert.ok(true);
});
