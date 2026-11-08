import assert from "node:assert/strict";
import { test } from "vitest";
import { createMockElement } from "./helpers.js";

const { SakuraScriptPlayer } = await import(
	"../../ui/js/ghost/sakura-script.js"
);
const { parseSakuraScript } = await import(
	"../../ui/js/ghost/sakura-tokenizer.js"
);
const { SyncObjectManager } = await import(
	"../../ui/js/ghost/sakura-play/sync-object.js"
);
const { scriptLifetimeState } = await import(
	"../../ui/js/ghost/command-handler/env.js"
);

test("E2E dialogue lifecycle Cycle 8: SyncObject multi-ghost synchronization and script command integration", async () => {
	const syncMgr = new SyncObjectManager();
<<<<<<< HEAD
	const events: unknown[] = [];
=======
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	const events: any[] = [];
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	const sakuraDisplay = createMockElement("div");
	const keroDisplay = createMockElement("div");
	const sakuraText = createMockElement("div");
	const keroText = createMockElement("div");

	const mockApp = {
		ghostId: "e2e_cycle8_ghost",
		elements: {
			balloonDisplay: sakuraDisplay,
			keroBalloonDisplay: keroDisplay,
			balloonText: sakuraText,
			keroBalloonText: keroText,
			sakuraSlot: createMockElement("div"),
			keroSlot: createMockElement("div"),
		},
		syncObjectManager: syncMgr,
		surfaceManager: {
			onCharSpoken() {},
			onTalkEnd() {},
			onScriptEnd(scope: number) {
				events.push({ type: "script_end", scope });
			},
			currentSurfaceIdFor: (scope: number) => (scope === 1 ? 10 : 0),
			resolveSurfaceNumber: (id: number) => id,
		},
		ghostController: {
<<<<<<< HEAD
			sendShioriEvent: async (eventName: string, args: unknown[]) => {
				events.push({ type: "shiori_event", eventName, args });
				return { status: 200, value: "" };
			},
			sendRaiseOther: async (
				ghost: string,
				eventName: string,
				args: unknown[],
			) => {
=======
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			sendShioriEvent: async (eventName: string, args: any[]) => {
				events.push({ type: "shiori_event", eventName, args });
				return { status: 200, value: "" };
			},
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			sendRaiseOther: async (ghost: string, eventName: string, args: any[]) => {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
				events.push({ type: "raise_other", ghost, eventName, args });
			},
		},
	};

	const player = new SakuraScriptPlayer(mockApp);
	player.parse = async (script: string) => parseSakuraScript(script);
	player.sleep = () => Promise.resolve();

	// 1. Script command \\![set,syncobject,obj1] signals sync object
	const script1 = "\\0\\![set,syncobject,event_alpha]Signaled event_alpha\\e";
	await player.play(script1);
	assert.ok(sakuraText.textContent.includes("Signaled event_alpha"));
	assert.equal(syncMgr.isSignaled("event_alpha"), true);

	// 2. Script command \\![reset,syncobject,obj1] resets sync object
	const script2 = "\\0\\![reset,syncobject,event_alpha]Reset event_alpha\\e";
	await player.play(script2);
	assert.equal(syncMgr.isSignaled("event_alpha"), false);

	// 3. Script command \\![wait,syncobject,obj1] awaits signal
	let waitFinished = false;
	const waitPromise = player
		.play("\\0Waiting for sync...\\![wait,syncobject,event_beta]Done wait!\\e")
		.then(() => {
			waitFinished = true;
		});

	// Wait promise is waiting for event_beta
	assert.equal(waitFinished, false);
	// Signal event_beta externally
	syncMgr.set("event_beta");
	await waitPromise;
	assert.equal(waitFinished, true);
	assert.ok(sakuraText.textContent.includes("Done wait!"));
});

test("E2E dialogue lifecycle Cycle 8: Mode switching state machine and cross-ghost IPC event flow", async () => {
<<<<<<< HEAD
	const events: unknown[] = [];
=======
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	const events: any[] = [];
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	const sakuraDisplay = createMockElement("div");
	const sakuraText = createMockElement("div");

	const mockApp = {
		ghostId: "e2e_cycle8_ipc",
		elements: {
			balloonDisplay: sakuraDisplay,
			balloonText: sakuraText,
		},
		surfaceManager: {
			onCharSpoken() {},
			onTalkEnd() {},
			onScriptEnd(scope: number) {
				events.push({ type: "script_end", scope });
			},
			currentSurfaceIdFor: () => 0,
			resolveSurfaceNumber: (id: number) => id,
		},
		ghostController: {
<<<<<<< HEAD
			sendShioriEvent: async (eventName: string, args: unknown[]) => {
				events.push({ type: "shiori_event", eventName, args });
				return { status: 200, value: "" };
			},
			sendRaiseOther: async (
				ghost: string,
				eventName: string,
				args: unknown[],
			) => {
=======
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			sendShioriEvent: async (eventName: string, args: any[]) => {
				events.push({ type: "shiori_event", eventName, args });
				return { status: 200, value: "" };
			},
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			sendRaiseOther: async (ghost: string, eventName: string, args: any[]) => {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
				events.push({ type: "raise_other", ghost, eventName, args });
			},
			sendNotifyOther: async (
				ghost: string,
				eventName: string,
<<<<<<< HEAD
				args: unknown[],
=======
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				args: any[],
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
			) => {
				events.push({ type: "notify_other", ghost, eventName, args });
			},
		},
	};

	const player = new SakuraScriptPlayer(mockApp);
	player.parse = async (script: string) => parseSakuraScript(script);
	player.sleep = () => Promise.resolve();

	scriptLifetimeState.reset();

	// 1. Enter passivemode and verify lifetime state
	const modeScript = "\\0\\![enter,passivemode]Passive mode entered.\\e";
	await player.play(modeScript);
	assert.equal(scriptLifetimeState.hasMode("passivemode"), true);
	assert.ok(
		events.some(
			(e) =>
				e.type === "shiori_event" &&
				e.eventName === "OnModeChange" &&
				e.args[0] === "passivemode" &&
				e.args[1] === "enter",
		),
	);

	// 2. Cross-ghost IPC via raiseother and notifyother
	const ipcScript =
		"\\0\\![raiseother,PartnerGhost,OnPartnerEvent,p1,p2]\\![notifyother,PartnerGhost,OnNotifyPartner,np1]\\e";
	await player.play(ipcScript);
	assert.ok(
		events.some(
			(e) =>
				e.type === "raise_other" &&
				e.ghost === "PartnerGhost" &&
				e.eventName === "OnPartnerEvent" &&
				e.args[0] === "p1" &&
				e.args[1] === "p2",
		),
	);
	assert.ok(
		events.some(
			(e) =>
				e.type === "notify_other" &&
				e.ghost === "PartnerGhost" &&
				e.eventName === "OnNotifyPartner" &&
				e.args[0] === "np1",
		),
	);

	// 3. Leave passivemode
	await player.play("\\0\\![leave,passivemode]Passive mode left.\\e");
	assert.equal(scriptLifetimeState.hasMode("passivemode"), false);
	assert.ok(
		events.some(
			(e) =>
				e.type === "shiori_event" &&
				e.eventName === "OnModeChange" &&
				e.args[0] === "passivemode" &&
				e.args[1] === "leave",
		),
	);
});
