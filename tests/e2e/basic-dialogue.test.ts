import assert from "node:assert/strict";
import { test, vi } from "vitest";
import { createMockElement } from "./helpers.js";

const { SakuraScriptPlayer } = await import(
	"../../ui/ts/ghost/sakura-script.js"
);
const { parseSakuraScript } = await import(
	"../../ui/ts/ghost/sakura-tokenizer.js"
);

test("E2E dialogue lifecycle: boot -> speech -> choice select -> surface change -> script end", async () => {
	vi.useFakeTimers();

	const events = [];
	const surfaceHistory = [];

	const sakuraDisplay = createMockElement("div");
	const keroDisplay = createMockElement("div");
	const sakuraText = createMockElement("div");
	const keroText = createMockElement("div");

	const mockApp = {
		ghostId: "e2e_ghost",
		currentBalloonTheme: "default",
		elements: {
			balloonDisplay: sakuraDisplay,
			keroBalloonDisplay: keroDisplay,
			balloonText: sakuraText,
			keroBalloonText: keroText,
			sakuraSlot: createMockElement("div"),
			keroSlot: createMockElement("div"),
		},
		surfaceManager: {
			onCharSpoken(_scope) {},
			onTalkEnd(_scope) {},
			onScriptEnd(_scope) {
				events.push({ type: "script_end", scope: _scope });
			},
			playAnimationById: async (animId, scope, wait) => {
				events.push({ type: "play_anim", animId, scope, wait });
			},
		},
		ghostController: {
			updateSurface(surfaceId, scope) {
				surfaceHistory.push({ surfaceId, scope });
			},
			sendShioriEvent: async (eventName, args) => {
				events.push({ type: "shiori_event", eventName, args });
			},
			closeGhost: async () => {
				events.push({ type: "close_ghost" });
			},
		},
	};

	const player = new SakuraScriptPlayer(mockApp);
	player.parse = async (script) => parseSakuraScript(script);

	// Multi-scope script with choice, inline pause, surface changes, and end
	const fullDialogueScript =
		"\\0\\s[0]Hello master!\\w9\\1\\s[10]Kero here.\\w9\\0\\s[1]Choose an option:\\q[Option A,id_a]\\q[Option B,id_b]\\e";

	const playPromise = player.play(fullDialogueScript);

	// Let the script advance through timers
	await vi.runAllTimersAsync();
	await playPromise;

	// Verify surface updates
	assert.ok(
		surfaceHistory.some((s) => s.scope === 0 && s.surfaceId === 0),
		"Scope 0 surface 0 should be set",
	);
	assert.ok(
		surfaceHistory.some((s) => s.scope === 1 && s.surfaceId === 10),
		"Scope 1 surface 10 should be set",
	);
	assert.ok(
		surfaceHistory.some((s) => s.scope === 0 && s.surfaceId === 1),
		"Scope 0 surface 1 should be set",
	);

	// Verify script end triggered
	assert.ok(
		events.some((e) => e.type === "script_end"),
		"Script end event should be emitted",
	);

	// Trigger choice selection
	await player.onChoiceSelected("id_a", "Option A");
	assert.ok(
		events.some(
			(e) =>
				e.type === "shiori_event" &&
				e.eventName === "OnChoiceSelect" &&
				e.args[0] === "id_a",
		),
		"OnChoiceSelect should be dispatched to SHIORI",
	);

	vi.useRealTimers();
});
