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
const { menuCaptionRenderer, MENU_CAPTION_DEFINITIONS } = await import(
	"../../ui/ts/ui/renderers/menu-caption-renderer.js"
);

test("E2E dialogue lifecycle Cycle 6: system dialogs, SERIKO move displacement, raw text mode, and ownerdraw captions", async () => {
	const events = [];
	const sakuraDisplay = createMockElement("div");
	const keroDisplay = createMockElement("div");
	const sakuraText = createMockElement("div");
	const keroText = createMockElement("div");

	const moveOffsets = { 0: { x: 0, y: 0 }, 1: { x: 0, y: 0 } };
	const surfaceUpdates = [];

	const mockApp = {
		ghostId: "e2e_cycle6_ghost",
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
			currentSurfaceIdFor: (scope) => (scope === 1 ? 10 : 0),
			resolveSurfaceNumber: (id) => id,
			setBaseMoveOffset: (scope, x, y) => {
				moveOffsets[scope] = { x, y };
				events.push({ type: "move_offset", scope, x, y });
			},
			getBaseMoveOffset: (scope) => moveOffsets[scope] || { x: 0, y: 0 },
		},
		ghostController: {
			updateSurface: async (surfaceId, scope, layers) => {
				surfaceUpdates.push({ surfaceId, scope, layers });
			},
			sendShioriEvent: async (eventName, args) => {
				events.push({ type: "shiori_event", eventName, args });
				return { status: 200, value: "" };
			},
			setScopeMoveOffset: (scope, x, y) => {
				moveOffsets[scope] = { x, y };
			},
		},
	};

	const modalController = new ModalDialogController({ app: mockApp });
	mockApp.modalDialogController = modalController;

	const player = new SakuraScriptPlayer(mockApp);
	player.parse = async (script) => parseSakuraScript(script);
	player.sleep = () => Promise.resolve();

	// ----------------------------------------------------
	// 1. Raw Text Mode Toggle (\_?, \_!) and AutoWrap Disable (\_n) E2E
	// ----------------------------------------------------
	events.length = 0;
	sakuraText.textContent = "";
	const rawScript =
		"\\0Start: \\_?\\s[0]\\w9\\b[0]\\_? Middle: \\_!\\i[5]\\x\\_! End\\e";
	await player.play(rawScript);

	// Inside raw mode, tags are literal text
	assert.ok(
		sakuraText.textContent.includes("\\s[0]\\w9\\b[0]"),
		"Tags within \\_? must be rendered as raw text",
	);
	assert.ok(
		sakuraText.textContent.includes("\\i[5]\\x"),
		"Tags within \\_! must be rendered as raw text",
	);
	assert.ok(
		sakuraText.textContent.includes("Start: ") &&
			sakuraText.textContent.includes("End"),
		"Normal text outside raw toggles must be processed",
	);

	// Test \_n (no_autowrap)
	const noAutoWrapScript = "\\0\\_nText with autowrap suppressed.\\e";
	await player.play(noAutoWrapScript);
	assert.ok(sakuraText.textContent.includes("Text with autowrap suppressed."));

	// ----------------------------------------------------
	// 2. Dynamic Animation Commands (\![anim,add,move,...], overlay, base)
	// ----------------------------------------------------
	events.length = 0;
	surfaceUpdates.length = 0;

	// Move scope 0 by (50, -20)
	const animMoveScript = "\\0\\![anim,add,move,50,-20]Displaced surface\\e";
	await player.play(animMoveScript);

	assert.equal(moveOffsets[0].x, 50);
	assert.equal(moveOffsets[0].y, -20);
	assert.ok(
		events.some(
			(e) =>
				e.type === "move_offset" && e.scope === 0 && e.x === 50 && e.y === -20,
		),
		"SurfaceManager.setBaseMoveOffset should be invoked",
	);

	// Add dynamic overlay
	const animOverlayScript =
		"\\0\\![anim,add,overlay,105,10,15]Overlay added\\e";
	await player.play(animOverlayScript);
	assert.ok(
		surfaceUpdates.some(
			(u) =>
				u.layers &&
				u.layers[0].file === "surface105.png" &&
				u.layers[0].x === 10 &&
				u.layers[0].y === 15 &&
				u.layers[0].type === "overlay",
		),
		"updateSurface should receive dynamic overlay layer",
	);

	// ----------------------------------------------------
	// 3. System Dialogs (\![open,dialog,...]) E2E
	// ----------------------------------------------------
	events.length = 0;
	// Mock openSystemDialog resolution
	modalController.openSystemDialog = async (
		dialogType,
		dialogParams,
		scope,
	) => {
		events.push({
			type: "open_system_dialog",
			dialogType,
			dialogParams,
			scope,
		});
		// Simulate user selection and SHIORI notify
		await mockApp.ghostController.sendShioriEvent("OnSystemDialog", [
			"file_open",
			"/home/user/test.txt",
			scope,
		]);
		return true;
	};

	const dialogScript =
		"\\0\\![open,dialog,open,--id=file_open,--title=SelectFile,--dir=/home/user]\\e";
	await player.play(dialogScript);

	assert.ok(
		events.some(
			(e) =>
				e.type === "open_system_dialog" &&
				e.dialogType === "open" &&
				e.dialogParams.includes("--id=file_open") &&
				e.dialogParams.includes("--title=SelectFile"),
		),
		"openSystemDialog should be called with correct parsed options",
	);
	assert.ok(
		events.some(
			(e) =>
				e.type === "shiori_event" &&
				e.eventName === "OnSystemDialog" &&
				e.args[0] === "file_open" &&
				e.args[1] === "/home/user/test.txt",
		),
		"OnSystemDialog event should be dispatched back to SHIORI",
	);

	// ----------------------------------------------------
	// 4. Ownerdraw Dynamic Menu Captions Resolution E2E
	// ----------------------------------------------------
	const menuRoot = createMockElement("div");
	const biffBtn = createMockElement("button");
	biffBtn.id = "biff-btn";
	biffBtn.textContent = "Default Biff";
	menuRoot.children.push(biffBtn);

	const quitBtn = createMockElement("button");
	quitBtn.id = "close-btn";
	quitBtn.textContent = "Default Quit";
	menuRoot.children.push(quitBtn);

	menuRoot.getElementById = (id) =>
		menuRoot.children.find((c) => c.id === id) || null;

	const customCaptions = {
		"biffbutton.caption": "📨 Check Email Now!",
		"quitbutton.caption": "🚪 Exit Application",
	};

	menuCaptionRenderer.applyCaptions(customCaptions, menuRoot);

	assert.equal(biffBtn.textContent, "📨 Check Email Now!");
	assert.equal(quitBtn.textContent, "🚪 Exit Application");
	assert.ok(MENU_CAPTION_DEFINITIONS.length >= 20);
});
