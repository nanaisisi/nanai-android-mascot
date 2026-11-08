import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { eventMethods } from "../../ui/js/core/app-events.js";

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
	});
});
