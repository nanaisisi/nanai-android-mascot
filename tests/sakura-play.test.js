import assert from "node:assert/strict";
import { test } from "vitest";

const events = [];
globalThis.window = globalThis;
globalThis.__TAURI_INTERNALS__ = {
	transformCallback: () => 0,
	invoke: async (cmd, args) => {
		if (cmd === "plugin:event|emit") events.push(args);
	},
};

const createEl = (tag) => {
	const children = [];
	return {
		tagName: String(tag || "").toUpperCase(),
		textContent: "",
		innerHTML: "",
		style: {},
		dataset: {},
		appendChild(el) {
			children.push(el);
			if (typeof el === "string") this.textContent += el;
			else if (el?.textContent) this.textContent += el.textContent;
		},
		setAttribute(a, v) {
			this[a] = v;
		},
		addEventListener(t, cb) {
			this._listeners = this._listeners || {};
			this._listeners[t] = cb;
		},
		click() {
			this._listeners?.click?.({ stopPropagation() {} });
		},
	};
};

globalThis.document = {
	createElement: createEl,
};
globalThis.requestAnimationFrame = (callback) => setTimeout(callback, 0);
globalThis.cancelAnimationFrame = (id) => clearTimeout(id);

const { playScript } = await import("../ui/js/ghost/sakura-play.js");

test("playScript covers all tokens (scope, char, newline, clear, pause, anchor, quick, wait, surface, animation, choice, balloon, timeout, halt, offset, font)", async () => {
	events.length = 0;
	const sakuraText = createEl("div");
	const keroText = createEl("div");

	const player = {
		playbackId: 1,
		parse: async () => [
			{ type: "scope", value: 1 },
			{ type: "font", tag: "bold", param: "1" },
			{ type: "font", tag: "italic", param: "true" },
			{ type: "font", tag: "underline", param: "1" },
			{ type: "font", tag: "strike", param: "1" },
			{ type: "font", tag: "color", param: "#ff0000" },
			{ type: "font", tag: "height", param: "16px" },
			{ type: "char", value: "あ" },
			{ type: "newline", half: false },
			{ type: "newline", half: true },
			{ type: "anchor_begin", id: "a1", args: [] },
			{ type: "char", value: "い" },
			{ type: "anchor_end" },
			{ type: "quick_toggle", value: true },
			{ type: "clear" },
			{ type: "pause" },
			{ type: "wait", value: 10 },
			{ type: "surface", value: 0 },
			{ type: "animation", animId: 1, wait: 0 },
			{ type: "choice", id: "c1", text: "Option1" },
			{ type: "balloon", value: 0 },
			{ type: "balloon", value: -1 },
			{ type: "timeout" },
			{ type: "offset", x: "10", y: "@5" },
			{ type: "font", tag: "default" },
			{ type: "scope", value: 0 },
			{ type: "char", value: "う" },
			{ type: "clear", mode: "char", count: 1 },
			{ type: "char", value: "え" },
			{ type: "newline", half: false },
			{ type: "char", value: "お" },
			{ type: "clear", mode: "line", count: 1 },
			{ type: "choice_timeout", timeout: 100 },
			{ type: "balloon_timeout", timeout: 100 },
			{ type: "halt" },
		],
		sleep: () => Promise.resolve(),
		waitForClickOrTimeout: () => Promise.resolve(),
		onChoiceSelected: () => {},
		onChoiceTimeout: () => {},
		scheduleSurfaceRestore: () => {},
		app: {
			ghostId: "main",
			currentBalloonTheme: "ivory",
			elements: {
				balloonText: sakuraText,
				balloonDisplay: createEl("div"),
				keroBalloonText: keroText,
				keroBalloonDisplay: createEl("div"),
				sakuraSlot: createEl("div"),
				keroSlot: createEl("div"),
			},
			surfaceManager: {
				onCharSpoken() {},
				onTalkEnd() {},
				onScriptEnd() {},
				playAnimationById: async () => {},
			},
			ghostController: {
				updateSurface() {},
				sendShioriEvent: async () => {},
				closeGhost: async () => {},
			},
		},
	};

	await playScript(player, "\\0あ\\e");
	assert.equal(player.timeCritical, true);
});

test("playScript applies punctuation delay and waitMultiplier via playbackController", async () => {
	const sleptDurations = [];
	const sakuraText = createEl("div");

	const { SakuraPlaybackController } = await import(
		"../ui/js/ghost/sakura-play.js"
	);

	const player = {
		playbackId: 10,
		parse: async () => [
			{ type: "scope", value: 0 },
			{ type: "char", value: "あ" }, // normal: 40ms
			{ type: "char", value: "。" }, // punctuation: 140ms
			{ type: "wait", value: 50 }, // wait: 50ms
		],
		sleep: (ms) => {
			sleptDurations.push(ms);
			return Promise.resolve();
		},
		waitForClickOrTimeout: () => Promise.resolve(),
		onChoiceSelected: () => {},
		onChoiceTimeout: () => {},
		scheduleSurfaceRestore: () => {},
		app: {
			ghostId: "main",
			currentBalloonTheme: "ivory",
			elements: {
				balloonText: sakuraText,
				balloonDisplay: createEl("div"),
				keroBalloonText: createEl("div"),
				keroBalloonDisplay: createEl("div"),
			},
			surfaceManager: {
				onCharSpoken() {},
				onTalkEnd() {},
				onScriptEnd() {},
			},
			ghostController: {
				updateSurface() {},
				sendShioriEvent: async () => {},
			},
		},
	};

	const controller = new SakuraPlaybackController({ player });
	controller.setWaitMultiplier(2.0);

	await playScript(player, "\\0あ。\\w1\\e");

	// 40ms * 2.0 = 80ms, 140ms * 2.0 = 280ms, 50ms * 2.0 = 100ms
	assert.deepEqual(sleptDurations, [80, 280, 100]);
});

test("playScript handles synchronized mode (\\_s) to mirror output across sakura and kero balloons", async () => {
	const sakuraText = createEl("div");
	const keroText = createEl("div");
	const spokenScopes = [];

	const player = {
		playbackId: 20,
		isSyncMode: false,
		parse: async () => [
			{ type: "scope", value: 0 },
			{ type: "sync_toggle", value: true },
			{ type: "char", value: "共" },
			{ type: "newline", half: false },
			{ type: "char", value: "同" },
			{ type: "sync_toggle", value: false },
			{ type: "char", value: "独" },
		],
		sleep: () => Promise.resolve(),
		waitForClickOrTimeout: () => Promise.resolve(),
		onChoiceSelected: () => {},
		onChoiceTimeout: () => {},
		scheduleSurfaceRestore: () => {},
		app: {
			ghostId: "main",
			currentBalloonTheme: "ivory",
			elements: {
				balloonText: sakuraText,
				balloonDisplay: createEl("div"),
				keroBalloonText: keroText,
				keroBalloonDisplay: createEl("div"),
			},
			surfaceManager: {
				onCharSpoken(scope) {
					spokenScopes.push(scope);
				},
				onTalkEnd() {},
				onScriptEnd() {},
			},
			ghostController: {
				updateSurface() {},
				sendShioriEvent: async () => {},
			},
		},
	};

	await playScript(player, "\\_s共同\\_s独");

	// sakuraText receives: "共", newline, "同", "独"
	assert.equal(sakuraText.textContent, "共同独");
	// keroText receives mirrored: "共", newline, "同"
	assert.equal(keroText.textContent, "共同");
	// Both scopes 0 and 1 receive talk triggers during sync mode
	assert.equal(spokenScopes.includes(0), true);
	assert.equal(spokenScopes.includes(1), true);
});

test("playScript resets balloonWait after playback finishes", async () => {
	const sakuraText = createEl("div");
	const { SakuraPlaybackController } = await import(
		"../ui/js/ghost/sakura-play.js"
	);

	const player = {
		playbackId: 30,
		parse: async () => [
			{ type: "scope", value: 0 },
			{ type: "char", value: "A" },
		],
		sleep: () => Promise.resolve(),
		waitForClickOrTimeout: () => Promise.resolve(),
		onChoiceSelected: () => {},
		onChoiceTimeout: () => {},
		scheduleSurfaceRestore: () => {},
		app: {
			ghostId: "main",
			elements: {
				balloonText: sakuraText,
				balloonDisplay: createEl("div"),
				keroBalloonText: createEl("div"),
				keroBalloonDisplay: createEl("div"),
			},
			surfaceManager: {
				onCharSpoken() {},
				onTalkEnd() {},
				onScriptEnd() {},
			},
			ghostController: {
				updateSurface() {},
				sendShioriEvent: async () => {},
			},
		},
	};

	const controller = new SakuraPlaybackController({ player });
	controller.setBalloonWait("200%");
	assert.equal(controller.getWaitMultiplier(), 2.0);

	await playScript(player, "\\0A\\e");

	// Controller should be reset back to 1.0 multiplier after script finishes
	assert.equal(controller.getWaitMultiplier(), 1.0);
});
