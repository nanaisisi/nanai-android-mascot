import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
	SakuraCommandHandler,
	scriptLifetimeState,
} from "../../ui/js/ghost/sakura-command-handler.js";
import { createMockApp, setupMockDom } from "./helpers.js";

setupMockDom();

describe("SakuraCommandHandler - Cycle 6 Extended Commands", () => {
	it("handles reload commands (shell, ghost, balloon, descript, surface, shiori)", async () => {
		const eventsSent = [];
		const mockApp = createMockApp(eventsSent);
		mockApp.ghostController.currentGhost = {
			name: "TestGhost",
			path: "/ghosts/test",
		};
		mockApp.ghostController.currentShell = "master";
		mockApp.ghostController.initializeGhostSHIORI = async (ghost) => {
			eventsSent.push({ ev: "initializeGhostSHIORI", ghost });
		};
		mockApp.ghostController.selectShell = async (shell) => {
			eventsSent.push({ ev: "selectShell", shell });
		};
		mockApp.ghostController.switchGhost = async (name) => {
			eventsSent.push({ ev: "switchGhost", name });
		};
		mockApp.setBalloonTheme = async (theme) => {
			eventsSent.push({ ev: "setBalloonTheme", theme });
		};
		mockApp.balloonThemeManager = {
			resetDescript: () => {
				eventsSent.push({ ev: "resetDescript" });
			},
		};
		mockApp.surfaceManager = {
			loadSurfacesTxt: async (path) => {
				eventsSent.push({ ev: "loadSurfacesTxt", path });
			},
		};

		const player = { currentScope: 0, app: mockApp };
		const handler = new SakuraCommandHandler(player);

		await handler.runCommand(["reload", "shell"]);
		assert.ok(
			eventsSent.some((e) => e.ev === "selectShell" && e.shell === "master"),
		);

		await handler.runCommand(["reload", "ghost"]);
		assert.ok(
			eventsSent.some((e) => e.ev === "switchGhost" && e.name === "TestGhost"),
		);

		await handler.runCommand(["reload", "balloon"]);
		assert.ok(eventsSent.some((e) => e.ev === "setBalloonTheme"));

		await handler.runCommand(["reload", "descript"]);
		assert.ok(eventsSent.some((e) => e.ev === "initializeGhostSHIORI"));
		assert.ok(eventsSent.some((e) => e.ev === "resetDescript"));

		await handler.runCommand(["reloadsurface"]);
		assert.ok(
			eventsSent.some(
				(e) =>
					e.ev === "loadSurfacesTxt" && e.path === "/ghosts/test/shell/master",
			),
		);
	});

	it("handles change commands and vanishbymyself", async () => {
		const eventsSent = [];
		const mockApp = createMockApp(eventsSent);
		mockApp.ghostController.currentGhost = { name: "CurrentGhost" };
		mockApp.ghostController.currentShell = "default";
		mockApp.ghostController.selectShell = async (name) => {
			eventsSent.push({ ev: "selectShell", name });
		};
		mockApp.setBalloonTheme = async (name) => {
			eventsSent.push({ ev: "setBalloonTheme", name });
		};
		mockApp.closeApp = async () => {
			eventsSent.push({ ev: "closeApp" });
		};

		const player = { currentScope: 0, app: mockApp };
		const handler = new SakuraCommandHandler(player);

		// change shell with --option=raise-event
		await handler.runCommand([
			"change",
			"shell",
			"winter",
			"--option=raise-event",
		]);
		assert.ok(
			eventsSent.some(
				(e) =>
					e.ev === "OnShellChanging" &&
					e.args[0] === "winter" &&
					e.args[1] === "default",
			),
		);
		assert.ok(
			eventsSent.some((e) => e.ev === "selectShell" && e.name === "winter"),
		);

		// change balloon
		await handler.runCommand(["change", "balloon", "custom_balloon"]);
		assert.ok(
			eventsSent.some(
				(e) => e.ev === "setBalloonTheme" && e.name === "custom_balloon",
			),
		);
		assert.ok(
			eventsSent.some(
				(e) => e.ev === "OnBalloonChange" && e.args[0] === "custom_balloon",
			),
		);

		// vanishbymyself
		await handler.runCommand(["vanishbymyself"]);
		assert.ok(eventsSent.some((e) => e.ev === "OnVanishSelected"));
		assert.ok(eventsSent.some((e) => e.ev === "closeApp"));
	});

	it("handles cross-ghost, timer, and embed event commands", async () => {
		const eventsSent = [];
		const mockApp = createMockApp(eventsSent);
		mockApp.ghostController.sendRaiseOther = async (ghost, ev, refs) => {
			eventsSent.push({ ev: "raiseOther", ghost, event: ev, refs });
		};
		mockApp.ghostController.sendNotifyOther = async (ghost, ev, refs) => {
			eventsSent.push({ ev: "notifyOther", ghost, event: ev, refs });
		};
		mockApp.ghostController.sendShioriEvent = async (ev, refs) => {
			eventsSent.push({ ev, refs });
			if (ev === "OnEmbedScript") {
				return { response: { value: "\\0テスト\\e" } };
			}
			return { response: { value: "" } };
		};

		let playedScript = "";
		const player = {
			currentScope: 0,
			app: mockApp,
			playScript: async (s) => {
				playedScript = s;
			},
		};
		const handler = new SakuraCommandHandler(player);

		await handler.runCommand([
			"raiseother",
			"OtherGhost",
			"OnGreeting",
			"arg1",
		]);
		assert.ok(
			eventsSent.some(
				(e) =>
					e.ev === "raiseOther" &&
					e.ghost === "OtherGhost" &&
					e.event === "OnGreeting" &&
					e.refs[0] === "arg1",
			),
		);

		await handler.runCommand(["notifyother", "OtherGhost", "OnNotice", "data"]);
		assert.ok(
			eventsSent.some(
				(e) =>
					e.ev === "notifyOther" &&
					e.ghost === "OtherGhost" &&
					e.event === "OnNotice" &&
					e.refs[0] === "data",
			),
		);

		await handler.runCommand(["embed", "OnEmbedScript", "ref0"]);
		assert.equal(playedScript, "\\0テスト\\e");

		// timerraiseother & cancel
		await handler.runCommand([
			"timerraiseother",
			"50",
			"1",
			"OtherGhost",
			"OnTimerEvent",
			"val",
		]);
		await handler.runCommand([
			"timerraiseother",
			"0",
			"1",
			"OtherGhost",
			"OnTimerEvent",
		]);
	});

	it("handles mode transitions (enter, leave, entermode, leavemode)", async () => {
		const eventsSent = [];
		const mockApp = createMockApp(eventsSent);
		const player = { currentScope: 0, app: mockApp };
		const handler = new SakuraCommandHandler(player);

		scriptLifetimeState.reset();
		assert.equal(scriptLifetimeState.hasMode("passivemode"), false);

		await handler.runCommand(["enter", "passivemode"]);
		assert.equal(scriptLifetimeState.hasMode("passivemode"), true);
		assert.equal(player.is_passivemode, true);
		assert.ok(
			eventsSent.some(
				(e) =>
					e.ev === "OnModeChange" &&
					e.args[0] === "passivemode" &&
					e.args[1] === "enter",
			),
		);

		await handler.runCommand(["leave", "passivemode"]);
		assert.equal(scriptLifetimeState.hasMode("passivemode"), false);
		assert.equal(player.is_passivemode, false);
		assert.ok(
			eventsSent.some(
				(e) =>
					e.ev === "OnModeChange" &&
					e.args[0] === "passivemode" &&
					e.args[1] === "leave",
			),
		);

		// test alias commands entermode and leavemode
		await handler.runCommand(["entermode", "collisionmode"]);
		assert.equal(scriptLifetimeState.hasMode("collisionmode"), true);
		assert.equal(player.is_collisionmode, true);

		await handler.runCommand(["leavemode", "collisionmode"]);
		assert.equal(scriptLifetimeState.hasMode("collisionmode"), false);
		assert.equal(player.is_collisionmode, false);
	});
});
