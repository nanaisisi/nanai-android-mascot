import assert from "node:assert/strict";
import { test, vi } from "vitest";

const g = globalThis as unknown as {
	window?: unknown;
	innerWidth?: number;
	innerHeight?: number;
	requestAnimationFrame?: (cb: FrameRequestCallback) => number;
	document?: unknown;
	addEventListener?: (
		type: string,
		cb: (e?: Record<string, unknown>) => void,
	) => void;
	__TAURI_INTERNALS__?: {
		metadata?: { currentWindow?: { label?: string } };
		invoke?: (cmd: string) => Promise<unknown>;
		transformCallback?: (cb: unknown) => unknown;
	};
};

g.window = globalThis;
g.innerWidth = 800;
g.innerHeight = 600;
g.requestAnimationFrame = (cb: FrameRequestCallback) => {
	cb(0);
	return 0;
};
g.document = {
	getElementById(id: string) {
		if (id === "balloon-display") {
			return { style: {}, addEventListener() {} };
		}
		return null;
	},
	createElement(tag: string) {
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

const { InteractionManager } = await import("../ui/ts/surface/interaction.js");

test("InteractionManager covers dragging, stroke, longpress, docking, and native window move", async () => {
	vi.useFakeTimers();

	const clicked: Array<{ x: unknown; y: unknown; rect: unknown }> = [];
	const stroked: Array<{ x: unknown; y: unknown; rect: unknown }> = [];
	const mouseEvents: Array<{
		ev: string;
		x: number;
		y: number;
		button?: number;
		dev?: string;
		rect?: unknown;
		delta?: number;
	}> = [];
	let menuToggled = false;
	const mockApp = {
		toggleMenu() {
			menuToggled = true;
		},
	};
	const manager = new InteractionManager(mockApp);

	const listeners: Record<string, (e?: Record<string, unknown>) => void> = {};
	const classes = new Set<string>();
	const mockTarget = {
		querySelector: () => ({
			tagName: "IMG",
			getBoundingClientRect: () => ({
				left: 0,
				top: 0,
				width: 100,
				height: 100,
			}),
			naturalWidth: 10,
			naturalHeight: 10,
		}),
		classList: {
			add(c: string) {
				classes.add(c);
			},
			remove(...args: string[]) {
				for (const c of args) classes.delete(c);
			},
			contains(c: string) {
				return classes.has(c);
			},
		},
		style: {},
		getBoundingClientRect: () => ({
			left: 10,
			top: 10,
			width: 100,
			height: 100,
		}),
		addEventListener(type: string, cb: (e?: Record<string, unknown>) => void) {
			listeners[type] = cb;
		},
	} as unknown as HTMLElement;

	const globalListeners: Record<
		string,
		Array<(e?: Record<string, unknown>) => void>
	> = {};
	g.addEventListener = (
		type: string,
		cb: (e?: Record<string, unknown>) => void,
	) => {
		globalListeners[type] = globalListeners[type] || [];
		globalListeners[type].push(cb);
	};

	const emitGlobal = (type: string, e: Record<string, unknown>) => {
		for (const cb of globalListeners[type] || []) {
			cb(e);
		}
	};

	// 1. Native Tauri desktop dragging
	g.__TAURI_INTERNALS__ = {
		metadata: { currentWindow: { label: "main" } },
		invoke: async (cmd: string) => {
			if (cmd === "plugin:window|position") return { x: 100, y: 100 };
			if (cmd === "plugin:window|set_position") return;
		},
		transformCallback: (cb: unknown) => cb,
	};

	manager.setupDragging(
		mockTarget,
		(x: unknown, y: unknown, rect: unknown) => clicked.push({ x, y, rect }),
		(x: unknown, y: unknown, rect: unknown) => stroked.push({ x, y, rect }),
		{
			onGhostMouseDown: (x, y, rect, button, dev) =>
				mouseEvents.push({ ev: "down", x, y, button, dev, rect }),
			onGhostMouseUp: (x, y, rect, button, dev) =>
				mouseEvents.push({ ev: "up", x, y, button, dev, rect }),
			onGhostWheel: (x, y, rect, delta) =>
				mouseEvents.push({ ev: "wheel", x, y, rect, delta }),
			onGhostDragStart: (x, y, rect) =>
				mouseEvents.push({ ev: "dragstart", x, y, rect }),
			onGhostDragEnd: (x, y, rect) =>
				mouseEvents.push({ ev: "dragend", x, y, rect }),
			onGhostHover: (x, y, rect) =>
				mouseEvents.push({ ev: "hover", x, y, rect }),
		},
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

	// 2. Long press menu trigger (touch/non-mouse only per drag-handler)
	listeners.mousedown?.({
		type: "mousedown",
		button: 0,
		cancelable: true,
		preventDefault() {},
		clientX: 10,
		clientY: 10,
	});
	vi.advanceTimersByTime(700);
	assert.equal(menuToggled, false);
	emitGlobal("mouseup", { clientX: 10, clientY: 10 });

	listeners.touchstart?.({
		type: "touchstart",
		cancelable: true,
		preventDefault() {},
		touches: [{ clientX: 10, clientY: 10 }],
	});
	vi.advanceTimersByTime(700);
	assert.equal(menuToggled, true);
	// Release longpress
	emitGlobal("touchend", {});

	// 3. Docking left & right (non-Tauri)
	delete g.__TAURI_INTERNALS__;
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

	// 4. Test wheel, hover, and mousemove hover timeout
	listeners.wheel?.({ deltaY: 100, clientX: 15, clientY: 25 });
	listeners.mousemove?.({ clientX: 30, clientY: 30 });
	vi.advanceTimersByTime(350);
	listeners.mouseleave?.();

	assert.ok(mouseEvents.some((e) => e.ev === "down"));
	assert.ok(mouseEvents.some((e) => e.ev === "up"));
	assert.ok(mouseEvents.some((e) => e.ev === "wheel" && e.delta === 100));
	assert.ok(mouseEvents.some((e) => e.ev === "hover"));

	vi.useRealTimers();
	assert.ok(true);
});

test("dragging ghost-display inside character-slot anchors slot by center relative to offsetParent", () => {
	const mockApp = { toggleMenu() {} };
	const manager = new InteractionManager(mockApp);

	const offsetParent = {
		clientWidth: 800,
		clientHeight: 600,
		getBoundingClientRect: () => ({ left: 0, top: 40 }),
	};
	const slotClasses = new Set<string>(["character-slot"]);
	const slotEl = {
		offsetParent,
		style: {} as Record<string, string>,
		classList: {
			add(c: string) {
				slotClasses.add(c);
			},
			remove(...args: string[]) {
				for (const c of args) slotClasses.delete(c);
			},
			contains(c: string) {
				return slotClasses.has(c);
			},
		},
		getBoundingClientRect: () => ({
			left: 300,
			top: 140,
			width: 200,
			height: 400,
		}),
		querySelector: () => null,
	};

	const displayListeners: Record<
		string,
		(e?: Record<string, unknown>) => void
	> = {};
	const displayClasses = new Set<string>(["ghost-display"]);
	const displayEl = {
		style: {} as Record<string, string>,
		classList: {
			add(c: string) {
				displayClasses.add(c);
			},
			remove(...args: string[]) {
				for (const c of args) displayClasses.delete(c);
			},
			contains(c: string) {
				return displayClasses.has(c);
			},
		},
		closest(sel: string) {
			return sel === ".character-slot" ? slotEl : null;
		},
		getBoundingClientRect: () => ({
			left: 300,
			top: 240,
			width: 200,
			height: 300,
		}),
		querySelector: () => null,
		addEventListener(type: string, cb: (e?: Record<string, unknown>) => void) {
			displayListeners[type] = cb;
		},
	} as unknown as HTMLElement;

	const globalListeners: Record<
		string,
		Array<(e?: Record<string, unknown>) => void>
	> = {};
	g.addEventListener = (
		type: string,
		cb: (e?: Record<string, unknown>) => void,
	) => {
		globalListeners[type] = globalListeners[type] || [];
		globalListeners[type].push(cb);
	};

	delete g.__TAURI_INTERNALS__;
	manager.setupDragging(displayEl, undefined, undefined);

	displayListeners.touchstart?.({
		type: "touchstart",
		cancelable: true,
		preventDefault() {},
		touches: [{ clientX: 400, clientY: 340 }],
	});
	for (const cb of globalListeners.touchmove ?? []) {
		cb({ touches: [{ clientX: 420, clientY: 370 }] });
	}
	for (const cb of globalListeners.touchend ?? []) {
		cb({});
	}

	// slot center in offsetParent: (300 - 0 + 100, 140 - 40 + 200) = (400, 300), + delta (20, 30) = (420, 330)
	assert.equal(slotEl.style.left, "420px");
	assert.equal(slotEl.style.top, "330px");
	assert.equal(slotEl.style.transform, "translate(-50%, -50%)");
	assert.equal(
		(displayEl as unknown as { style: Record<string, string> }).style.left,
		"",
	);
	assert.equal(slotClasses.has("is-dragging"), false);
	assert.equal(displayClasses.has("is-dragging"), false);
});

test("touch tap with small jitter fires click and resolveContainedImageRect accounts for object-fit: contain", async () => {
	const { resolveContainedImageRect } = await import(
		"../ui/ts/surface/interaction/transparency.js"
	);
	assert.deepEqual(
		resolveContainedImageRect(
			{ left: 0, top: 0, width: 200, height: 400 },
			200,
			200,
		),
		{ left: 0, top: 100, width: 200, height: 200 },
	);

	const clicked: Array<{ x: unknown; y: unknown }> = [];
	const mockApp = { toggleMenu() {} };
	const manager = new InteractionManager(mockApp);
	const listeners: Record<string, (e?: Record<string, unknown>) => void> = {};
	const globalListeners: Record<
		string,
		Array<(e?: Record<string, unknown>) => void>
	> = {};
	g.addEventListener = (
		type: string,
		cb: (e?: Record<string, unknown>) => void,
	) => {
		globalListeners[type] = globalListeners[type] || [];
		globalListeners[type].push(cb);
	};

	const target = {
		style: {},
		classList: {
			add() {},
			remove() {},
			contains: () => false,
		},
		getBoundingClientRect: () => ({
			left: 100,
			top: 100,
			width: 200,
			height: 400,
		}),
		querySelector: () => null,
		addEventListener(type: string, cb: (e?: Record<string, unknown>) => void) {
			listeners[type] = cb;
		},
	} as unknown as HTMLElement;

	delete g.__TAURI_INTERNALS__;
	manager.setupDragging(
		target,
		(x: unknown, y: unknown) => clicked.push({ x, y }),
		undefined,
	);

	listeners.touchstart?.({
		type: "touchstart",
		cancelable: true,
		preventDefault() {},
		touches: [{ clientX: 150, clientY: 200 }],
	});
	for (const cb of globalListeners.touchmove ?? []) {
		cb({ touches: [{ clientX: 158, clientY: 200 }] });
	}
	for (const cb of globalListeners.touchend ?? []) {
		cb({ changedTouches: [{ clientX: 158, clientY: 200 }] });
	}

	assert.equal(clicked.length, 1);
	assert.deepEqual(clicked[0], { x: 158, y: 200 });
});
