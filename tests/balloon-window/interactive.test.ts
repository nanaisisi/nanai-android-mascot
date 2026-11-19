/**
 * @file interactive.test.ts
 * @brief BalloonWindow インタラクティブ要素（選択肢・アンカー）単体テスト
 */

import assert from "node:assert/strict";
import { test } from "vitest";
import { setupBalloonMockEnvironment } from "./mock-balloon-env.js";

test("setupInteractiveElements binds click events to choices and anchors", async () => {
	const { emittedEvents } = setupBalloonMockEnvironment();

	const { setupInteractiveElements } = await import(
		"../../ui/ts/ghost/balloon-window/interactive.js"
	);

	setupInteractiveElements(null as unknown as HTMLElement, 0);

	const choiceBtn: {
		getAttribute: (a: string) => string | null;
		textContent: string;
		_cb?: (e: unknown) => void;
		addEventListener: (_t: string, cb: (e: unknown) => void) => void;
	} = {
		getAttribute: (a: string) =>
			a === "data-choice-id" ? "choice_id_1" : null,
		textContent: "Choice Text",
		addEventListener(_t: string, cb: (e: unknown) => void) {
			this._cb = cb;
		},
	};

	const anchorLink: {
		getAttribute: (a: string) => string | null;
		textContent: string;
		_cb?: (e: unknown) => void;
		addEventListener: (_t: string, cb: (e: unknown) => void) => void;
	} = {
		getAttribute: (a: string) =>
			a === "data-anchor-id" ? "anchor_id_1" : null,
		textContent: "Anchor Text",
		addEventListener(_t: string, cb: (e: unknown) => void) {
			this._cb = cb;
		},
	};

	const mockTextEl = {
		querySelectorAll: (selector: string) => {
			if (selector === ".balloon-choice-btn") return [choiceBtn];
			if (selector === ".balloon-anchor") return [anchorLink];
			return [];
		},
	};

	setupInteractiveElements(mockTextEl as unknown as HTMLElement, 0);

	choiceBtn._cb?.({ stopPropagation() {} });
	anchorLink._cb?.({ stopPropagation() {} });

	await new Promise((r) => setTimeout(r, 10));

	const choiceEvent = emittedEvents.find(
		(e) =>
			e.event === "balloon-choice-selected" &&
			e.payload?.choiceId === "choice_id_1",
	);
	assert.ok(choiceEvent);

	const anchorEvent = emittedEvents.find(
		(e) =>
			e.event === "balloon-anchor-selected" &&
			e.payload?.anchorId === "anchor_id_1",
	);
	assert.ok(anchorEvent);
});
