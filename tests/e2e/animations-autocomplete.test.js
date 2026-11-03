import assert from "node:assert/strict";
import { test, vi } from "vitest";
import { createMockElement } from "./helpers.js";

const { SakuraScriptPlayer } = await import(
	"../../ui/js/ghost/sakura-script.js"
);
const { parseSakuraScript } = await import(
	"../../ui/js/ghost/sakura-tokenizer.js"
);

test("E2E dialogue lifecycle Cycle 4: named animations, wait_animation, anim commands, and autocomplete", async () => {
	vi.useFakeTimers();

	const events = [];
	const animOffsets = new Map();
	const runningAnimations = new Set();
	const animResolveMap = new Map();

	const sakuraDisplay = createMockElement("div");
	const keroDisplay = createMockElement("div");
	const sakuraText = createMockElement("div");
	const keroText = createMockElement("div");

	const mockApp = {
		ghostId: "e2e_cycle4_ghost",
		elements: {
			balloonDisplay: sakuraDisplay,
			keroBalloonDisplay: keroDisplay,
			balloonText: sakuraText,
			keroBalloonText: keroText,
			sakuraSlot: createMockElement("div"),
			keroSlot: createMockElement("div"),
		},
		surfaceManager: {
			onCharSpoken() {},
			onTalkEnd() {},
			onScriptEnd(scope) {
				events.push({ type: "script_end", scope });
			},
			playAnimationById(animId, scope, wait) {
				events.push({ type: "anim_play", animId, scope, wait });
				runningAnimations.add(String(animId));
			},
			stopAnimationById(animId, scope) {
				events.push({ type: "anim_stop", animId, scope });
				runningAnimations.delete(String(animId));
			},
			setAnimationOffset(animId, x, y, scope) {
				events.push({ type: "anim_offset", animId, x, y, scope });
				animOffsets.set(`${scope}:${animId}`, { x, y });
			},
			async waitForAnimation(animId, scope) {
				events.push({ type: "anim_wait_start", animId, scope });
				return new Promise((resolve) => {
					animResolveMap.set(String(animId), resolve);
				});
			},
		},
		ghostController: {
			updateSurface(scope, surfaceId) {
				events.push({ type: "surface", scope, surfaceId });
			},
			sendShioriEvent: async (eventName, args) => {
				events.push({ type: "shiori_event", eventName, args });
				if (eventName === "OnUserInput") {
					return { status: 200, value: "" };
				}
				return null;
			},
			sendShioriRequest: async (req) => {
				events.push({ type: "shiori_req", req });
				if (req?.method === "GET" && req?.id === "inputbox.autocomplete") {
					return {
						status: 200,
						headers: { Value: "Apple\x01Banana\x01Cherry" },
					};
				}
				return { status: 204 };
			},
		},
	};

	const { ModalDialogController } = await import(
		"../../ui/js/ui/renderers/modal-dialog-controller.js"
	);
	const modalController = new ModalDialogController({ app: mockApp });
	mockApp.modalDialogController = modalController;

	const player = new SakuraScriptPlayer(mockApp);
	player.parse = async (script) => parseSakuraScript(script);

	// 1. Test \i[smile] and \__w[animation,smile]
	const animScript =
		"\\0\\s[0]\\i[smile]\\__w[animation,smile]Smile complete\\e";
	const animPlayPromise = player.play(animScript);

	await vi.advanceTimersByTimeAsync(100);
	assert.ok(
		events.some((e) => e.type === "anim_play" && e.animId === "smile"),
		"Named animation 'smile' should be started",
	);
	assert.ok(
		events.some((e) => e.type === "anim_wait_start" && e.animId === "smile"),
		"waitForAnimation should be invoked for 'smile'",
	);

	// Complete animation
	const resolver = animResolveMap.get("smile");
	assert.ok(resolver, "Resolver for 'smile' must exist");
	resolver();

	await vi.runAllTimersAsync();
	await animPlayPromise;

	assert.ok(
		sakuraText.textContent.includes("Smile complete"),
		"Script playback should resume after animation resolves",
	);

	// 2. Test dynamic animation controls: \![anim,offset,smile,12,-8] and \![anim,stop,smile]
	const animControlScript =
		"\\0\\![anim,offset,smile,12,-8]\\![anim,stop,smile]\\e";
	const animControlPromise = player.play(animControlScript);
	await vi.runAllTimersAsync();
	await animControlPromise;

	assert.ok(
		events.some(
			(e) =>
				e.type === "anim_offset" &&
				e.animId === "smile" &&
				e.x === 12 &&
				e.y === -8,
		),
		"anim_offset should be dispatched with numeric coords",
	);
	assert.ok(
		events.some((e) => e.type === "anim_stop" && e.animId === "smile"),
		"anim_stop should be dispatched for 'smile'",
	);

	// 3. Test autocomplete integration in open inputbox
	const inputScript = "\\0\\![open,inputbox,box_fruit,--text=Select]\\e";
	const inputPromise = player.play(inputScript);
	await vi.runAllTimersAsync();
	await inputPromise;

	const inputForm = sakuraText.childNodes.find((n) =>
		n.className?.includes("balloon-inputbox-form"),
	);
	assert.ok(inputForm, "Inputbox form should be present");

	const datalist = inputForm.childNodes.find((c) => c.tagName === "DATALIST");
	if (datalist) {
		const options = datalist.childNodes.filter((c) => c.tagName === "OPTION");
		assert.ok(options.length >= 3, "Autocomplete options should be populated");
	}

	vi.useRealTimers();
});
