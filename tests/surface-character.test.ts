import assert from "node:assert/strict";
import { describe, it, vi } from "vitest";

describe("surface/character.js", () => {
	it("initializes character window listeners and handles pointer and contextmenu interactions", async () => {
		const rootListeners = new Map();
		const windowListeners = new Map();
		const invokeCalls = [];
		const emittedEvents = [];
		const tauriListeners = new Map();

		const rootElement = {
			addEventListener: (event, handler) => {
				rootListeners.set(event, handler);
			},
		};

		let imageVisible = false;
		let imageSrc = "";
		const imgElement = {
			style: {
				get display() {
					return imageVisible ? "block" : "none";
				},
				set display(val) {
					imageVisible = val === "block";
				},
			},
			get src() {
				return imageSrc;
			},
			set src(val) {
				imageSrc = val;
			},
			naturalWidth: 100,
			naturalHeight: 100,
			getBoundingClientRect: () => ({
				left: 0,
				top: 0,
				width: 100,
				height: 100,
			}),
		};

		// Mock global DOM and canvas
		globalThis.document = {
			readyState: "complete",
			getElementById: (id) => {
				if (id === "subchar-root") return rootElement;
				if (id === "subchar-img") return imgElement;
				return null;
			},
			createElement: (tag) => {
				if (tag === "canvas") {
					return {
						width: 1,
						height: 1,
						getContext: () => ({
							drawImage: () => {},
							getImageData: () => ({
								// Alpha non-zero (opaque)
								data: [255, 0, 0, 255],
							}),
						}),
					};
				}
				return {};
			},
			addEventListener: () => {},
		};

		globalThis.location = { search: "?scope=1" };
		globalThis.screenX = 50;
		globalThis.screenY = 60;

		globalThis.window = globalThis;
		globalThis.addEventListener = (event, handler) => {
			windowListeners.set(event, handler);
		};

		let callbackCounter = 1;
		globalThis.__TAURI_INTERNALS__ = {
			metadata: {
				currentWindow: { label: "subchar-1" },
			},
			transformCallback: (fn) => {
				const id = callbackCounter++;
				globalThis[`_${id}`] = fn;
				return id;
			},
			invoke: async (cmd, args) => {
				invokeCalls.push({ cmd, args });
				if (cmd === "plugin:event|listen") {
					tauriListeners.set(args.event, args.handler);
					return 1;
				}
				if (cmd === "plugin:event|emit") {
					emittedEvents.push(args);
					return null;
				}
				if (cmd === "plugin:window|outer_position") {
					return { Physical: { x: 100, y: 120 } };
				}
				return null;
			},
		};

		// Import character.js
		await import("../ui/ts/surface/character.js");

		// 1. Check initial emit request-subchar-image
		const requestEmit = emittedEvents.find(
			(e) => e.event === "request-subchar-image",
		);
		assert.ok(requestEmit);
		assert.deepEqual(requestEmit.payload, { scopeId: 1 });

		// 2. Trigger update-subchar-image-1 listener
		const updateSubcharHandler = tauriListeners.get("update-subchar-image-1");
		if (typeof updateSubcharHandler === "number") {
			const fn = globalThis[`_${updateSubcharHandler}`];
			fn({ payload: { src: "data:image/png;base64,subchar" } });
			assert.equal(imgElement.src, "data:image/png;base64,subchar");
			assert.equal(imageVisible, true);

			fn({ payload: { src: "" } });
			assert.equal(imageVisible, false);
		}

		// 3. Pointer interaction: Tap without moving triggers menu-action talk
		const onPointerDown = rootListeners.get("mousedown");
		const onPointerUp = windowListeners.get("mouseup");
		assert.ok(onPointerDown);
		assert.ok(onPointerUp);

		onPointerDown({
			button: 0,
			clientX: 50,
			clientY: 50,
			screenX: 150,
			screenY: 160,
		});

		onPointerUp();

		const talkEmit = emittedEvents.find(
			(e) => e.event === "menu-action" && e.payload?.action === "talk",
		);
		assert.ok(talkEmit);
		assert.deepEqual(talkEmit.payload, {
			action: "talk",
			payload: { scope: 1 },
		});

		// 4. Pointer interaction: Move triggers window move and sync_character_balloon
		const onPointerMove = windowListeners.get("mousemove");
		assert.ok(onPointerMove);

		onPointerDown({
			button: 0,
			clientX: 10,
			clientY: 10,
			screenX: 110,
			screenY: 110,
		});

		// Wait microtasks for getCurrentWindowPosition
		await new Promise((r) => setTimeout(r, 10));

		onPointerMove({
			clientX: 30,
			clientY: 40,
		});

		onPointerUp();

		const syncBalloon = invokeCalls.find(
			(c) => c.cmd === "sync_character_balloon",
		);
		assert.ok(syncBalloon);
		assert.deepEqual(syncBalloon.args, { scopeId: 1 });

		// 5. Context menu interaction triggers show_menu_window
		const onContextMenu = windowListeners.get("contextmenu");
		assert.ok(onContextMenu);
		let prevented = false;
		onContextMenu({
			preventDefault: () => {
				prevented = true;
			},
			screenX: 200,
			screenY: 300,
		});
		assert.equal(prevented, true);

		const showMenu = invokeCalls.find((c) => c.cmd === "show_menu_window");
		assert.ok(showMenu);
		assert.deepEqual(showMenu.args, {
			x: 200,
			y: 300,
			scope: 1,
		});

		// 6. Long press triggers menu window
		vi.useFakeTimers();
		try {
			onPointerDown({
				button: 0,
				clientX: 50,
				clientY: 50,
				screenX: 180,
				screenY: 220,
			});
			invokeCalls.length = 0;
			vi.advanceTimersByTime(650);
			const longPressMenu = invokeCalls.find(
				(c) => c.cmd === "show_menu_window",
			);
			assert.ok(longPressMenu);
			assert.deepEqual(longPressMenu.args, {
				x: 180,
				y: 220,
				scope: 1,
			});
		} finally {
			vi.useRealTimers();
		}
	});
});
