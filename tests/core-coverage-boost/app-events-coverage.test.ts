import assert from "node:assert/strict";
import { describe, it, vi } from "vitest";
import { handleMenuActionImpl } from "../../ui/ts/core/actions/menu-action-dispatcher.js";
import { eventMethods } from "../../ui/ts/core/app-events.js";

describe("core-coverage-boost: app-events edge cases", () => {
	it("dispatches mouse down, up, wheel, drag start/end, and hover events with UKADOC coordinates", () => {
		const sentEvents = [];
		const app = {
			...eventMethods,
			ghostController: {
				sendShioriEvent: (evt, args) => {
					sentEvents.push({ evt, args });
				},
			},
			getCollisionInfo: (_x, _y, _r, scopeId) => ({
				name: "Head",
				canvasX: 42,
				canvasY: 99,
				scopeId,
			}),
			sakuraPlayer: {
				timeCritical: false,
				isPlaying: false,
			},
		};

		app.onGhostMouseDown(10, 10, {}, 0, "mouse", 0);
		app.onGhostMouseUp(10, 10, {}, 0, "mouse", 0);
		app.onGhostWheel(10, 10, {}, 120, 0);
		app.onGhostDragStart(10, 10, {}, 0);
		app.onGhostDragEnd(10, 10, {}, 0);
		app.onGhostHover(10, 10, {}, 0);

		assert.equal(sentEvents[0].evt, "OnMouseDown");
		assert.deepEqual(sentEvents[0].args, [42, 99, 0, 0, "Head", 0, "mouse"]);

		assert.equal(sentEvents[1].evt, "OnMouseUp");
		assert.equal(sentEvents[2].evt, "OnMouseWheel");
		assert.equal(sentEvents[2].args[2], 120);

		assert.equal(sentEvents[3].evt, "OnMouseDragStart");
		assert.equal(sentEvents[4].evt, "OnMouseDragEnd");
		assert.equal(sentEvents[5].evt, "OnMouseHover");
	});

	it("suppresses mouse events during timeCritical && isPlaying", () => {
		const sentEvents = [];
		const app = {
			...eventMethods,
			ghostController: {
				sendShioriEvent: (evt, args) => {
					sentEvents.push({ evt, args });
				},
			},
			getCollisionInfo: () => ({ name: "Head", canvasX: 0, canvasY: 0 }),
			sakuraPlayer: {
				timeCritical: true,
				isPlaying: true,
			},
		};

		app.onGhostClick(0, 0, {}, 0);
		app.onGhostStroke(0, 0, {}, 0);
		app.onGhostMouseDown(0, 0, {}, 0);
		app.onGhostMouseUp(0, 0, {}, 0);
		app.onGhostWheel(0, 0, {}, 0);
		app.onGhostDragStart(0, 0, {}, 0);
		app.onGhostDragEnd(0, 0, {}, 0);
		app.onGhostHover(0, 0, {}, 0);

		assert.equal(sentEvents.length, 0);
	});

	it("listens to request-subchar-image and emits updated subchar surface image", async () => {
		globalThis.window = globalThis;
		globalThis.addEventListener = () => {};
		let emittedEvent = null;
		let emittedPayload = null;
		let subcharHandler = null;

		globalThis.__TAURI_INTERNALS__ = {
			invoke: async (cmd, args) => {
				if (cmd === "plugin:event|listen") {
					if (args.event === "request-subchar-image") {
						subcharHandler = args.handler;
					}
				}
				if (cmd === "plugin:event|emit") {
					emittedEvent = args.event;
					emittedPayload = args.payload;
				}
			},
			transformCallback: (cb) => cb,
		};

		const surfacesMap = new Map();
		surfacesMap.set(1, "asset://subchar1.png");

		const app = {
			...eventMethods,
			ghostController: {
				currentSurfaces: surfacesMap,
			},
			syncMenuGhosts: () => {},
			handleMenuAction: () => {},
		};

		await app.setupExternalMenuListeners();

		// Simulate trigger of request-subchar-image
		assert.ok(typeof subcharHandler === "function");
		subcharHandler({
			event: "request-subchar-image",
			payload: { scopeId: 1 },
		});

		assert.equal(emittedEvent, "update-subchar-image-1");
		assert.deepEqual(emittedPayload, { src: "asset://subchar1.png" });
		delete (globalThis as { __TAURI_INTERNALS__?: unknown })
			.__TAURI_INTERNALS__;
	});

	it("invokes playSakuraScript from SHIORI responses across all mouse handlers and handles single/double clickType", async () => {
		const played: string[] = [];
		const sent: Array<{ evt: string; args: unknown[] }> = [];
		let responseQueue: unknown[] = [];

		const app = {
			...eventMethods,
			sakuraPlayer: { timeCritical: false, isPlaying: false },
			getCollisionInfo: (x = 0, y = 0, _r?: unknown, scopeId = 0) => ({
				name: "Head",
				canvasX: x,
				canvasY: y,
				scopeId,
			}),
			playSakuraScript: (script: string) => {
				played.push(script);
			},
			ghostController: {
				sendShioriEvent: (evt: string, args: unknown[]) => {
					sent.push({ evt, args });
					return Promise.resolve(responseQueue.shift());
				},
			},
		};

		// Single click with { status: 200, value } -> plays script, never fires OnMouseDoubleClick
		responseQueue = [{ status: 200, value: "\\0single_value\\e" }];
		await app.onGhostClick(10, 20, {}, 0, "single");
		assert.deepEqual(
			sent.map((s) => s.evt),
			["OnMouseClick"],
		);
		assert.deepEqual(played, ["\\0single_value\\e"]);

		// Single click with no script -> does NOT fall back to OnMouseDoubleClick
		sent.length = 0;
		played.length = 0;
		responseQueue = [{ status: 204, value: "ignored" }];
		await app.onGhostClick(10, 20, {}, 0, "single");
		assert.deepEqual(
			sent.map((s) => s.evt),
			["OnMouseClick"],
		);
		assert.deepEqual(played, []);

		// Double click with { status: 200, value } -> plays script without OnMouseClick
		sent.length = 0;
		played.length = 0;
		responseQueue = [{ status: 200, value: "\\0double_value\\e" }];
		await app.onGhostClick(10, 20, {}, 0, "double");
		assert.deepEqual(
			sent.map((s) => s.evt),
			["OnMouseDoubleClick"],
		);
		assert.deepEqual(played, ["\\0double_value\\e"]);

		// Double click with empty response -> falls back to OnMouseClick and plays { script }
		sent.length = 0;
		played.length = 0;
		responseQueue = [null, { script: "\\0fallback_click\\e" }];
		await app.onGhostClick(10, 20, {}, 0, "double");
		assert.deepEqual(
			sent.map((s) => s.evt),
			["OnMouseDoubleClick", "OnMouseClick"],
		);
		assert.deepEqual(played, ["\\0fallback_click\\e"]);

		// All other mouse handlers play both { status: 200, value } and { script }
		sent.length = 0;
		played.length = 0;
		responseQueue = [
			{ status: 200, value: "s_stroke" },
			{ script: "s_multiclick" },
			{ status: 200, value: "s_mousedown" },
			{ script: "s_mouseup" },
			{ status: 200, value: "s_mouseex" },
			{ script: "s_clickex" },
			{ status: 200, value: "s_wheel" },
			{ script: "s_dragstart" },
			{ status: 200, value: "s_dragend" },
			{ script: "s_mouseenter" },
			{ status: 200, value: "s_mouseleave" },
			{ script: "s_hover" },
			{ status: 200, value: "s_gesture" },
		];

		await app.onGhostStroke(1, 2, {}, 0);
		await app.onGhostMultipleClick(1, 2, {}, 3, "middle", "mouse", 0, true);
		await app.onGhostMouseDown(1, 2, {}, 0, "mouse", 0);
		await app.onGhostMouseUp(1, 2, {}, 0, "mouse", 0);
		await app.onGhostMouseEx("down", 1, 2, {}, "middle", "mouse", 0);
		await app.onGhostMouseClickEx(1, 2, {}, "xbutton1", "mouse", 0, false);
		await app.onGhostWheel(1, 2, {}, -120, 0);
		await app.onGhostDragStart(1, 2, {}, 0);
		await app.onGhostDragEnd(1, 2, {}, 0);
		await app.onGhostMouseEnter(1, 2, {}, 0, false);
		await app.onGhostMouseLeave(1, 2, {}, 0, true);
		await app.onGhostHover(1, 2, {}, 0);
		await app.onGhostGesture(1, 2, "Body", 5, 6, "Head", "up", 0);

		assert.deepEqual(played, [
			"s_stroke",
			"s_multiclick",
			"s_mousedown",
			"s_mouseup",
			"s_mouseex",
			"s_clickex",
			"s_wheel",
			"s_dragstart",
			"s_dragend",
			"s_mouseenter",
			"s_mouseleave",
			"s_hover",
			"s_gesture",
		]);
		assert.equal(sent[1].evt, "OnMouseMultipleClickEx");
		assert.equal(sent[1].args[5], "middle");
	});

	it("routes all ghost-mouse-event IPC types and setupGhostInteractions callbacks", async () => {
		globalThis.window = globalThis as unknown as Window & typeof globalThis;
		globalThis.addEventListener = () => {};
		const listeners: Record<string, (event: unknown) => void> = {};
		const setupConfigs: Array<{
			onClick: (...args: unknown[]) => void;
			onStroke: (...args: unknown[]) => void;
			options: Record<string, (...args: unknown[]) => void>;
		}> = [];

		globalThis.__TAURI_INTERNALS__ = {
			invoke: async (
				cmd: string,
				args: { event?: string; handler?: (e: unknown) => void },
			) => {
				if (cmd === "plugin:event|listen" && args.event && args.handler) {
					listeners[args.event] = args.handler;
				}
			},
			transformCallback: (cb: unknown) => cb,
		};

		const calls: Array<{ fn: string; args: unknown[] }> = [];
		const record =
			(fn: string) =>
			(...args: unknown[]) => {
				calls.push({ fn, args });
			};

		const app = {
			...eventMethods,
			elements: {
				ghostDisplay: { addEventListener: vi.fn() },
				keroDisplay: { addEventListener: vi.fn() },
			},
			interactionManager: {
				setupDragging: (
					_el: unknown,
					onClick: (...args: unknown[]) => void,
					onStroke: (...args: unknown[]) => void,
					options: Record<string, (...args: unknown[]) => void>,
				) => {
					setupConfigs.push({ onClick, onStroke, options });
				},
			},
			getCollisionInfo: (
				x: number,
				y: number,
				_rect: unknown,
				scopeId: number,
			) => ({
				name: x < 50 ? "Face" : "Head",
				canvasX: x + 100,
				canvasY: y + 200,
				scopeId,
			}),
			onGhostClick: record("onGhostClick"),
			onGhostMultipleClick: record("onGhostMultipleClick"),
			onGhostStroke: record("onGhostStroke"),
			onGhostMouseDown: record("onGhostMouseDown"),
			onGhostMouseUp: record("onGhostMouseUp"),
			onGhostMouseEx: record("onGhostMouseEx"),
			onGhostMouseClickEx: record("onGhostMouseClickEx"),
			onGhostWheel: record("onGhostWheel"),
			onGhostDragStart: record("onGhostDragStart"),
			onGhostDragEnd: record("onGhostDragEnd"),
			onGhostHover: record("onGhostHover"),
			onGhostMouseEnter: record("onGhostMouseEnter"),
			onGhostMouseLeave: record("onGhostMouseLeave"),
			onGhostGesture: record("onGhostGesture"),
			toggleMenu: record("toggleMenu"),
			syncMenuGhosts: record("syncMenuGhosts"),
			handleMenuAction: record("handleMenuAction"),
			hideMenu: record("hideMenu"),
		};

		try {
			app.setupGhostInteractions();
			await app.setupExternalMenuListeners();

			const ghostMouseHandler = listeners["ghost-mouse-event"];
			assert.ok(typeof ghostMouseHandler === "function");

			// Ignored payloads
			ghostMouseHandler({});
			ghostMouseHandler({ payload: {} });

			const rect = { left: 10, top: 20, width: 200, height: 300 };
			ghostMouseHandler({
				payload: { type: "click", scopeId: 1, clientX: 11, clientY: 22, rect },
			});
			ghostMouseHandler({
				payload: { type: "dblclick", clientX: 12, clientY: 23, rect },
			});
			ghostMouseHandler({
				payload: {
					type: "multipleclick",
					scopeId: 1,
					clientX: 13,
					clientY: 24,
					rect,
					count: 4,
					button: "middle",
					device: "touch",
					isEx: true,
				},
			});
			ghostMouseHandler({
				payload: { type: "stroke", clientX: 14, clientY: 25, rect },
			});
			ghostMouseHandler({
				payload: {
					type: "mousedown",
					clientX: 15,
					clientY: 26,
					rect,
					button: 0,
					device: "mouse",
				},
			});
			ghostMouseHandler({
				payload: { type: "mouseup", clientX: 16, clientY: 27, rect },
			});
			ghostMouseHandler({
				payload: {
					type: "mousedown-ex",
					clientX: 17,
					clientY: 28,
					rect,
					button: "xbutton1",
					device: "touch",
				},
			});
			ghostMouseHandler({
				payload: { type: "mouseup-ex", clientX: 18, clientY: 29, rect },
			});
			ghostMouseHandler({
				payload: {
					type: "click-ex",
					clientX: 19,
					clientY: 30,
					rect,
					button: "xbutton2",
					isDouble: true,
				},
			});
			ghostMouseHandler({
				payload: { type: "wheel", clientX: 20, clientY: 31, rect, delta: -120 },
			});
			ghostMouseHandler({
				payload: { type: "dragstart", clientX: 21, clientY: 32, rect },
			});
			ghostMouseHandler({
				payload: { type: "dragend", clientX: 22, clientY: 33, rect },
			});
			ghostMouseHandler({
				payload: { type: "hover", clientX: 23, clientY: 34, rect },
			});
			ghostMouseHandler({
				payload: {
					type: "mouseenter",
					scopeId: 1,
					clientX: 24,
					clientY: 35,
					rect,
				},
			});
			ghostMouseHandler({
				payload: {
					type: "mouseleave",
					clientX: 25,
					clientY: 36,
					rect,
					isWindow: false,
				},
			});
			ghostMouseHandler({
				payload: {
					type: "gesture",
					scopeId: 1,
					startX: 10,
					startY: 20,
					endX: 80,
					endY: 90,
					direction: "right_down",
					rect,
				},
			});

			assert.deepEqual(calls, [
				{ fn: "onGhostClick", args: [11, 22, rect, 1, "single"] },
				{ fn: "onGhostClick", args: [12, 23, rect, 0, "double"] },
				{
					fn: "onGhostMultipleClick",
					args: [13, 24, rect, 4, "middle", "touch", 1, true],
				},
				{ fn: "onGhostStroke", args: [14, 25, rect, 0] },
				{ fn: "onGhostMouseDown", args: [15, 26, rect, 0, "mouse", 0] },
				{ fn: "onGhostMouseUp", args: [16, 27, rect, 0, "mouse", 0] },
				{
					fn: "onGhostMouseEx",
					args: ["down", 17, 28, rect, "xbutton1", "touch", 0],
				},
				{
					fn: "onGhostMouseEx",
					args: ["up", 18, 29, rect, "middle", "mouse", 0],
				},
				{
					fn: "onGhostMouseClickEx",
					args: [19, 30, rect, "xbutton2", "mouse", 0, true],
				},
				{ fn: "onGhostWheel", args: [20, 31, rect, -120, 0] },
				{ fn: "onGhostDragStart", args: [21, 32, rect, 0] },
				{ fn: "onGhostDragEnd", args: [22, 33, rect, 0] },
				{ fn: "onGhostHover", args: [23, 34, rect, 0] },
				{ fn: "onGhostMouseEnter", args: [24, 35, rect, 1, true] },
				{ fn: "onGhostMouseLeave", args: [25, 36, rect, 0, false] },
				{
					fn: "onGhostGesture",
					args: [110, 220, "Face", 180, 290, "Head", "right_down", 1],
				},
			]);

			// Also verify setupGhostInteractions extended callbacks on keroDisplay (scopeId = 1)
			calls.length = 0;
			const keroSetup = setupConfigs[1];
			assert.ok(keroSetup);
			keroSetup.onClick(5, 6, rect, "single");
			keroSetup.options.onGhostMouseEnter(5, 6, rect, false);
			keroSetup.options.onGhostMouseLeave(5, 6, rect, false);
			keroSetup.options.onGhostMouseEx("down", 5, 6, rect, "middle", "mouse");
			keroSetup.options.onGhostMouseClickEx(
				5,
				6,
				rect,
				"middle",
				"mouse",
				true,
			);
			keroSetup.options.onGhostMultipleClick(5, 6, rect, 3, 0, "mouse", false);
			keroSetup.options.onGhostGesture(10, 20, 80, 90, "down", rect);

			assert.deepEqual(calls, [
				{ fn: "onGhostClick", args: [5, 6, rect, 1, "single"] },
				{ fn: "onGhostMouseEnter", args: [5, 6, rect, 1, false] },
				{ fn: "onGhostMouseLeave", args: [5, 6, rect, 1, false] },
				{
					fn: "onGhostMouseEx",
					args: ["down", 5, 6, rect, "middle", "mouse", 1],
				},
				{
					fn: "onGhostMouseClickEx",
					args: [5, 6, rect, "middle", "mouse", 1, true],
				},
				{
					fn: "onGhostMultipleClick",
					args: [5, 6, rect, 3, 0, "mouse", 1, false],
				},
				{
					fn: "onGhostGesture",
					args: [110, 220, "Face", 180, 290, "Head", "down", 1],
				},
			]);
		} finally {
			delete (globalThis as { __TAURI_INTERNALS__?: unknown })
				.__TAURI_INTERNALS__;
		}
	});

	it("forwards optional coordinates and clickType for menu action talk", () => {
		const calls: unknown[][] = [];
		const ctx = {
			onGhostClick: (...args: unknown[]) => {
				calls.push(args);
			},
		};
		const rect = { left: 0, top: 0, width: 100, height: 200 };
		handleMenuActionImpl(ctx, "talk", {
			scope: 1,
			clientX: 40,
			clientY: 60,
			rect,
			clickType: "single",
		});
		handleMenuActionImpl(ctx, "talk", { scope: 0 });

		assert.deepEqual(calls, [
			[40, 60, rect, 1, "single"],
			[undefined, undefined, undefined, 0, undefined],
		]);
	});
});
