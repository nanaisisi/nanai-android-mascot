import assert from "node:assert/strict";
import { test } from "node:test";

const events = [];
globalThis.window = globalThis;
globalThis.__TAURI_INTERNALS__ = {
	transformCallback: () => 0,
	invoke: async (cmd, args) => {
		if (cmd === "plugin:event|emit") events.push(args);
	},
};
globalThis.document = {
	createElement: () => ({ textContent: "", style: {} }),
};
globalThis.requestAnimationFrame = (callback) => setTimeout(callback, 0);
globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
const { playScript } = await import("../ui/js/ghost/sakura-play.js");

test("first spoken character reaches desktop balloon without the old 60ms throttle", async () => {
	events.length = 0;
	const content = {
		innerHTML: "",
		appendChild(el) {
			this.innerHTML += el.textContent;
		},
	};
	const player = {
		playbackId: 0,
		parse: async () => [
			{ type: "char", value: "あ" },
			{ type: "char", value: "い" },
		],
		sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
		scheduleSurfaceRestore() {},
		app: {
			elements: {
				balloonText: content,
				balloonDisplay: {},
				keroBalloonText: null,
			},
			surfaceManager: { onCharSpoken() {}, onTalkEnd() {}, onScriptEnd() {} },
		},
	};
	const playing = playScript(player, "test");
	await new Promise((r) => setTimeout(r, 25));
	assert.equal(
		events.some((e) => e.event === "update-balloon-content-0"),
		true,
	);
	await playing;
});
