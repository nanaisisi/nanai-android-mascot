import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { createEl, setupMockDom } from "./sakura-play/helpers.js";

setupMockDom();

import {
	handleAnchorBegin,
	handleAnchorEnd,
	handleChoice,
} from "../ui/js/ghost/sakura-play/handlers/choice.js";
import {
	handleInlineBitmap,
	handleScope,
} from "../ui/js/ghost/sakura-play/handlers/scope.js";
import {
	handleChar,
	handleClear,
	handleFont,
	handleNewline,
	handleOffset,
} from "../ui/js/ghost/sakura-play/handlers/text.js";

describe("SakuraPlay Handlers Direct Coverage", () => {
	it("handlers/text.js covers font styles, backspace, and line removal directly", async () => {
		const target = createEl("div");
		const mirror = createEl("div");
		const currentFontStyles = {};
		const player = {
			currentFontStyles,
			currentScope: 0,
			charWait: 0,
			sleep: async () => {},
			syncSectionActive: true,
		};
		const app = {
			elements: {
				sakuraBalloonText: target,
				keroBalloonText: mirror,
			},
		};
		const context = {
			player,
			app,
			currentBalloonText: target,
			shownScopes: new Set(),
			scheduleDesktopBalloonSync: () => {},
		};

		// Font styles
		handleFont(player, app, { tag: "shadow", param: "red" }, context);
		assert.equal(currentFontStyles.textShadow, "1px 1px 2px red");

		handleFont(player, app, { tag: "shadow", param: "none" }, context);
		assert.equal(currentFontStyles.textShadow, undefined);

		handleFont(player, app, { tag: "name", param: "Arial" }, context);
		assert.equal(currentFontStyles.fontFamily, "Arial");

		handleFont(player, app, { tag: "color" }, context);
		assert.equal(currentFontStyles.color, undefined);

		handleFont(player, app, { tag: "height", param: "16" }, context);
		assert.equal(currentFontStyles.fontSize, "16px");

		// handleChar in sync mode
		await handleChar(player, app, { value: "A" }, context);

		// handleNewline half
		handleNewline(player, app, { half: true }, context);

		// handleOffset
		handleOffset(player, app, { x: "+20", y: "@30" }, context);

		// handleClear char
		globalThis.Node = { TEXT_NODE: 3 };
		target.lastChild = { nodeType: 3, nodeValue: "BC" };
		target.removeChild = () => {
			target.lastChild = null;
		};
		handleClear(player, app, { mode: "char", count: 2 }, context);

		// handleClear line
		target.lastChild = { nodeName: "BR" };
		handleClear(player, app, { mode: "line", count: 1 }, context);

		// handleClear all
		handleClear(player, app, {}, context);
	});

	it("handlers/scope.js covers inline bitmap rendering and slot showing", async () => {
		const container = createEl("div");
		const sakuraSlot = createEl("div");
		const keroSlot = createEl("div");
		const sakuraDisplay = createEl("div");
		const keroDisplay = createEl("div");
		const keroBalloonText = createEl("div");
		const sakuraBalloonText = createEl("div");

		let desktopSyncCalled = false;
		const player = { currentScope: 1 };
		const app = {
			currentBalloonTheme: "default",
			elements: {
				sakuraSlot,
				keroSlot,
				sakuraDisplay,
				keroDisplay,
				sakuraBalloonText,
				keroBalloonText,
			},
		};
		const context = {
			player,
			app,
			currentBalloonText: container,
			shownScopes: new Set(),
			scheduleDesktopBalloonSync: () => {
				desktopSyncCalled = true;
			},
		};

		// Scope switch to \1 without Tauri available
		const origTauri = globalThis.__TAURI_INTERNALS__;
		delete globalThis.__TAURI_INTERNALS__;
		handleScope(player, app, { value: 1 }, context);
		assert.equal(keroSlot.style.display, "flex");
		globalThis.__TAURI_INTERNALS__ = origTauri;

		// Inline bitmap with currentBalloonText
		context.currentBalloonText = container;
		handleInlineBitmap(
			player,
			app,
			{
				path: "img.png",
				mode: "inline",
			},
			context,
		);
		assert.equal(desktopSyncCalled, true);

		// Absolute bitmap
		handleInlineBitmap(
			player,
			app,
			{
				path: "img2.png",
				mode: "absolute",
				x: 10,
				y: 20,
			},
			context,
		);
	});

	it("handlers/choice.js covers choice selection and timeout timers", async () => {
		let choiceSelected = null;
		let _timeoutFired = false;
		const container = createEl("div");

		const player = {
			choiceTimeout: 50,
			choiceTimeoutTimer: null,
			onChoiceSelected: (id, text) => {
				choiceSelected = { id, text };
			},
			onChoiceTimeout: () => {
				_timeoutFired = true;
			},
		};
		const app = {
			ghostController: {
				sendShioriEvent: () => {},
			},
		};
		const context = {
			player,
			app,
			currentBalloonText: container,
			flushDesktopBalloon: () => {},
			scheduleDesktopBalloonSync: () => {},
		};

		// Choice token
		handleChoice(
			player,
			app,
			{
				id: "c1",
				text: "Select Me",
			},
			context,
		);

		const btn = container.children.find(
			(c) => c.className === "balloon-choice" || c._listeners?.click,
		);
		if (btn) {
			btn.click();
			assert.deepEqual(choiceSelected, { id: "c1", text: "Select Me" });
		}

		// Anchor token
		handleAnchorBegin(
			player,
			app,
			{
				id: "a1",
			},
			context,
		);
		handleAnchorEnd(player, app, {}, context);
	});
});
