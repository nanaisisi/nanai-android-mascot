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
		setAttribute(a, v) { this[a] = v; },
		addEventListener(t, cb) {
			this._listeners = this._listeners || {};
			this._listeners[t] = cb;
		},
		click() { this._listeners?.click?.({ stopPropagation() {} }); },
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
			{ type: "halt" },
		],
		sleep: () => Promise.resolve(),
		waitForClickOrTimeout: () => Promise.resolve(),
		onChoiceSelected: () => {},
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
