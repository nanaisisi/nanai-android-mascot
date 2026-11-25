import assert from "node:assert/strict";
import { afterEach, describe, it } from "vitest";
import { BalloonDragManager } from "../ui/ts/surface/balloon-drag.js";

describe("BalloonDragManager --balloon-dontmove", () => {
	const origDocument = globalThis.document;
	const origWindow = globalThis.window;
	const origAddEventListener = globalThis.addEventListener;

	afterEach(() => {
		globalThis.document = origDocument;
		globalThis.window = origWindow;
		globalThis.addEventListener = origAddEventListener;
	});

	it("prevents dragging when --balloon-dontmove is 1", () => {
		const listeners = new Map<string, (e: unknown) => void>();
		const balloonEl = {
			style: { cursor: "" },
			addEventListener: (type: string, fn: (e: unknown) => void) => {
				listeners.set(type, fn);
			},
			getBoundingClientRect: () => ({
				left: 100,
				top: 100,
				width: 200,
				height: 100,
			}),
		};
		const cssVars = new Map<string, string>([["--balloon-dontmove", "1"]]);

		globalThis.document = {
			documentElement: {
				style: {
					getPropertyValue: (name: string) => cssVars.get(name) ?? "",
				},
			},
			getElementById: (id: string) =>
				id === "balloon-display" ? balloonEl : null,
			addEventListener: () => {},
		} as unknown as Document;

		globalThis.window = {
			addEventListener: () => {},
		} as unknown as Window & typeof globalThis;
		globalThis.addEventListener =
			(() => {}) as typeof globalThis.addEventListener;

		const manager = new BalloonDragManager({});
		manager.setupBalloonDragging({ style: {} } as unknown as HTMLElement);

		const onMouseDown = listeners.get("mousedown");
		assert.ok(onMouseDown, "mousedown listener should be registered");

		onMouseDown({
			button: 0,
			clientX: 150,
			clientY: 150,
			target: { tagName: "DIV" },
			stopPropagation: () => {},
		});

		assert.equal(balloonEl.style.cursor, "");
	});
});
