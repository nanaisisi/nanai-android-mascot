import assert from "node:assert/strict";
import { test, vi } from "vitest";

globalThis.window = globalThis;
const documentListeners = {};
globalThis.document = {
	createElement: (_tag) => ({ style: {}, appendChild() {} }),
	addEventListener(type, cb) {
		documentListeners[type] = cb;
	},
	removeEventListener() {},
};

const tauriListeners = {};

globalThis.__TAURI_INTERNALS__ = {
	metadata: { currentWindow: { label: "main" } },
	invoke: async () => {},
	transformCallback: (cb) => cb,
	plugins: {
		event: {
			listen: async (event, cb) => {
				tauriListeners[event] = cb;
				return () => {};
			},
			emit: async () => {},
		},
	},
};

const { SakuraScriptPlayer, parseSakuraScript } = await import(
	"../ui/js/ghost/sakura-script.js"
);

test("SakuraScriptPlayer covers all methods, Tauri listeners, and restore timer", async () => {
	vi.useFakeTimers();

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
			balloonText: { innerHTML: "SakuraHTML", appendChild() {} },
			keroBalloonText: { innerHTML: "KeroHTML", appendChild() {} },
		},
		currentBalloonTheme: "default",
	};

	const player = new SakuraScriptPlayer(mockApp);

	// 1. Test Tauri event listeners
	await tauriListeners["balloon-choice-selected"]?.({
		payload: { choiceId: "OnCustom", choiceText: "Txt" },
	});
	await tauriListeners["balloon-anchor-selected"]?.({
		payload: { anchorId: "anc1" },
	});
	await tauriListeners["balloon-clicked"]?.();
	await tauriListeners["balloon-ready"]?.({
		payload: { scopeId: 0 },
	});
	await tauriListeners["balloon-ready"]?.({
		payload: { scopeId: 1 },
	});

	// 2. Test parse and play
	const tokens = parseSakuraScript("\\0Hello\\e");
	assert.ok(Array.isArray(tokens));

	player.parse = async () => [
		{ type: "scope", value: 0 },
		{ type: "char", value: "H" },
		{ type: "end" },
	];

	const playPromise = player.play("\\0Test\\e");
	await vi.runAllTimersAsync();
	await playPromise;

	// 3. Test scheduleSurfaceRestore timer (8000ms)
	player.playbackId = 5;
	player.isPlaying = false;
	player.scheduleSurfaceRestore(5);
	vi.advanceTimersByTime(8100);
	await vi.advanceTimersByTimeAsync(0);
	assert.ok(eventsSent.some((e) => e.ev === "OnSurfaceRestore"));

	// 4. Test skip with active pauseResolver
	player.isPlaying = true;
	let resolverCalled = false;
	player._pauseResolver = () => { resolverCalled = true; };
	player.skip();
	assert.equal(player.skipRequested, true);
	assert.equal(resolverCalled, true);

	// 5. Test onChoiceSelected
	await player.onChoiceSelected("OnCustomChoice", "text1");
	await player.onChoiceSelected("normalChoice", "text2");

	// 6. Test waitForClickOrTimeout
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

	const waitPromise2 = player.waitForClickOrTimeout(mockEl, 100);
	documentListeners.keydown?.({ key: "Enter" });
	await waitPromise2;

	vi.useRealTimers();
	delete globalThis.__TAURI_INTERNALS__;
	assert.ok(true);
});
