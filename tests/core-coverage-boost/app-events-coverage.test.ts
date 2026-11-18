import assert from "node:assert/strict";
import { describe, it, vi } from "vitest";
import { handleMenuActionImpl } from "../../ui/ts/core/actions/menu-action-dispatcher.js";
import { eventMethods } from "../../ui/ts/core/app-events.js";
import {
	resetPartTracking,
	trackPartTransition,
} from "../../ui/ts/core/events/mouse/hover.js";
import { GhostController } from "../../ui/ts/ghost/ghost.js";

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

	it("tracks part transitions (Head -> Face -> '') with OnMouseEnter/OnMouseLeave and resetPartTracking", async () => {
		const sent: Array<{ evt: string; args: unknown[] }> = [];
		const played: string[] = [];
		let currentPart = "";
		let canvasX = 10;
		let canvasY = 20;

		const app = {
			...eventMethods,
			sakuraPlayer: { timeCritical: false, isPlaying: false },
			getCollisionInfo: (
				_x?: number,
				_y?: number,
				_rect?: unknown,
				scopeId = 0,
			) => ({
				name: currentPart,
				canvasX,
				canvasY,
				scopeId,
			}),
			playSakuraScript: (script: string) => {
				played.push(script);
			},
			ghostController: {
				sendShioriEvent: async (evt: string, args: unknown[]) => {
					sent.push({ evt, args });
					return { status: 200, value: `${evt}:${String(args[4])}` };
				},
			},
		};

		// "" -> "Head"
		currentPart = "Head";
		canvasX = 30;
		canvasY = 40;
		await trackPartTransition(app, 30, 40, {}, 0);
		assert.deepEqual(sent, [
			{
				evt: "OnMouseEnter",
				args: [30, 40, 0, 0, "Head", 0, "mouse"],
			},
		]);

		// Staying on "Head" emits nothing
		sent.length = 0;
		await trackPartTransition(app, 32, 42, {}, 0);
		assert.deepEqual(sent, []);

		// "Head" -> "Face" emits OnMouseLeave(Head) then OnMouseEnter(Face)
		currentPart = "Face";
		canvasX = 50;
		canvasY = 80;
		await trackPartTransition(app, 50, 80, {}, 0);
		assert.deepEqual(sent, [
			{
				evt: "OnMouseLeave",
				args: [50, 80, 0, 0, "Head", 0, "mouse"],
			},
			{
				evt: "OnMouseEnter",
				args: [50, 80, 0, 0, "Face", 0, "mouse"],
			},
		]);

		// Independent scope 1 tracking does not affect scope 0
		sent.length = 0;
		currentPart = "Bust";
		await trackPartTransition(app, 10, 15, {}, 1);
		assert.deepEqual(sent, [
			{
				evt: "OnMouseEnter",
				args: [50, 80, 0, 1, "Bust", 0, "mouse"],
			},
		]);

		// "Face" -> "" on scope 0 emits OnMouseLeave(Face) only
		sent.length = 0;
		currentPart = "";
		canvasX = 5;
		canvasY = 5;
		await trackPartTransition(app, 5, 5, {}, 0);
		assert.deepEqual(sent, [
			{
				evt: "OnMouseLeave",
				args: [5, 5, 0, 0, "Face", 0, "mouse"],
			},
		]);

		// timeCritical suppresses transitions
		sent.length = 0;
		currentPart = "Head";
		app.sakuraPlayer.timeCritical = true;
		app.sakuraPlayer.isPlaying = true;
		await trackPartTransition(app, 30, 40, {}, 0);
		assert.deepEqual(sent, []);
		app.sakuraPlayer.timeCritical = false;
		app.sakuraPlayer.isPlaying = false;

		// Re-enter "Head", then resetPartTracking emits OnMouseLeave(Head) and clears state
		await trackPartTransition(app, 30, 40, {}, 0);
		sent.length = 0;
		canvasX = 35;
		canvasY = 45;
		await resetPartTracking(app, 0, 35, 45, {});
		assert.deepEqual(sent, [
			{
				evt: "OnMouseLeave",
				args: [35, 45, 0, 0, "Head", 0, "mouse"],
			},
		]);

		// Resetting again when no active part emits nothing
		sent.length = 0;
		await resetPartTracking(app, 0, 35, 45, {});
		assert.deepEqual(sent, []);

		// Re-entering "Head" after reset emits OnMouseEnter again
		await trackPartTransition(app, 30, 40, {}, 0);
		const reentry = (sent as Array<{ evt: string; args: unknown[] }>)[0];
		assert.equal(reentry?.evt, "OnMouseEnter");
		assert.equal(reentry?.args[4], "Head");
		assert.ok(played.includes("OnMouseEnter:Head"));
		assert.ok(played.includes("OnMouseLeave:Head"));
		assert.ok(played.includes("OnMouseEnter:Face"));
	});

	it("handles ghost-mouse-event mousemove and mouseleave part transitions via setupExternalMenuListeners", async () => {
		const prevWindow = globalThis.window;
		const prevAddEventListener = globalThis.addEventListener;
		globalThis.window = globalThis as unknown as Window & typeof globalThis;
		globalThis.addEventListener = () => {};
		const listeners: Record<string, (event: unknown) => void> = {};

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

		const sent: Array<{ evt: string; args: unknown[] }> = [];
		const rect = { left: 0, top: 0, width: 200, height: 400 };
		const app = {
			...eventMethods,
			sakuraPlayer: { timeCritical: false, isPlaying: false },
			surfaceManager: {
				detectCollision: (x: number, y: number) => ({
					name: y < 100 ? "Head" : y < 200 ? "Face" : "",
					canvasX: x,
					canvasY: y,
				}),
			},
			ghostController: {
				sendShioriEvent: async (evt: string, args: unknown[]) => {
					sent.push({ evt, args });
					return null;
				},
			},
			syncMenuGhosts: () => {},
			handleMenuAction: () => {},
			hideMenu: () => {},
		};

		try {
			await app.setupExternalMenuListeners();
			const ghostMouseHandler = listeners["ghost-mouse-event"];
			assert.ok(typeof ghostMouseHandler === "function");

			ghostMouseHandler({
				payload: {
					type: "mousemove",
					scopeId: 0,
					clientX: 50,
					clientY: 40,
					rect,
				},
			});
			ghostMouseHandler({
				payload: {
					type: "mousemove",
					scopeId: 0,
					clientX: 50,
					clientY: 140,
					rect,
				},
			});
			ghostMouseHandler({
				payload: {
					type: "mouseleave",
					scopeId: 0,
					clientX: 50,
					clientY: 140,
					rect,
					isWindow: true,
				},
			});
			// Subsequent mousemove into Head after mouseleave must emit OnMouseEnter again
			ghostMouseHandler({
				payload: {
					type: "mousemove",
					scopeId: 0,
					clientX: 50,
					clientY: 40,
					rect,
				},
			});

			assert.deepEqual(sent, [
				{ evt: "OnMouseEnter", args: [50, 40, 0, 0, "Head", 0, "mouse"] },
				{ evt: "OnMouseLeave", args: [50, 140, 0, 0, "Head", 0, "mouse"] },
				{ evt: "OnMouseEnter", args: [50, 140, 0, 0, "Face", 0, "mouse"] },
				{ evt: "OnMouseLeave", args: [50, 140, 0, 0, "Face", 0, "mouse"] },
				{ evt: "OnMouseLeaveAll", args: [50, 140, 0, 0, "Face", 0, "mouse"] },
				{ evt: "OnMouseEnter", args: [50, 40, 0, 0, "Head", 0, "mouse"] },
			]);
		} finally {
			delete (globalThis as { __TAURI_INTERNALS__?: unknown })
				.__TAURI_INTERNALS__;
			globalThis.window = prevWindow;
			globalThis.addEventListener = prevAddEventListener;
		}
	});

	it("falls back to DOM element/img rects in collision.ts when rect is missing or non-positive", () => {
		const prevDocument = (globalThis as { document?: unknown }).document;
		const detectCalls: Array<{
			x: number;
			y: number;
			rect: unknown;
			surfaceId: unknown;
			scopeId: number;
		}> = [];

		const elementsById: Record<string, unknown> = {
			"ghost-display": {
				getBoundingClientRect: () => ({
					left: 0,
					top: 0,
					width: 220,
					height: 440,
				}),
				querySelector: (sel: string) =>
					sel === "img"
						? {
								getBoundingClientRect: () => ({
									left: 10,
									top: 20,
									width: 150,
									height: 300,
								}),
								naturalWidth: 300,
								naturalHeight: 600,
							}
						: null,
			},
			"kero-display": {
				getBoundingClientRect: () => ({
					left: 300,
					top: 100,
					width: 120,
					height: 240,
				}),
				querySelector: () => null,
			},
			"char-display-2": {
				getBoundingClientRect: () => ({
					left: 500,
					top: 50,
					width: 100,
					height: 200,
				}),
				querySelector: () => ({
					getBoundingClientRect: () => ({
						left: 510,
						top: 60,
						width: 80,
						height: 160,
					}),
					naturalWidth: 160,
					naturalHeight: 320,
				}),
			},
		};

		(globalThis as { document?: unknown }).document = {
			getElementById: (id: string) => elementsById[id] ?? null,
		};

		try {
			const app = {
				...eventMethods,
				surfaceManager: {
					detectCollision: (
						x: number,
						y: number,
						rect: unknown,
						surfaceId: unknown,
						scopeId: number,
					) => {
						detectCalls.push({ x, y, rect, surfaceId, scopeId });
						return { name: `part-${scopeId}`, canvasX: x, canvasY: y };
					},
				},
			};

			// Missing rect on scope 0 uses #ghost-display img rect + natural dimensions
			const res0 = app.getCollisionInfo(50, 80, undefined, 0);
			assert.deepEqual(res0, { name: "part-0", canvasX: 50, canvasY: 80 });
			assert.deepEqual(detectCalls[0], {
				x: 50,
				y: 80,
				rect: {
					left: 10,
					top: 20,
					width: 150,
					height: 300,
					naturalWidth: 300,
					naturalHeight: 600,
				},
				surfaceId: null,
				scopeId: 0,
			});

			// Zero-size rect on scope 1 falls back to #kero-display container rect
			app.getCollisionInfo(
				340,
				150,
				{ left: 0, top: 0, width: 0, height: 0 },
				1,
			);
			assert.deepEqual(detectCalls[1], {
				x: 340,
				y: 150,
				rect: { left: 300, top: 100, width: 120, height: 240 },
				surfaceId: null,
				scopeId: 1,
			});

			// Missing rect on scope >= 2 uses #char-display-${scopeId}
			app.getCollisionInfo(520, 90, null, 2);
			assert.deepEqual(detectCalls[2], {
				x: 520,
				y: 90,
				rect: {
					left: 510,
					top: 60,
					width: 80,
					height: 160,
					naturalWidth: 160,
					naturalHeight: 320,
				},
				surfaceId: null,
				scopeId: 2,
			});

			// Valid explicit rect is used directly without DOM override
			const explicitRect = { left: 1, top: 2, width: 50, height: 60 };
			app.getCollisionInfo(15, 25, explicitRect, 0);
			assert.equal(detectCalls[3]?.rect, explicitRect);

			// Undefined clientX/clientY preserves empty return without calling detectCollision
			const countBefore = detectCalls.length;
			assert.deepEqual(app.getCollisionInfo(undefined, 10, undefined, 0), {
				name: "",
				canvasX: 0,
				canvasY: 0,
			});
			assert.equal(detectCalls.length, countBefore);
		} finally {
			if (prevDocument === undefined) {
				delete (globalThis as { document?: unknown }).document;
			} else {
				(globalThis as { document?: unknown }).document = prevDocument;
			}
		}
	});

	it("tracks part transitions in setupGhostInteractions and reloads shell surfaces in selectShell", async () => {
		const sent: Array<{ evt: string; args: unknown[] }> = [];
		const setupConfigs: Array<{
			onStroke: (x: number, y: number, rect: unknown) => void;
			options: Record<string, (...args: unknown[]) => void>;
		}> = [];

		const app = {
			...eventMethods,
			elements: {
				ghostDisplay: { addEventListener: vi.fn() },
				keroDisplay: { addEventListener: vi.fn() },
			},
			sakuraPlayer: { timeCritical: false, isPlaying: false },
			interactionManager: {
				setupDragging: (
					_el: unknown,
					_onClick: unknown,
					onStroke: (x: number, y: number, rect: unknown) => void,
					options: Record<string, (...args: unknown[]) => void>,
				) => {
					setupConfigs.push({ onStroke, options });
				},
			},
			surfaceManager: {
				detectCollision: (x: number, y: number) => ({
					name: y < 100 ? "Head" : "Face",
					canvasX: x,
					canvasY: y,
				}),
			},
			ghostController: {
				sendShioriEvent: async (evt: string, args: unknown[]) => {
					sent.push({ evt, args });
					return null;
				},
			},
		};

		app.setupGhostInteractions();
		const sakuraSetup = setupConfigs[0];
		assert.ok(sakuraSetup);
		const rect = { left: 0, top: 0, width: 200, height: 400 };

		sakuraSetup.onStroke(10, 20, rect);
		sakuraSetup.options.onGhostHover(10, 150, rect);
		sakuraSetup.options.onGhostMouseLeave(10, 150, rect, true);

		assert.deepEqual(sent, [
			{ evt: "OnMouseEnter", args: [10, 20, 0, 0, "Head", 0, "mouse"] },
			{ evt: "OnMouseMove", args: [10, 20, 0, 0, "Head"] },
			{ evt: "OnMouseLeave", args: [10, 150, 0, 0, "Head", 0, "mouse"] },
			{ evt: "OnMouseEnter", args: [10, 150, 0, 0, "Face", 0, "mouse"] },
			{ evt: "OnMouseHover", args: [10, 150, 0, 0, "Face"] },
			{ evt: "OnMouseLeave", args: [10, 150, 0, 0, "Face", 0, "mouse"] },
			{ evt: "OnMouseLeaveAll", args: [10, 150, 0, 0, "Face", 0, "mouse"] },
		]);

		const callOrder: string[] = [];
		const gc = new GhostController({
			surfaceManager: {
				loadSurfacesTxt: async (ghostPath: string, shellName?: string) => {
					callOrder.push(`loadSurfacesTxt:${ghostPath}:${shellName}`);
				},
			},
		} as unknown as ConstructorParameters<typeof GhostController>[0]);
		gc.currentGhost = { name: "test", path: "/ghosts/test" };
		gc.currentShell = "master";
		gc.loadSurfaceAsset = async () => {
			callOrder.push("loadSurfaceAsset");
			return "";
		};
		gc.updateSurface = async (surfaceId: number | string, scopeId?: number) => {
			callOrder.push(`updateSurface:${surfaceId}:${scopeId}`);
		};
		gc.sendShioriEvent = async (evt: string, args?: unknown[]) => {
			callOrder.push(`shiori:${evt}:${JSON.stringify(args)}`);
			return null;
		};

		await gc.selectShell("winter");
		assert.deepEqual(callOrder, [
			"loadSurfacesTxt:/ghosts/test:winter",
			"loadSurfaceAsset",
			"updateSurface:0:0",
			"updateSurface:10:1",
			'shiori:OnShellChanged:["winter","master"]',
		]);
	});

	it("handles balloon-clicked by skipping while playing and closing when idle", async () => {
		globalThis.window = globalThis as unknown as Window & typeof globalThis;
		globalThis.addEventListener = () => {};
		const handlers = new Map<string, (event: unknown) => void>();

		(globalThis as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__ = {
			invoke: async (cmd: string, args: Record<string, unknown>) => {
				if (cmd === "plugin:event|listen") {
					handlers.set(
						String(args.event),
						args.handler as (event: unknown) => void,
					);
				}
			},
			transformCallback: (cb: unknown) => cb,
		};

		try {
			let skipped = 0;
			const closed: Array<{ scopeId: number; reason: string }> = [];
			const app = {
				...eventMethods,
				sakuraPlayer: {
					isPlaying: true,
					skip: () => {
						skipped += 1;
					},
				},
				hideBalloon: (scopeId: number, reason: string) => {
					closed.push({ scopeId, reason });
				},
				syncMenuGhosts: () => {},
				handleMenuAction: () => {},
			};

			await app.setupExternalMenuListeners();
			const onBalloonClicked = handlers.get("balloon-clicked");
			assert.ok(typeof onBalloonClicked === "function");

			onBalloonClicked({ payload: { scopeId: 1 } });
			assert.equal(skipped, 1);
			assert.deepEqual(closed, []);

			app.sakuraPlayer.isPlaying = false;
			onBalloonClicked({ payload: { scopeId: 1 } });
			assert.equal(skipped, 1);
			assert.deepEqual(closed, [{ scopeId: 1, reason: "close" }]);
		} finally {
			delete (globalThis as { __TAURI_INTERNALS__?: unknown })
				.__TAURI_INTERNALS__;
		}
	});
});
