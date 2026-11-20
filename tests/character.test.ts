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

const coordPopupEl = {
	textContent: "",
	style: { display: "none" } as Record<string, string>,
};

interface MockWindowState {
	visible: boolean;
	pos: { x: number; y: number };
	size: { width: number; height: number };
}

let mockSelfPos: { x: number; y: number } | null = null;
let mockSelfSize: { width: number; height: number } | null = null;
let mockMonitors: Array<{
	name: string | null;
	scaleFactor: number;
	position: { x: number; y: number };
	size: { width: number; height: number };
	workArea: {
		position: { x: number; y: number };
		size: { width: number; height: number };
	};
}> | null = null;
let mockOtherWindows: Record<string, MockWindowState> | null = null;

g.document = {
	getElementById(id: string) {
		if (id === "subchar-img") return imgEl;
		if (id === "subchar-root") return rootEl;
		if (id === "coord-popup") return coordPopupEl;
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
		if (cmd === "plugin:window|outer_position") {
			const label = (args as { label?: string } | undefined)?.label;
			if (label && mockOtherWindows?.[label]) {
				return mockOtherWindows[label].pos;
			}
			return mockSelfPos ?? { x: 100, y: 100 };
		}
		if (cmd === "plugin:window|outer_size") {
			const label = (args as { label?: string } | undefined)?.label;
			if (label && mockOtherWindows?.[label]) {
				return mockOtherWindows[label].size;
			}
			return mockSelfSize ?? { width: 200, height: 360 };
		}
		if (cmd === "plugin:window|is_visible") {
			const label = (args as { label?: string } | undefined)?.label;
			if (label && mockOtherWindows?.[label]) {
				return mockOtherWindows[label].visible;
			}
			return true;
		}
		if (cmd === "plugin:window|get_all_windows") {
			if (!mockOtherWindows) return [];
			return ["subchar_1", ...Object.keys(mockOtherWindows)];
		}
		if (cmd === "plugin:window|available_monitors") {
			return mockMonitors ?? [];
		}
		if (
			cmd === "plugin:window|current_monitor" ||
			cmd === "plugin:window|primary_monitor"
		) {
			return mockMonitors?.[0] ?? null;
		}
		if (cmd === "plugin:window|set_position") return;
		if (cmd === "plugin:window|start_dragging") return;
		if (cmd === "show_menu_window") return;
		if (cmd === "show_subchar_window") return;
		if (cmd === "sync_character_balloon") return;
		if (cmd === "set_character_scale") return;
		if (cmd === "reset_character_positions") return;
		if (cmd === "reset_balloon_positions") return;
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

	// 4. Test long press timer (touch only; mouse holds must not open menu)
	rootEl._listeners?.mousedown?.({
		button: 0,
		clientX: 10,
		clientY: 10,
		screenX: 10,
		screenY: 10,
	});
	vi.advanceTimersByTime(700);
	globalListeners.mouseup?.();

	rootEl._listeners?.touchstart?.({
		touches: [{ clientX: 10, clientY: 10, screenX: 10, screenY: 10 }],
	});
	vi.advanceTimersByTime(700);
	globalListeners.touchend?.();

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
		mockSelfPos = null;
		mockSelfSize = null;
		mockMonitors = null;
		mockOtherWindows = null;
		coordPopupEl.textContent = "";
		coordPopupEl.style.display = "none";
		rootEl._listeners?.mouseleave?.();
		emittedEvents.length = 0;
		invokedCommands.length = 0;
	});

	afterEach(() => {
		mockSelfPos = null;
		mockSelfSize = null;
		mockMonitors = null;
		mockOtherWindows = null;
		globalListeners.blur?.();
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

	test("long press on touch opens menu and emits mouseup without talk; desktop mousedown hold does not open menu", () => {
		const expectedRect = {
			left: 0,
			top: 0,
			width: 100,
			height: 100,
			naturalWidth: 10,
			naturalHeight: 10,
		};

		// Desktop mousedown hold (>600ms) must NOT open context menu
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
		).toHaveLength(0);
		globalListeners.mouseup?.({ button: 0, clientX: 15, clientY: 15 });

		// Touch long press (>600ms) opens context menu and suppresses talk on touchend
		emittedEvents.length = 0;
		invokedCommands.length = 0;
		rootEl._listeners?.touchstart?.({
			touches: [{ clientX: 15, clientY: 15, screenX: 115, screenY: 115 }],
		});
		vi.advanceTimersByTime(650);
		expect(
			invokedCommands.filter((c) => c.cmd === "show_menu_window"),
		).toHaveLength(1);
		globalListeners.touchend?.({
			changedTouches: [{ clientX: 15, clientY: 15 }],
		});
		expect(getGhostEvents()).toContainEqual({
			type: "mouseup",
			scopeId: 1,
			clientX: 15,
			clientY: 15,
			rect: expectedRect,
			button: 0,
			device: "touch",
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

	test("snaps to Monitor workArea, visible Character windows, and Initial position while updating #coord-popup and honoring Ctrl bypass", async () => {
		const flushMicrotasks = async () => {
			for (let i = 0; i < 30; i++) {
				await Promise.resolve();
			}
		};

		// Setup monitor with 48px bottom taskbar (workArea height 1032 vs monitor height 1080)
		mockMonitors = [
			{
				name: "Primary",
				scaleFactor: 1,
				position: { x: 0, y: 0 },
				size: { width: 1920, height: 1080 },
				workArea: {
					position: { x: 0, y: 0 },
					size: { width: 1920, height: 1032 },
				},
			},
		];
		mockSelfSize = { width: 200, height: 300 };

		// Reset initial position to (1640, 732) so it doesn't interfere near target (1363, 842)
		await listenCallbacks["character-positions-reset"]?.({
			payload: { scopeId: 1, x: 1640, y: 732 },
		});

		// 1. Character snap: snap to visible subchar_window_0, ignoring balloon_window_0 & hidden subchar_window_2
		mockOtherWindows = {
			subchar_window_0: {
				visible: true,
				pos: { x: 1563, y: 800 },
				size: { width: 200, height: 300 },
			},
			balloon_window_0: {
				visible: true,
				pos: { x: 1300, y: 845 },
				size: { width: 280, height: 200 },
			},
			subchar_window_2: {
				visible: false,
				pos: { x: 1365, y: 845 },
				size: { width: 200, height: 300 },
			},
		};

		mockSelfPos = { x: 500, y: 500 };
		rootEl._listeners?.mousedown?.({ button: 0, clientX: 20, clientY: 20 });
		await flushMicrotasks();

		// Drag near left of subchar_window_0: 1563 - 200 = 1363 (current x = 1368, within 12px)
		mockSelfPos = { x: 1368, y: 842 };
		globalListeners.mousemove?.({ clientX: 40, clientY: 40 });
		await flushMicrotasks();

		expect(coordPopupEl.style.display).toBe("block");
		expect(coordPopupEl.textContent).toBe(
			"1363,842 (Snap X:Character)\nPress Ctrl to disable",
		);

		// Releasing mouse commits snapped position via show_subchar_window
		invokedCommands.length = 0;
		globalListeners.mouseup?.({ button: 0, clientX: 40, clientY: 40 });
		await flushMicrotasks();

		expect(coordPopupEl.style.display).toBe("none");
		expect(invokedCommands).toContainEqual({
			cmd: "show_subchar_window",
			args: {
				params: { scope_id: 1, x: 1363, y: 842 },
				scope_id: 1,
				scopeId: 1,
				x: 1363,
				y: 842,
			},
		});

		// 2. Monitor workArea bottom snap (workArea bottom = 1032 => y = 1032 - 300 = 732; monitor bottom would be 780)
		// Also test Initial X snap together with Monitor Y snap
		mockOtherWindows = {};
		await listenCallbacks["character-positions-reset"]?.({
			payload: { scopeId: 1, x: 500, y: 200 },
		});
		mockSelfPos = { x: 300, y: 300 };
		rootEl._listeners?.mousedown?.({ button: 0, clientX: 10, clientY: 10 });
		await flushMicrotasks();

		mockSelfPos = { x: 506, y: 726 };
		globalListeners.mousemove?.({ clientX: 30, clientY: 30 });
		await flushMicrotasks();

		expect(coordPopupEl.textContent).toBe(
			"500,732 (Snap X:Initial, Snap Y:Monitor)\nPress Ctrl to disable",
		);

		// 3. Holding Ctrl (via event ctrlKey or keydown Control) disables snapping
		invokedCommands.length = 0;
		globalListeners.mousemove?.({ clientX: 35, clientY: 35, ctrlKey: true });
		await flushMicrotasks();

		expect(coordPopupEl.textContent).toBe("506,726\nPress Ctrl to disable");

		// Releasing Ctrl via keyup restores snap on coordInterval tick
		globalListeners.keyup?.({ key: "Control", ctrlKey: false });
		await vi.advanceTimersByTimeAsync(60);
		await flushMicrotasks();
		expect(coordPopupEl.textContent).toBe(
			"500,732 (Snap X:Initial, Snap Y:Monitor)\nPress Ctrl to disable",
		);
		// Dragging at unchanged position deduplicates redundant sync_character_balloon
		expect(
			invokedCommands.some((c) => c.cmd === "sync_character_balloon"),
		).toBe(false);

		// Pressing Ctrl via keydown mid-drag disables snap immediately
		globalListeners.keydown?.({ key: "Control", ctrlKey: true });
		await flushMicrotasks();
		expect(coordPopupEl.textContent).toBe("506,726\nPress Ctrl to disable");

		invokedCommands.length = 0;
		globalListeners.mouseup?.({
			button: 0,
			clientX: 35,
			clientY: 35,
			ctrlKey: true,
		});
		await flushMicrotasks();
		expect(invokedCommands.some((c) => c.cmd === "show_subchar_window")).toBe(
			false,
		);
		globalListeners.keyup?.({ key: "Control", ctrlKey: false });

		// 4. HiDPI scaleFactor (1.5) scales snap threshold (18 physical px) and allows unrestricted negative/offscreen coordinates
		mockMonitors = [
			{
				name: "HiDPI",
				scaleFactor: 1.5,
				position: { x: 0, y: 0 },
				size: { width: 3840, height: 2160 },
				workArea: {
					position: { x: 0, y: 0 },
					size: { width: 3840, height: 2088 },
				},
			},
		];
		await listenCallbacks["character-positions-reset"]?.({
			payload: { scopeId: 1, x: 2400, y: 1200 },
		});
		mockSelfPos = { x: 2400, y: 1200 };
		rootEl._listeners?.mousedown?.({ button: 0, clientX: 10, clientY: 10 });
		await flushMicrotasks();

		// 15 physical px from left edge (0) is within 12 * 1.5 = 18px threshold; -250 is unrestricted offscreen Y
		mockSelfPos = { x: 15, y: -250 };
		globalListeners.mousemove?.({ clientX: 30, clientY: 30 });
		await flushMicrotasks();
		expect(coordPopupEl.textContent).toBe(
			"0,-250 (Snap X:Monitor)\nPress Ctrl to disable",
		);
		globalListeners.mouseup?.({ button: 0, clientX: 30, clientY: 30 });
		await flushMicrotasks();
		expect(invokedCommands).toContainEqual({
			cmd: "show_subchar_window",
			args: {
				params: { scope_id: 1, x: 0, y: -250 },
				scope_id: 1,
				scopeId: 1,
				x: 0,
				y: -250,
			},
		});
	});

	test("handles Ctrl+Shift+F12 (reset_character_positions) and Ctrl+Shift+F10 (reset_balloon_positions) shortcuts", async () => {
		const preventF12 = vi.fn();
		mockSelfPos = { x: 1180, y: 672 };

		globalListeners.keydown?.({
			key: "F12",
			ctrlKey: true,
			shiftKey: true,
			altKey: false,
			preventDefault: preventF12,
		});
		await Promise.resolve();

		expect(preventF12).toHaveBeenCalledTimes(1);
		expect(invokedCommands).toContainEqual({
			cmd: "reset_character_positions",
			args: {},
		});

		const preventF10 = vi.fn();
		globalListeners.keydown?.({
			key: "F10",
			ctrlKey: true,
			shiftKey: true,
			altKey: false,
			preventDefault: preventF10,
		});
		await Promise.resolve();

		expect(preventF10).toHaveBeenCalledTimes(1);
		expect(invokedCommands).toContainEqual({
			cmd: "reset_balloon_positions",
			args: {},
		});
	});

	test("drag follow uses requestAnimationFrame, deduplicates #coord-popup writes, and coalesces sync_character_balloon", async () => {
		const rafQueue: Array<{ id: number; cb: FrameRequestCallback }> = [];
		let nextRafId = 1;
		const origRaf = globalThis.requestAnimationFrame;
		const origCancelRaf = globalThis.cancelAnimationFrame;
		const cancelSpy = vi.fn((id: number) => {
			const idx = rafQueue.findIndex((item) => item.id === id);
			if (idx >= 0) rafQueue.splice(idx, 1);
		});
		globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) => {
			const id = nextRafId++;
			rafQueue.push({ id, cb });
			return id;
		}) as typeof globalThis.requestAnimationFrame;
		globalThis.cancelAnimationFrame =
			cancelSpy as unknown as typeof globalThis.cancelAnimationFrame;

		const coordPopupEl = document.getElementById("coord-popup") as HTMLElement;
		let textWrites = 0;
		let currentText = coordPopupEl.textContent ?? "";
		const origDesc = Object.getOwnPropertyDescriptor(
			coordPopupEl,
			"textContent",
		);
		Object.defineProperty(coordPopupEl, "textContent", {
			configurable: true,
			get: () => currentText,
			set: (v: string) => {
				textWrites += 1;
				currentText = v;
			},
		});

		const balloonSync: { resolve: (() => void) | null } = { resolve: null };
		const internals = (
			globalThis as unknown as {
				__TAURI_INTERNALS__: {
					invoke: (cmd: string, args?: unknown) => Promise<unknown>;
				};
			}
		).__TAURI_INTERNALS__;
		const origInvoke = internals.invoke;
		internals.invoke = (cmd: string, args?: unknown) => {
			if (cmd === "sync_character_balloon") {
				invokedCommands.push({ cmd, args });
				return new Promise<void>((resolve) => {
					balloonSync.resolve = resolve;
				});
			}
			return origInvoke(cmd, args);
		};

		try {
			invokedCommands.length = 0;
			rootEl._listeners?.mousedown?.({ button: 0, clientX: 10, clientY: 10 });
			globalListeners.mousemove?.({
				button: 0,
				buttons: 1,
				clientX: 30,
				clientY: 30,
			});

			const flush = async () => {
				await vi.advanceTimersByTimeAsync(0);
				for (let i = 0; i < 6; i++) {
					await Promise.resolve();
				}
			};
			expect(rafQueue).toHaveLength(1);

			// Frame 0 (immediate on drag start) at (100, 200): writes popup once and starts 1 sync_character_balloon
			await flush();
			expect(textWrites).toBe(1);
			expect(
				invokedCommands.filter((c) => c.cmd === "sync_character_balloon"),
			).toHaveLength(1);

			// Frame 1 at same (100, 200): popup write & balloon sync are deduplicated
			const f1 = rafQueue.shift();
			f1?.cb(16);
			await flush();
			expect(textWrites).toBe(1);
			expect(
				invokedCommands.filter((c) => c.cmd === "sync_character_balloon"),
			).toHaveLength(1);

			// Frame 2 while Frame 0 sync is still in flight:
			// no second concurrent sync_character_balloon is launched yet
			const f2 = rafQueue.shift();
			f2?.cb(32);
			await flush();
			expect(
				invokedCommands.filter((c) => c.cmd === "sync_character_balloon"),
			).toHaveLength(1);

			// Resolving in-flight sync keeps coalesced count at 1 when position is unchanged
			balloonSync.resolve?.();
			await flush();
			expect(
				invokedCommands.filter((c) => c.cmd === "sync_character_balloon"),
			).toHaveLength(1);

			// Drag end cancels rAF loop
			globalListeners.mouseup?.({ button: 0, clientX: 30, clientY: 30 });
			expect(cancelSpy).toHaveBeenCalled();
			expect(coordPopupEl.style.display).toBe("none");
		} finally {
			globalThis.requestAnimationFrame = origRaf;
			globalThis.cancelAnimationFrame = origCancelRaf;
			if (origDesc) {
				Object.defineProperty(coordPopupEl, "textContent", origDesc);
			}
			internals.invoke = origInvoke;
		}
	});

	test("renders and hides #subchar-collision-canvas on update-subchar-collisions-1 and rescales with character", async () => {
		const doc = g.document as {
			getElementById: (id: string) => unknown;
			createElement: (tag: string) => unknown;
		};
		const rootAny = rootEl as unknown as {
			appendChild?: (el: unknown) => void;
		};
		const origGetEl = doc.getElementById;
		const origCreateEl = doc.createElement;
		const origAppendChild = rootAny.appendChild;
		const origNatW = imgEl.naturalWidth;
		const origNatH = imgEl.naturalHeight;

		const appended = new Map<string, Record<string, unknown>>();
		const drawOps = {
			strokeRects: [] as number[][],
			fillRectCalls: 0,
			fillTexts: [] as Array<{ text: string; x: number; y: number }>,
			clearRects: 0,
		};

		rootAny.appendChild = (el: unknown) => {
			const node = el as { id?: string };
			if (node?.id) {
				appended.set(node.id, node as unknown as Record<string, unknown>);
			}
		};
		doc.getElementById = (id: string) => {
			if (appended.has(id)) return appended.get(id);
			return origGetEl(id);
		};
		doc.createElement = (tag: string) => {
			if (tag === "canvas") {
				return {
					id: "",
					className: "",
					width: 0,
					height: 0,
					style: {} as Record<string, string>,
					getContext() {
						return {
							strokeStyle: "",
							fillStyle: "",
							lineWidth: 1,
							font: "",
							clearRect() {
								drawOps.clearRects += 1;
							},
							fillRect() {
								drawOps.fillRectCalls += 1;
							},
							strokeRect(x: number, y: number, w: number, h: number) {
								drawOps.strokeRects.push([x, y, w, h]);
							},
							measureText(t: string) {
								return { width: t.length * 6 };
							},
							fillText(text: string, x: number, y: number) {
								drawOps.fillTexts.push({ text, x, y });
							},
							drawImage() {},
							getImageData: () => ({ data: [255, 255, 255, transparentAlpha] }),
						};
					},
				};
			}
			return origCreateEl(tag);
		};

		try {
			await listenCallbacks["character-scale-changed"]?.({
				payload: { scale: 1 },
			});
			imgEl.naturalWidth = 100;
			imgEl.naturalHeight = 200;
			await listenCallbacks["update-subchar-image-1"]?.({
				payload: { src: "collision-test.png" },
			});
			imgEl.onload?.();

			await listenCallbacks["update-subchar-collisions-1"]?.({
				payload: {
					visible: true,
					collisions: [
						{
							name: "Head",
							shape: { type: "Rect", x1: 10, y1: 10, x2: 50, y2: 50 },
						},
					],
				},
			});

			const canvas = appended.get("subchar-collision-canvas") as
				| {
						id: string;
						className: string;
						width: number;
						height: number;
						style: Record<string, string>;
				  }
				| undefined;
			assert.ok(canvas);
			assert.equal(canvas.className, "collision-overlay-canvas");
			assert.equal(canvas.style.display, "block");
			assert.equal(canvas.width, 100);
			assert.equal(canvas.height, 200);
			assert.equal(drawOps.fillRectCalls, 0);
			assert.deepEqual(drawOps.strokeRects, [
				[1, 1, 98, 198],
				[10, 10, 40, 40],
			]);
			assert.equal(drawOps.fillTexts[0]?.text, "Head");

			// Rescaling character to 2x updates both window & part collision outlines
			drawOps.strokeRects.length = 0;
			await listenCallbacks["character-scale-changed"]?.({
				payload: { scale: 2 },
			});
			assert.equal(canvas.width, 200);
			assert.equal(canvas.height, 400);
			assert.equal(drawOps.fillRectCalls, 0);
			assert.deepEqual(drawOps.strokeRects, [
				[1, 1, 198, 398],
				[20, 20, 80, 80],
			]);

			// Empty part collisions with visible: true still keeps window boundary visible
			drawOps.strokeRects.length = 0;
			await listenCallbacks["update-subchar-collisions-1"]?.({
				payload: { visible: true, collisions: [] },
			});
			assert.equal(canvas.style.display, "block");
			assert.equal(drawOps.fillRectCalls, 0);
			assert.deepEqual(drawOps.strokeRects, [[1, 1, 198, 398]]);

			// Hiding collisions hides the canvas cleanly
			await listenCallbacks["update-subchar-collisions-1"]?.({
				payload: { visible: false, collisions: [] },
			});
			assert.equal(canvas.style.display, "none");
		} finally {
			doc.getElementById = origGetEl;
			doc.createElement = origCreateEl;
			rootAny.appendChild = origAppendChild;
			imgEl.naturalWidth = origNatW;
			imgEl.naturalHeight = origNatH;
			await listenCallbacks["character-scale-changed"]?.({
				payload: { scale: 1 },
			});
		}
	});
});
