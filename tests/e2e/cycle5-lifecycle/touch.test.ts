import assert from "node:assert/strict";
import { test } from "vitest";
import { createMockApp, createMockElement } from "./helpers.js";

const { SakuraScriptPlayer } = await import(
	"../../../ui/js/ghost/sakura-script.js"
);
const { parseSakuraScript } = await import(
	"../../../ui/js/ghost/sakura-tokenizer.js"
);
const { AndroidBridge, ANDROID_EVENTS, TouchGestureRecognizer } = await import(
	"../../../ui/js/ui/touch/index.js"
);

test("Cycle 5: Touch Snap Gesture & Mobile Dock Coordination E2E", async () => {
	const events: any[] = [];
	const runningAnimations = new Set<number>();
	const sakuraDisplay = createMockElement("div");
	const keroDisplay = createMockElement("div");
	const sakuraText = createMockElement("div");
	const keroText = createMockElement("div");

	const mockApp = createMockApp(
		events,
		runningAnimations,
		sakuraDisplay,
		keroDisplay,
		sakuraText,
		keroText,
	);

	const player = new SakuraScriptPlayer(mockApp);
	player.parse = async (script: string) => parseSakuraScript(script);
	player.sleep = () => Promise.resolve();

	const listeners: Record<string, ((e: any) => void)[]> = {};
	const touchContainer = {
		...createMockElement("div"),
		listeners,
		addEventListener(type: string, fn: (e: any) => void) {
			if (!listeners[type]) listeners[type] = [];
			listeners[type].push(fn);
		},
		removeEventListener(type: string, fn: (e: any) => void) {
			if (!listeners[type]) return;
			listeners[type] = listeners[type].filter((f) => f !== fn);
		},
		dispatchEvent(event: any, type?: string) {
			const eventType = type || event.type;
			const fns = listeners[eventType] || [];
			for (const fn of fns) fn(event);
		},
	};

	const recognizer = new TouchGestureRecognizer(touchContainer as any, {
		screenWidth: 360,
		snapThreshold: 50,
	});
	const bridge = new AndroidBridge({ gestureRecognizer: recognizer });

	let dockReported = null;
	bridge.on(ANDROID_EVENTS.DOCK_CHANGED, ({ dockState }: any) => {
		dockReported = dockState;
	});

	// Trigger touch swipe near right screen edge (x=330, threshold=50, screenWidth=360)
	touchContainer.dispatchEvent(
		{
			type: "touchstart",
			touches: [{ clientX: 200, clientY: 300 }],
		},
		"touchstart",
	);
	touchContainer.dispatchEvent(
		{
			type: "touchmove",
			touches: [{ clientX: 330, clientY: 300 }],
		},
		"touchmove",
	);
	touchContainer.dispatchEvent(
		{
			type: "touchend",
			touches: [],
			changedTouches: [{ clientX: 330, clientY: 300 }],
		},
		"touchend",
	);

	assert.equal(recognizer.getDockState(), "right");
	assert.equal(dockReported, "right");
	assert.equal(bridge.getDockMode(), "right");

	// Dialogue stream execution during docked state
	const dockDialogueScript = "\\0\\s[0]Docked speech smoothly plays.\\w9\\e";
	await player.play(dockDialogueScript);

	assert.ok(
		sakuraText.textContent?.includes("Docked speech smoothly plays."),
		"Dialogue should play without disruption in docked state",
	);

	// Undock via dock API
	bridge.setDockMode("none");
	assert.equal(bridge.getDockMode(), "none");
	assert.equal(recognizer.getDockState(), "none");

	bridge.destroy();
	recognizer.destroy();
});
