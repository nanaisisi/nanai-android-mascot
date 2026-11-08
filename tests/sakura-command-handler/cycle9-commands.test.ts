import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { getActiveScriptTimersCount } from "../../ui/ts/ghost/command-handler/system.js";
import {
	clearAllScriptTimers,
	SakuraCommandHandler,
} from "../../ui/ts/ghost/sakura-command-handler.js";
import { createMockApp, setupMockDom } from "./helpers.js";

setupMockDom();

describe("SakuraCommandHandler - Cycle 9 Extended Commands", () => {
	it("handles timernotify and timernotifyother commands", async () => {
<<<<<<< HEAD
		const eventsSent: unknown[] = [];
=======
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const eventsSent: any[] = [];
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
		const mockApp = createMockApp(eventsSent);
		mockApp.ghostController.sendShioriNotify = async (
			ev: string,
			refs: string[],
		) => {
			eventsSent.push({ type: "notify", ev, refs });
		};
		mockApp.ghostController.sendNotifyOther = async (
			ghost: string,
			ev: string,
			refs: string[],
		) => {
			eventsSent.push({ type: "notifyOther", ghost, ev, refs });
		};

		const player = { currentScope: 0, app: mockApp };
		const handler = new SakuraCommandHandler(player);

		// 1. timernotify with timeout
		await handler.runCommand([
			"timernotify",
			"10",
			"1",
			"OnTestNotify",
			"refA",
			"refB",
		]);
		assert.ok(getActiveScriptTimersCount() > 0);

		// Wait for timer to trigger
		await new Promise((r) => setTimeout(r, 25));
		assert.ok(
			eventsSent.some(
				(e) =>
					e.type === "notify" &&
					e.ev === "OnTestNotify" &&
					e.refs[0] === "refA",
			),
		);

		// 2. timernotifyother
		await handler.runCommand([
			"timernotifyother",
			"10",
			"1",
			"TargetGhost",
			"OnTargetEvent",
			"arg1",
		]);
		await new Promise((r) => setTimeout(r, 25));
		assert.ok(
			eventsSent.some(
				(e) =>
					e.type === "notifyOther" &&
					e.ghost === "TargetGhost" &&
					e.ev === "OnTargetEvent" &&
					e.refs[0] === "arg1",
			),
		);

		clearAllScriptTimers();
		assert.equal(getActiveScriptTimersCount(), 0);
	});

	it("handles plugin timer and event commands (timerraiseplugin, timernotifyplugin, raiseplugin, notifyplugin)", async () => {
<<<<<<< HEAD
		const eventsSent: unknown[] = [];
=======
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const eventsSent: any[] = [];
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
		const mockApp = createMockApp(eventsSent);
		mockApp.ghostController.sendPluginEvent = async (
			plugin: string,
			ev: string,
			refs: string[],
			isNotify: boolean,
		) => {
			eventsSent.push({ plugin, ev, refs, isNotify });
		};

		const player = { currentScope: 0, app: mockApp };
		const handler = new SakuraCommandHandler(player);

		// Plugin timers
		await handler.runCommand([
			"timerraiseplugin",
			"10",
			"1",
			"PluginA",
			"OnTimerEvent",
			"param1",
		]);
		await handler.runCommand([
			"timernotifyplugin",
			"10",
			"1",
			"PluginB",
			"OnNotifyEvent",
			"param2",
		]);

		await new Promise((r) => setTimeout(r, 25));
		assert.ok(
			eventsSent.some(
				(e) => e.plugin === "PluginA" && e.ev === "OnTimerEvent" && !e.isNotify,
			),
		);
		assert.ok(
			eventsSent.some(
				(e) => e.plugin === "PluginB" && e.ev === "OnNotifyEvent" && e.isNotify,
			),
		);

		// Instant plugin commands
		await handler.runCommand(["raiseplugin", "PluginC", "OnPluginExec", "x"]);
		await handler.runCommand([
			"notifyplugin",
			"PluginD",
			"OnPluginNotify",
			"y",
		]);

		clearAllScriptTimers();
	});

	it("handles execute commands (execute:*, execute,emptyrecyclebin, filewatch, ping, nslookup, schedule-add)", async () => {
<<<<<<< HEAD
		const eventsSent: unknown[] = [];
=======
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const eventsSent: any[] = [];
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
		const mockApp = createMockApp(eventsSent);
		mockApp.ghostController.sendShioriEvent = async (
			ev: string,
			refs: string[],
		) => {
			eventsSent.push({ ev, refs });
		};

		const player = { currentScope: 0, app: mockApp };
		const handler = new SakuraCommandHandler(player);

		// execute,emptyrecyclebin
		await handler.runCommand(["execute", "emptyrecyclebin"]);

		// execute:filewatch & cancel:filewatch
		await handler.runCommand(["execute", "filewatch", "/tmp/watch.txt"]);
		await handler.runCommand(["cancel", "filewatch", "/tmp/watch.txt"]);

		// execute:schedule-add
		await handler.runCommand([
			"execute",
			"schedule-add",
			"2026-11-08",
			"15:00",
			"Meeting",
			"Discussion",
		]);
		assert.ok(
			eventsSent.some(
				(e) =>
					e.ev === "OnScheduleAdd" &&
					e.refs[0] === "2026-11-08" &&
					e.refs[2] === "Meeting",
			),
		);

		// execute:resetwindowpos / resetballoonpos dispatch
		let actionDispatched = "";
		mockApp.dispatchAction = async (action: string) => {
			actionDispatched = action;
		};
		await handler.runCommand(["execute", "resetwindowpos"]);
		assert.equal(actionDispatched, "reset-shell-position");

		await handler.runCommand(["execute", "resetballoonpos"]);
		assert.equal(actionDispatched, "reset-balloon-position");
	});
});
