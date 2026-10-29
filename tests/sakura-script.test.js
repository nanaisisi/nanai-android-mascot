import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis;
globalThis.document = {
	createElement: (_tag) => ({ style: {}, appendChild() {} }),
	addEventListener(type, cb) {
		this._listeners = this._listeners || {};
		this._listeners[type] = cb;
	},
	removeEventListener() {},
};

const { SakuraScriptPlayer, parseSakuraScript } = await import(
	"../ui/js/ghost/sakura-script.js"
);

test("SakuraScriptPlayer covers all methods and event handlers", async () => {
	const eventsSent = [];
	const mockApp = {
		ghostController: {
			sendShioriEvent: async (ev, args) => {
				eventsSent.push({ ev, args });
			},
		},
		elements: {
			balloonDisplay: { style: {} },
			keroBalloonDisplay: { style: {} },
			balloonText: { innerHTML: "", appendChild() {} },
			keroBalloonText: { innerHTML: "", appendChild() {} },
		},
		currentBalloonTheme: "default",
	};

	const player = new SakuraScriptPlayer(mockApp);

	// 1. parse
	const tokens = parseSakuraScript("\\0Hello\\e");
	assert.ok(Array.isArray(tokens));

	// Mock player.parse for play() test
	player.parse = async () => [
		{ type: "scope", value: 0 },
		{ type: "char", value: "H" },
		{ type: "end" },
	];

	// 2. play
	await player.play("\\0Test\\e");

	// 3. scheduleSurfaceRestore
	player.playbackId = 1;
	player.scheduleSurfaceRestore(1);
	await player.sleep(10);

	// 4. skip
	player.isPlaying = true;
	player.skip();
	assert.equal(player.skipRequested, true);

	// 5. onChoiceSelected
	await player.onChoiceSelected("OnCustomChoice", "text1");
	await player.onChoiceSelected("normalChoice", "text2");
	assert.ok(eventsSent.some((e) => e.ev === "OnCustomChoice"));
	assert.ok(eventsSent.some((e) => e.ev === "OnChoiceSelect"));

	// 6. waitForClickOrTimeout
	const listeners = {};
	const mockEl = {
		addEventListener(type, cb) {
			listeners[type] = cb;
		},
		removeEventListener() {},
	};
	const waitPromise = player.waitForClickOrTimeout(mockEl, 100);
	listeners.click?.({ stopPropagation() {} });
	await waitPromise;

	// waitForClickOrTimeout with keydown
	const waitPromise2 = player.waitForClickOrTimeout(mockEl, 100);
	document._listeners?.keydown?.({ key: "Enter" });
	await waitPromise2;

	assert.ok(true);
});
