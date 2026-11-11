import assert from "node:assert/strict";
import { test } from "vitest";
import { createMockElement } from "./helpers.js";

const { SakuraScriptPlayer } = await import(
	"../../ui/ts/ghost/sakura-script.js"
);
const { parseSakuraScript } = await import(
	"../../ui/ts/ghost/sakura-tokenizer.js"
);
const { ModalDialogController } = await import(
	"../../ui/ts/ui/renderers/modal-dialog-controller.js"
);

test("E2E dialogue lifecycle Cycle 9: Extended lifecycle events, ghost/shell switching, and multi-scope dialogue flow", async () => {
	const events: Array<{ type: string; [key: string]: unknown }> = [];
	const sakuraDisplay = createMockElement("div");
	const keroDisplay = createMockElement("div");
	const sakuraText = createMockElement("div");
	const keroText = createMockElement("div");

	const mockApp = {
		ghostId: "e2e_cycle9_ghost",
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
			onScriptEnd(scope: number) {
				events.push({ type: "script_end", scope });
			},
			currentSurfaceIdFor: (scope: number) => (scope === 1 ? 10 : 0),
			resolveSurfaceNumber: (id: number) => id,
		},
		ghostController: {
			currentGhost: { name: "CurrentGhost" },
			currentShell: "master",
			updateSurface: async (surfaceId: number, scope: number) => {
				events.push({ type: "update_surface", surfaceId, scope });
			},
			sendShioriEvent: async (eventName: string, args: unknown[]) => {
				events.push({ type: "shiori_event", eventName, args });
				return { status: 200, value: "" };
			},
			switchGhost: async (name: string) => {
				events.push({ type: "switch_ghost", name });
			},
			selectShell: async (name: string) => {
				events.push({ type: "select_shell", name });
			},
		},
	};

	const player = new SakuraScriptPlayer(mockApp);
	player.parse = async (script: string) => parseSakuraScript(script);
	player.sleep = () => Promise.resolve();

	// 1. Script with ghost change and shell change options emitting events
	const changeScript =
		"\\0\\![change,ghost,NewGhost,--option=raise-event]Switching ghost...\\1\\![change,shell,casual,--option=raise-event]Changing shell...\\e";
	await player.play(changeScript);

	assert.ok(sakuraText.textContent.includes("Switching ghost..."));
	assert.ok(keroText.textContent.includes("Changing shell..."));
	assert.ok(
		events.some(
			(e) =>
				e.type === "shiori_event" &&
				e.eventName === "OnGhostChanging" &&
				(e.args as string[])[0] === "NewGhost",
		),
		"OnGhostChanging should be emitted when changing ghost with --option=raise-event",
	);
	assert.ok(
		events.some(
			(e) =>
				e.type === "shiori_event" &&
				e.eventName === "OnGhostChanged" &&
				(e.args as string[])[0] === "NewGhost",
		),
		"OnGhostChanged should be emitted after changing ghost",
	);
	assert.ok(
		events.some(
			(e) =>
				e.type === "shiori_event" &&
				e.eventName === "OnShellChanging" &&
				(e.args as string[])[0] === "casual",
		),
		"OnShellChanging should be emitted when changing shell",
	);
	assert.ok(
		events.some(
			(e) =>
				e.type === "shiori_event" &&
				e.eventName === "OnShellChanged" &&
				(e.args as string[])[0] === "casual",
		),
		"OnShellChanged should be emitted after changing shell",
	);

	// 2. Multi-scope conversation with surface switching and clear sequences
	events.length = 0;
	sakuraText.textContent = "";
	keroText.textContent = "";

	const multiScopeScript =
		"\\0\\s[0]First line\\c\\s[5]Second line\\1\\s[10]Kero response\\0\\cAll clear\\e";
	await player.play(multiScopeScript);

	assert.ok(sakuraText.textContent.includes("All clear"));
	assert.ok(keroText.textContent.includes("Kero response"));
	assert.ok(
		events.some((e) => e.type === "script_end"),
		"Script end event should be dispatched",
	);
});

test("E2E dialogue lifecycle Cycle 9: Modal system dialogs with terms acceptance and decline workflows", async () => {
	const events: Array<{ type: string; [key: string]: unknown }> = [];
	const sakuraDisplay = createMockElement("div");
	const sakuraText = createMockElement("div");

	const mockApp = {
		ghostId: "e2e_cycle9_terms",
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
			sendShioriEvent: async (eventName: string, args: unknown[]) => {
				events.push({ type: "shiori_event", eventName, args });
				return { status: 200, value: "" };
			},
		},
		modalDialogController: null as unknown,
	};

	const modalController = new ModalDialogController({ app: mockApp });
	mockApp.modalDialogController = modalController;

	const player = new SakuraScriptPlayer(mockApp);
	player.parse = async (script: string) => parseSakuraScript(script);
	player.sleep = () => Promise.resolve();

	// 1. Mock terms acceptance
	let termsHandled = false;
	modalController.openSystemDialog = async (
		dialogType: string,
		dialogParams: string[],
		scope: number,
	) => {
		events.push({
			type: "open_system_dialog",
			dialogType,
			dialogParams,
			scope,
		});
		if (dialogType === "terms") {
			termsHandled = true;
			// Emulate terms accept notification
			await mockApp.ghostController.sendShioriEvent("OnGhostTermsAccept", [
				"test_ghost",
			]);
		}
		return true;
	};

	const termsScript =
		"\\0\\![open,dialog,terms,--id=terms_01,--title=TermsOfUse]Displaying terms\\e";
	await player.play(termsScript);

	assert.equal(termsHandled, true);
	assert.ok(
		events.some(
			(e) =>
				e.type === "open_system_dialog" &&
				e.dialogType === "terms" &&
				(e.dialogParams as string[]).includes("--id=terms_01"),
		),
	);
	assert.ok(
		events.some(
			(e) =>
				e.type === "shiori_event" &&
				e.eventName === "OnGhostTermsAccept" &&
				(e.args as string[])[0] === "test_ghost",
		),
		"OnGhostTermsAccept should be fired after terms acceptance",
	);

	// 2. Emulate terms decline
	await mockApp.ghostController.sendShioriEvent("OnGhostTermsDecline", [
		"test_ghost",
	]);
	assert.ok(
		events.some(
			(e) =>
				e.type === "shiori_event" &&
				e.eventName === "OnGhostTermsDecline" &&
				(e.args as string[])[0] === "test_ghost",
		),
		"OnGhostTermsDecline should be fired after terms decline",
	);
});
