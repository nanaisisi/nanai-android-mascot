import assert from "node:assert/strict";
import {
	afterAll,
	afterEach,
	beforeEach,
	describe,
	expect,
	test,
	vi,
} from "vitest";

interface ListenerMap {
	[key: string]: ((e?: unknown) => void) | undefined;
}

const g = globalThis as unknown as Record<string, unknown>;
g.window = globalThis;
g.location = { search: "?scope=1" };
g.localStorage = { getItem: () => null, setItem: () => {} };

const listenCallbacks: Record<string, (e: unknown) => unknown> = {};
const emittedEvents: Array<{ ev: string; payload: unknown }> = [];
const invokedCommands: Array<{ cmd: string; args: unknown }> = [];
const docListeners: ListenerMap = {};

let transparentAlpha = 255;

const imgEl = {
	getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }),
	naturalWidth: 10,
	naturalHeight: 10,
	width: 0,
	height: 0,
	complete: false,
	onload: undefined as (() => void) | undefined,
	src: "",
	style: {} as Record<string, string>,
};

const rootEl = {
	_listeners: {} as ListenerMap,
	addEventListener(type: string, cb: (e?: unknown) => void) {
		this._listeners = this._listeners || {};
		this._listeners[type] = cb;
	},
	style: {} as Record<string, string>,
};

g.document = {
	getElementById(id: string) {
		if (id === "subchar-img") return imgEl;
		if (id === "subchar-root") return rootEl;
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
						getImageData: () => ({ data: [255, 255, 255, transparentAlpha] }),
					};
				},
			};
		}
		return {};
	},
	readyState: "complete",
	addEventListener(type: string, cb: (e?: unknown) => void) {
		docListeners[type] = cb;
	},
};

const globalListeners: ListenerMap = {};
g._globalListeners = globalListeners;
g.addEventListener = (type: string, cb: (e?: unknown) => void) => {
	globalListeners[type] = cb;
};

g.__TAURI_INTERNALS__ = {
	metadata: { currentWindow: { label: "subchar_1" } },
	invoke: async (cmd: string, args?: unknown) => {
		if (cmd === "plugin:event|listen") {
			const a = args as { event: string; handler: (e: unknown) => unknown };
			listenCallbacks[a.event] = a.handler;
			return 1;
		}
		if (cmd === "plugin:event|emit") {
			const a = args as { event: string; payload: unknown };
			emittedEvents.push({ ev: a.event, payload: a.payload });
			return;
		}
		invokedCommands.push({ cmd, args });
		if (cmd === "plugin:window|position") return { x: 100, y: 100 };
		if (cmd === "plugin:window|set_position") return;
		if (cmd === "plugin:window|start_dragging") return;
		if (cmd === "show_menu_window") return;
		if (cmd === "sync_character_balloon") return;
		if (cmd === "set_character_scale") return;
	},
	transformCallback: (cb: unknown) => cb,
	plugins: {
		event: {
			listen: async (ev: string, cb: (e: unknown) => unknown) => {
				listenCallbacks[ev] = cb;
				return () => {};
			},
			emit: async (ev: string, payload: unknown) => {
				emittedEvents.push({ ev, payload });
			},
		},
	},
};

const { detectGestureDirection, getImageRect, normalizeDevice } = await import(
	"../ui/ts/surface/character.js"
);

afterAll(() => {
	delete g.__TAURI_INTERNALS__;
});

test("character window covers subchar image updates, pointer interactions, dragging, long press, and contextmenu", async () => {
	vi.useFakeTimers();

	// 1. Test update-subchar-image-1 event listener
	if (listenCallbacks["update-subchar-image-1"]) {
		await listenCallbacks["update-subchar-image-1"]({
			payload: { src: "sub.png" },
		});
		assert.equal(imgEl.src, "sub.png");
		assert.equal(imgEl.style.display, "block");

		await listenCallbacks["update-subchar-image-1"]({ payload: null });
		assert.equal(imgEl.style.display, "none");
	}

	// 2. Test transparent pixel check
	transparentAlpha = 0;
	rootEl._listeners?.mousedown?.({ button: 0, clientX: 5, clientY: 5 });
	transparentAlpha = 255;

	// 3. Test click without drag (emits talk)
	rootEl._listeners?.mousedown?.({
		button: 0,
		clientX: 10,
		clientY: 10,
		screenX: 10,
		screenY: 10,
	});
	globalListeners.mouseup?.();

	// 4. Test long press timer
	rootEl._listeners?.mousedown?.({
		button: 0,
		clientX: 10,
		clientY: 10,
		screenX: 10,
		screenY: 10,
	});
	vi.advanceTimersByTime(700);
	globalListeners.mouseup?.();

	// 5. Test drag move
	rootEl._listeners?.mousedown?.({ button: 0, clientX: 10, clientY: 10 });
	await vi.advanceTimersByTimeAsync(10);
	globalListeners.mousemove?.({ clientX: 30, clientY: 30 });
	globalListeners.mouseup?.();

	// 6. Test contextmenu
	globalListeners.contextmenu?.({
		preventDefault() {},
		screenX: 50,
		screenY: 50,
	});

	vi.useRealTimers();
	assert.ok(true);
});

describe("character window enhanced mouse, hover, stroke, wheel, and gesture support", () => {
	let fakeNow = Date.now() + 100_000;

	const getGhostEvents = () =>
		emittedEvents
			.filter((entry) => entry.ev === "ghost-mouse-event")
			.map((entry) => entry.payload as Record<string, unknown>);

	const getMenuActions = () =>
		emittedEvents
			.filter((entry) => entry.ev === "menu-action")
			.map((entry) => entry.payload as { action: string; payload: unknown });

	beforeEach(() => {
		fakeNow += 10_000;
		vi.useFakeTimers();
		vi.setSystemTime(fakeNow);
		transparentAlpha = 255;
		rootEl._listeners?.mouseleave?.();
		emittedEvents.length = 0;
		invokedCommands.length = 0;
	});

	afterEach(() => {
		rootEl._listeners?.mouseleave?.();
		vi.useRealTimers();
	});

	test("helper functions getImageRect, normalizeDevice, and detectGestureDirection", () => {
		expect(
			getImageRect(
				{
					getBoundingClientRect: () => ({
						left: 12,
						top: 24,
						width: 120,
						height: 240,
					}),
				},
				{
					getBoundingClientRect: () => ({
						left: 0,
						top: 0,
						width: 300,
						height: 400,
					}),
				},
			),
		).toEqual({
			left: 12,
			top: 24,
			width: 120,
			height: 240,
			naturalWidth: 0,
			naturalHeight: 0,
		});

		expect(
			getImageRect(
				{
					getBoundingClientRect: () => ({
						left: 12,
						top: 24,
						width: 120,
						height: 240,
					}),
					naturalWidth: 300,
					naturalHeight: 500,
				},
				null,
			),
		).toEqual({
			left: 12,
			top: 24,
			width: 120,
			height: 240,
			naturalWidth: 300,
			naturalHeight: 500,
		});

		expect(
			getImageRect(
				{
					getBoundingClientRect: () => ({
						left: 0,
						top: 0,
						width: 0,
						height: 0,
					}),
				},
				{
					getBoundingClientRect: () => ({
						left: 5,
						top: 10,
						width: 180,
						height: 320,
					}),
				},
			),
		).toEqual({
			left: 5,
			top: 10,
			width: 180,
			height: 320,
			naturalWidth: 0,
			naturalHeight: 0,
		});

		expect(getImageRect(null, null)).toEqual({
			left: 0,
			top: 0,
			width: 200,
			height: 360,
			naturalWidth: 0,
			naturalHeight: 0,
		});

		expect(normalizeDevice({ touches: [{ clientX: 1, clientY: 2 }] })).toBe(
			"touch",
		);
		expect(
			normalizeDevice({ changedTouches: [{ clientX: 1, clientY: 2 }] }),
		).toBe("touch");
		expect(normalizeDevice({ pointerType: "pen" })).toBe("touch");
		expect(normalizeDevice({ pointerType: "touch" })).toBe("touch");
		expect(normalizeDevice({ pointerType: "mouse" })).toBe("mouse");
		expect(normalizeDevice({})).toBe("mouse");
		expect(normalizeDevice(null)).toBe("mouse");

		expect(detectGestureDirection(40, 0)).toBe("right");
		expect(detectGestureDirection(40, 40)).toBe("right_down");
		expect(detectGestureDirection(0, 40)).toBe("down");
		expect(detectGestureDirection(-40, 40)).toBe("left_down");
		expect(detectGestureDirection(-40, 0)).toBe("left");
		expect(detectGestureDirection(-40, -40)).toBe("left_up");
		expect(detectGestureDirection(0, -40)).toBe("up");
		expect(detectGestureDirection(40, -40)).toBe("right_up");
	});

	test("left button emits mousedown/mouseup, delays startDraggingWindow until drag > 5px, and supports multi-click and touch", () => {
		const expectedRect = {
			left: 0,
			top: 0,
			width: 100,
			height: 100,
			naturalWidth: 10,
			naturalHeight: 10,
		};

		// Transparent pixel blocks left click completely
		transparentAlpha = 0;
		rootEl._listeners?.mousedown?.({ button: 0, clientX: 20, clientY: 20 });
		expect(getGhostEvents()).toHaveLength(0);
		transparentAlpha = 255;

		// First click: mousedown does not startDraggingWindow
		rootEl._listeners?.mousedown?.({ button: 0, clientX: 20, clientY: 20 });
		expect(
			invokedCommands.some((c) => c.cmd === "plugin:window|start_dragging"),
		).toBe(false);
		expect(getGhostEvents()).toContainEqual({
			type: "mousedown",
			scopeId: 1,
			clientX: 20,
			clientY: 20,
			rect: expectedRect,
			button: 0,
			device: "mouse",
		});

		globalListeners.mouseup?.({ button: 0, clientX: 20, clientY: 20 });
		expect(getGhostEvents()).toContainEqual({
			type: "mouseup",
			scopeId: 1,
			clientX: 20,
			clientY: 20,
			rect: expectedRect,
			button: 0,
			device: "mouse",
		});
		expect(getMenuActions()).toContainEqual({
			action: "talk",
			payload: { scope: 1, clientX: 20, clientY: 20, rect: expectedRect },
		});

		// Second click within 350ms -> dblclick
		emittedEvents.length = 0;
		vi.advanceTimersByTime(150);
		rootEl._listeners?.mousedown?.({ button: 0, clientX: 22, clientY: 21 });
		globalListeners.mouseup?.({ button: 0, clientX: 22, clientY: 21 });
		expect(getGhostEvents()).toContainEqual({
			type: "dblclick",
			scopeId: 1,
			clientX: 22,
			clientY: 21,
			rect: expectedRect,
			button: 0,
			device: "mouse",
		});
		expect(getMenuActions()).toHaveLength(0);

		// Third click within 350ms -> multipleclick (count 3)
		emittedEvents.length = 0;
		vi.advanceTimersByTime(150);
		rootEl._listeners?.mousedown?.({ button: 0, clientX: 21, clientY: 22 });
		globalListeners.mouseup?.({ button: 0, clientX: 21, clientY: 22 });
		expect(getGhostEvents()).toContainEqual({
			type: "multipleclick",
			scopeId: 1,
			clientX: 21,
			clientY: 22,
			rect: expectedRect,
			count: 3,
			button: 0,
			device: "mouse",
			isEx: false,
		});

		// Drag > 5px triggers startDraggingWindow, dragstart, dragend
		emittedEvents.length = 0;
		invokedCommands.length = 0;
		vi.advanceTimersByTime(500);
		rootEl._listeners?.mousedown?.({ button: 0, clientX: 10, clientY: 10 });
		globalListeners.mousemove?.({ clientX: 13, clientY: 13 });
		expect(
			invokedCommands.some((c) => c.cmd === "plugin:window|start_dragging"),
		).toBe(false);
		globalListeners.mousemove?.({ clientX: 25, clientY: 25 });
		expect(
			invokedCommands.some((c) => c.cmd === "plugin:window|start_dragging"),
		).toBe(true);
		expect(getGhostEvents()).toContainEqual({
			type: "dragstart",
			scopeId: 1,
			clientX: 25,
			clientY: 25,
			rect: expectedRect,
		});
		globalListeners.mouseup?.({ button: 0, clientX: 25, clientY: 25 });
		expect(getGhostEvents()).toContainEqual({
			type: "dragend",
			scopeId: 1,
			clientX: 25,
			clientY: 25,
			rect: expectedRect,
		});
		expect(getMenuActions()).toHaveLength(0);

		// Touch interaction normalizes device to "touch"
		emittedEvents.length = 0;
		vi.advanceTimersByTime(500);
		rootEl._listeners?.touchstart?.({
			touches: [{ clientX: 40, clientY: 40 }],
		});
		globalListeners.touchend?.({
			touches: [],
			changedTouches: [{ clientX: 40, clientY: 40 }],
		});
		expect(getGhostEvents()).toContainEqual({
			type: "mousedown",
			scopeId: 1,
			clientX: 40,
			clientY: 40,
			rect: expectedRect,
			button: 0,
			device: "touch",
		});
		expect(getGhostEvents()).toContainEqual({
			type: "mouseup",
			scopeId: 1,
			clientX: 40,
			clientY: 40,
			rect: expectedRect,
			button: 0,
			device: "touch",
		});
	});

	test("extended buttons (middle, xbutton1, xbutton2) emit mousedown-ex, mouseup-ex, click-ex, and multipleclick", () => {
		const expectedRect = {
			left: 0,
			top: 0,
			width: 100,
			height: 100,
			naturalWidth: 10,
			naturalHeight: 10,
		};
		const preventDefault = vi.fn();

		// Transparent pixel ignores extended button
		transparentAlpha = 0;
		rootEl._listeners?.mousedown?.({
			button: 1,
			clientX: 15,
			clientY: 15,
			preventDefault,
		});
		expect(getGhostEvents()).toHaveLength(0);
		expect(preventDefault).not.toHaveBeenCalled();
		transparentAlpha = 255;

		// button 1 -> middle (preserves menu-action open-dev)
		rootEl._listeners?.mousedown?.({
			button: 1,
			clientX: 15,
			clientY: 15,
			preventDefault,
		});
		expect(preventDefault).toHaveBeenCalledTimes(1);
		expect(getMenuActions()).toContainEqual({
			action: "open-dev",
			payload: { scope: 1 },
		});
		expect(getGhostEvents()).toContainEqual({
			type: "mousedown-ex",
			scopeId: 1,
			clientX: 15,
			clientY: 15,
			rect: expectedRect,
			button: "middle",
			device: "mouse",
		});
		globalListeners.mouseup?.({ button: 1, clientX: 15, clientY: 15 });
		expect(getGhostEvents()).toContainEqual({
			type: "mouseup-ex",
			scopeId: 1,
			clientX: 15,
			clientY: 15,
			rect: expectedRect,
			button: "middle",
			device: "mouse",
		});
		expect(getGhostEvents()).toContainEqual({
			type: "click-ex",
			scopeId: 1,
			clientX: 15,
			clientY: 15,
			rect: expectedRect,
			button: "middle",
			device: "mouse",
			isDouble: false,
		});

		// button 3 -> xbutton1 single, double, triple click
		emittedEvents.length = 0;
		rootEl._listeners?.mousedown?.({ button: 3, clientX: 30, clientY: 30 });
		globalListeners.mouseup?.({ button: 3, clientX: 30, clientY: 30 });
		expect(getGhostEvents()).toContainEqual({
			type: "click-ex",
			scopeId: 1,
			clientX: 30,
			clientY: 30,
			rect: expectedRect,
			button: "xbutton1",
			device: "mouse",
			isDouble: false,
		});

		emittedEvents.length = 0;
		vi.advanceTimersByTime(100);
		rootEl._listeners?.mousedown?.({ button: 3, clientX: 31, clientY: 30 });
		globalListeners.mouseup?.({ button: 3, clientX: 31, clientY: 30 });
		expect(getGhostEvents()).toContainEqual({
			type: "click-ex",
			scopeId: 1,
			clientX: 31,
			clientY: 30,
			rect: expectedRect,
			button: "xbutton1",
			device: "mouse",
			isDouble: true,
		});

		emittedEvents.length = 0;
		vi.advanceTimersByTime(100);
		rootEl._listeners?.mousedown?.({ button: 3, clientX: 30, clientY: 31 });
		globalListeners.mouseup?.({ button: 3, clientX: 30, clientY: 31 });
		expect(getGhostEvents()).toContainEqual({
			type: "multipleclick",
			scopeId: 1,
			clientX: 30,
			clientY: 31,
			rect: expectedRect,
			count: 3,
			button: "xbutton1",
			device: "mouse",
			isEx: true,
		});

		// button 4 -> xbutton2 moved > 5px emits mouseup-ex without click-ex
		emittedEvents.length = 0;
		rootEl._listeners?.mousedown?.({ button: 4, clientX: 20, clientY: 20 });
		globalListeners.mouseup?.({ button: 4, clientX: 40, clientY: 20 });
		expect(getGhostEvents()).toContainEqual({
			type: "mousedown-ex",
			scopeId: 1,
			clientX: 20,
			clientY: 20,
			rect: expectedRect,
			button: "xbutton2",
			device: "mouse",
		});
		expect(getGhostEvents()).toContainEqual({
			type: "mouseup-ex",
			scopeId: 1,
			clientX: 40,
			clientY: 20,
			rect: expectedRect,
			button: "xbutton2",
			device: "mouse",
		});
		expect(getGhostEvents().some((e) => e.type === "click-ex")).toBe(false);
	});

	test("right button gesture (> 20px) emits gesture and suppresses immediate contextmenu; contextmenu deduplicates shared events", () => {
		const expectedRect = {
			left: 0,
			top: 0,
			width: 100,
			height: 100,
			naturalWidth: 10,
			naturalHeight: 10,
		};

		// Transparent pixel skips right drag
		transparentAlpha = 0;
		rootEl._listeners?.mousedown?.({ button: 2, clientX: 20, clientY: 50 });
		globalListeners.mouseup?.({ button: 2, clientX: 80, clientY: 10 });
		expect(getGhostEvents()).toHaveLength(0);
		transparentAlpha = 255;

		// Right-drag gesture > 20px does not call startDraggingWindow
		rootEl._listeners?.mousedown?.({ button: 2, clientX: 20, clientY: 50 });
		expect(
			invokedCommands.some((c) => c.cmd === "plugin:window|start_dragging"),
		).toBe(false);
		globalListeners.mouseup?.({ button: 2, clientX: 60, clientY: 10 });
		expect(getGhostEvents()).toContainEqual({
			type: "gesture",
			scopeId: 1,
			startX: 20,
			startY: 50,
			endX: 60,
			endY: 10,
			rect: expectedRect,
			direction: "right_up",
		});

		// Immediate contextmenu is suppressed across bubbled listeners
		const suppressedEvt = {
			preventDefault: vi.fn(),
			clientX: 60,
			clientY: 10,
			screenX: 160,
			screenY: 110,
		};
		rootEl._listeners?.contextmenu?.(suppressedEvt);
		docListeners.contextmenu?.(suppressedEvt);
		globalListeners.contextmenu?.(suppressedEvt);
		expect(suppressedEvt.preventDefault).toHaveBeenCalledTimes(1);
		expect(invokedCommands.some((c) => c.cmd === "show_menu_window")).toBe(
			false,
		);

		// Next real contextmenu opens menu only once even when fired on root, document, and globalThis
		const menuEvt = {
			preventDefault: vi.fn(),
			clientX: 30,
			clientY: 40,
			screenX: 130,
			screenY: 140,
		};
		rootEl._listeners?.contextmenu?.(menuEvt);
		docListeners.contextmenu?.(menuEvt);
		globalListeners.contextmenu?.(menuEvt);
		expect(invokedCommands.filter((c) => c.cmd === "show_menu_window")).toEqual(
			[
				{
					cmd: "show_menu_window",
					args: { params: { x: 130, y: 140, scope: 1 } },
				},
			],
		);

		// Short right-drag (<= 20px) does not emit gesture or suppress contextmenu
		emittedEvents.length = 0;
		invokedCommands.length = 0;
		rootEl._listeners?.mousedown?.({ button: 2, clientX: 50, clientY: 50 });
		globalListeners.mouseup?.({ button: 2, clientX: 55, clientY: 55 });
		expect(getGhostEvents()).toHaveLength(0);

		const normalMenuEvt = {
			preventDefault: vi.fn(),
			clientX: 55,
			clientY: 55,
			screenX: 155,
			screenY: 155,
		};
		globalListeners.contextmenu?.(normalMenuEvt);
		expect(
			invokedCommands.filter((c) => c.cmd === "show_menu_window"),
		).toHaveLength(1);

		// Safety timeout (100ms) resets suppression even if no contextmenu fired right away
		invokedCommands.length = 0;
		rootEl._listeners?.mousedown?.({ button: 2, clientX: 20, clientY: 20 });
		globalListeners.mouseup?.({ button: 2, clientX: 60, clientY: 20 });
		vi.advanceTimersByTime(110);
		globalListeners.contextmenu?.({
			preventDefault: vi.fn(),
			clientX: 60,
			clientY: 20,
			screenX: 160,
			screenY: 120,
		});
		expect(
			invokedCommands.filter((c) => c.cmd === "show_menu_window"),
		).toHaveLength(1);
	});

	test("long press emits mouseup without talk, and multi-click resets on timeout or > 10px move", () => {
		const expectedRect = {
			left: 0,
			top: 0,
			width: 100,
			height: 100,
			naturalWidth: 10,
			naturalHeight: 10,
		};

		rootEl._listeners?.mousedown?.({
			button: 0,
			clientX: 15,
			clientY: 15,
			screenX: 115,
			screenY: 115,
		});
		vi.advanceTimersByTime(650);
		expect(
			invokedCommands.filter((c) => c.cmd === "show_menu_window"),
		).toHaveLength(1);
		globalListeners.mouseup?.({ button: 0, clientX: 15, clientY: 15 });
		expect(getGhostEvents()).toContainEqual({
			type: "mouseup",
			scopeId: 1,
			clientX: 15,
			clientY: 15,
			rect: expectedRect,
			button: 0,
			device: "mouse",
		});
		expect(getMenuActions()).toHaveLength(0);

		// Clicks > 10px apart do not trigger dblclick
		emittedEvents.length = 0;
		rootEl._listeners?.mousedown?.({ button: 0, clientX: 10, clientY: 10 });
		globalListeners.mouseup?.({ button: 0, clientX: 10, clientY: 10 });
		vi.advanceTimersByTime(100);
		rootEl._listeners?.mousedown?.({ button: 0, clientX: 30, clientY: 10 });
		globalListeners.mouseup?.({ button: 0, clientX: 30, clientY: 10 });
		expect(getGhostEvents().some((e) => e.type === "dblclick")).toBe(false);
		expect(getMenuActions().filter((a) => a.action === "talk")).toHaveLength(2);
	});

	test("hover, stroke, mouseenter/mouseleave, and wheel events", () => {
		const expectedRect = {
			left: 0,
			top: 0,
			width: 100,
			height: 100,
			naturalWidth: 10,
			naturalHeight: 10,
		};

		// mouseenter
		rootEl._listeners?.mouseenter?.({ clientX: 10, clientY: 15 });
		expect(getGhostEvents()).toContainEqual({
			type: "mouseenter",
			scopeId: 1,
			clientX: 10,
			clientY: 15,
			rect: expectedRect,
			isWindow: true,
		});

		// mousemove stroke accumulation (>= 40px) & transparent pixel ignoring
		emittedEvents.length = 0;
		transparentAlpha = 0;
		globalListeners.mousemove?.({ clientX: 10, clientY: 10 });
		globalListeners.mousemove?.({ clientX: 80, clientY: 10 });
		vi.advanceTimersByTime(350);
		expect(getGhostEvents()).toHaveLength(0);
		transparentAlpha = 255;

		globalListeners.mousemove?.({ clientX: 10, clientY: 20 });
		globalListeners.mousemove?.({ clientX: 35, clientY: 20 }); // +25px
		expect(getGhostEvents().filter((e) => e.type !== "mousemove")).toHaveLength(
			0,
		);
		expect(getGhostEvents()).toContainEqual({
			type: "mousemove",
			scopeId: 1,
			clientX: 10,
			clientY: 20,
			rect: expectedRect,
		});
		expect(getGhostEvents()).toContainEqual({
			type: "mousemove",
			scopeId: 1,
			clientX: 35,
			clientY: 20,
			rect: expectedRect,
		});
		globalListeners.mousemove?.({ clientX: 55, clientY: 20 }); // +20px => 45px >= 40
		expect(getGhostEvents()).toContainEqual({
			type: "stroke",
			scopeId: 1,
			clientX: 55,
			clientY: 20,
			rect: expectedRect,
		});

		// Hover timer fires 300ms after last opaque mousemove
		emittedEvents.length = 0;
		vi.advanceTimersByTime(200);
		expect(getGhostEvents()).toHaveLength(0);
		globalListeners.mousemove?.({ clientX: 60, clientY: 20 }); // resets 300ms timer
		vi.advanceTimersByTime(200);
		expect(getGhostEvents().filter((e) => e.type !== "mousemove")).toHaveLength(
			0,
		);
		vi.advanceTimersByTime(100);
		expect(getGhostEvents()).toContainEqual({
			type: "hover",
			scopeId: 1,
			clientX: 60,
			clientY: 20,
			rect: expectedRect,
		});

		// mouseleave cancels pending hover timer and emits mouseleave
		emittedEvents.length = 0;
		globalListeners.mousemove?.({ clientX: 65, clientY: 20 });
		rootEl._listeners?.mouseleave?.({ clientX: 65, clientY: 20 });
		vi.advanceTimersByTime(400);
		expect(getGhostEvents().filter((e) => e.type !== "mousemove")).toEqual([
			{
				type: "mouseleave",
				scopeId: 1,
				clientX: 65,
				clientY: 20,
				rect: expectedRect,
				isWindow: true,
			},
		]);

		// wheel checks transparency and emits wheel event without changing character scale
		emittedEvents.length = 0;
		invokedCommands.length = 0;
		transparentAlpha = 0;
		rootEl._listeners?.wheel?.({ clientX: 50, clientY: 50, deltaY: 120 });
		expect(invokedCommands).toHaveLength(0);
		expect(getGhostEvents()).toHaveLength(0);
		transparentAlpha = 255;

		const wheelPreventDefault = vi.fn();
		rootEl._listeners?.wheel?.({
			clientX: 50,
			clientY: 50,
			deltaY: 120,
			cancelable: true,
			preventDefault: wheelPreventDefault,
		});
		expect(wheelPreventDefault).toHaveBeenCalledTimes(1);
		expect(invokedCommands).toHaveLength(0);
		expect(getGhostEvents()).toContainEqual({
			type: "wheel",
			scopeId: 1,
			clientX: 50,
			clientY: 50,
			rect: expectedRect,
			delta: 120,
		});

		invokedCommands.length = 0;
		emittedEvents.length = 0;
		rootEl._listeners?.wheel?.({
			clientX: 50,
			clientY: 50,
			deltaY: -119.6,
		});
		expect(invokedCommands).toHaveLength(0);
		expect(getGhostEvents()).toContainEqual({
			type: "wheel",
			scopeId: 1,
			clientX: 50,
			clientY: 50,
			rect: expectedRect,
			delta: -120,
		});
	});

	test("throttles opaque mousemove events by >= 50ms or >= 4px and resets on transparent pixel", () => {
		const expectedRect = {
			left: 0,
			top: 0,
			width: 100,
			height: 100,
			naturalWidth: 10,
			naturalHeight: 10,
		};

		// First opaque move emits immediately
		globalListeners.mousemove?.({ clientX: 10, clientY: 10 });
		expect(getGhostEvents().filter((e) => e.type === "mousemove")).toEqual([
			{
				type: "mousemove",
				scopeId: 1,
				clientX: 10,
				clientY: 10,
				rect: expectedRect,
			},
		]);

		// Sub-4px move within 50ms is throttled
		emittedEvents.length = 0;
		vi.advanceTimersByTime(20);
		globalListeners.mousemove?.({ clientX: 12, clientY: 11 });
		expect(getGhostEvents().filter((e) => e.type === "mousemove")).toEqual([]);

		// Move >= 4px from last emitted position emits immediately even within 50ms
		vi.advanceTimersByTime(10);
		globalListeners.mousemove?.({ clientX: 15, clientY: 10 });
		expect(getGhostEvents().filter((e) => e.type === "mousemove")).toEqual([
			{
				type: "mousemove",
				scopeId: 1,
				clientX: 15,
				clientY: 10,
				rect: expectedRect,
			},
		]);

		// Small move after >= 50ms also emits
		emittedEvents.length = 0;
		vi.advanceTimersByTime(50);
		globalListeners.mousemove?.({ clientX: 16, clientY: 10 });
		expect(getGhostEvents().filter((e) => e.type === "mousemove")).toEqual([
			{
				type: "mousemove",
				scopeId: 1,
				clientX: 16,
				clientY: 10,
				rect: expectedRect,
			},
		]);

		// Transparent pixel suppresses emission and resets throttle so next opaque move emits
		emittedEvents.length = 0;
		transparentAlpha = 0;
		globalListeners.mousemove?.({ clientX: 17, clientY: 10 });
		expect(getGhostEvents()).toHaveLength(0);
		transparentAlpha = 255;
		globalListeners.mousemove?.({ clientX: 17, clientY: 10 });
		expect(getGhostEvents().filter((e) => e.type === "mousemove")).toEqual([
			{
				type: "mousemove",
				scopeId: 1,
				clientX: 17,
				clientY: 10,
				rect: expectedRect,
			},
		]);
	});

	test("resizes show_subchar_window from decoded image dimensions and rescales on character-scale-changed", async () => {
		const prevImage = g.Image;
		try {
			// Reset state first
			await listenCallbacks["character-scale-changed"]?.({
				payload: { scale: 1.0, scalePercent: 100 },
			});
			invokedCommands.length = 0;

			// 1. Fallback img.onload path (when Image constructor is unavailable)
			imgEl.naturalWidth = 160;
			imgEl.naturalHeight = 280;
			imgEl.complete = false;
			await listenCallbacks["update-subchar-image-1"]?.({
				payload: { src: "char-160x280.png" },
			});
			imgEl.onload?.();

			expect(imgEl.width).toBe(160);
			expect(imgEl.height).toBe(280);
			expect(invokedCommands).toContainEqual({
				cmd: "show_subchar_window",
				args: {
					params: { scope_id: 1, width: 160, height: 280 },
					scope_id: 1,
					scopeId: 1,
					width: 160,
					height: 280,
				},
			});

			// 2. Rescale via character-scale-changed (scale: 1.5)
			invokedCommands.length = 0;
			await listenCallbacks["character-scale-changed"]?.({
				payload: { scale: 1.5, scalePercent: 150 },
			});

			expect(imgEl.width).toBe(240);
			expect(imgEl.height).toBe(420);
			expect(invokedCommands).toContainEqual({
				cmd: "show_subchar_window",
				args: {
					params: { scope_id: 1, width: 240, height: 420 },
					scope_id: 1,
					scopeId: 1,
					width: 240,
					height: 420,
				},
			});

			// 3. Rescale via scalePercent only (scalePercent: 50)
			invokedCommands.length = 0;
			await listenCallbacks["character-scale-changed"]?.({
				payload: { scalePercent: 50 },
			});

			expect(imgEl.width).toBe(80);
			expect(imgEl.height).toBe(140);
			expect(invokedCommands).toContainEqual({
				cmd: "show_subchar_window",
				args: {
					params: { scope_id: 1, width: 80, height: 140 },
					scope_id: 1,
					scopeId: 1,
					width: 80,
					height: 140,
				},
			});

			// 4. Image preloader decode path uses currentScale and clamps minimum size to 32
			class MockImage {
				naturalWidth = 200;
				naturalHeight = 300;
				complete = false;
				onload: (() => void) | null = null;
				onerror: (() => void) | null = null;
				private _src = "";
				get src() {
					return this._src;
				}
				set src(val: string) {
					this._src = val;
					this.complete = true;
					this.onload?.();
				}
				decode() {
					return Promise.resolve();
				}
			}
			g.Image = MockImage;
			invokedCommands.length = 0;
			await listenCallbacks["update-subchar-image-1"]?.({
				payload: { src: "preloaded.png" },
			});
			await Promise.resolve();
			await Promise.resolve();

			// currentScale is 0.5 from step 3 -> 200*0.5 = 100, 300*0.5 = 150
			expect(imgEl.width).toBe(100);
			expect(imgEl.height).toBe(150);
			expect(invokedCommands).toContainEqual({
				cmd: "show_subchar_window",
				args: {
					params: { scope_id: 1, width: 100, height: 150 },
					scope_id: 1,
					scopeId: 1,
					width: 100,
					height: 150,
				},
			});

			// Small image clamps to minimum 32x32
			invokedCommands.length = 0;
			imgEl.naturalWidth = 20;
			imgEl.naturalHeight = 20;
			delete g.Image;
			await listenCallbacks["update-subchar-image-1"]?.({
				payload: { src: "tiny.png" },
			});
			imgEl.onload?.();
			expect(imgEl.width).toBe(32);
			expect(imgEl.height).toBe(32);
		} finally {
			if (prevImage === undefined) {
				delete g.Image;
			} else {
				g.Image = prevImage;
			}
			await listenCallbacks["character-scale-changed"]?.({
				payload: { scale: 1.0, scalePercent: 100 },
			});
			await listenCallbacks["update-subchar-image-1"]?.({ payload: null });
			imgEl.naturalWidth = 10;
			imgEl.naturalHeight = 10;
			imgEl.width = 0;
			imgEl.height = 0;
			imgEl.complete = false;
			imgEl.onload = undefined;
		}
	});
});
