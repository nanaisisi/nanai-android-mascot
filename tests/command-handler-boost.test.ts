import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { handlePluginEvent } from "../ui/ts/ghost/command-handler/plugin.js";
import {
	handleExecuteResetBalloonPos,
	handleExecuteResetWindowPos,
	handleSetAlignmentOnDesktop,
	handleSetTaskTrayIcon,
	handleSetTrayBalloon,
} from "../ui/ts/ghost/command-handler/system/desktop.js";
import {
	handleBiffCommand,
	handleExecuteSntpCommand,
	handleOpenSystemTarget,
} from "../ui/ts/ghost/command-handler/system/target.js";
import type { SakuraCommandHandler } from "../ui/ts/ghost/sakura-command-handler.js";

interface TauriInternalsMock {
	invoke: (cmd: string, args?: unknown) => Promise<unknown>;
}

const globalWithTauri = globalThis as unknown as {
	__TAURI_INTERNALS__?: TauriInternalsMock;
};

describe("Command Handler Plugins & Desktop Coverage", () => {
	it("plugin.js covers plugin command and timer plugin command with Tauri invoke", async () => {
		const invoked: Array<{
			cmd: string;
			args: { request: { pluginName: string; eventId: string } };
		}> = [];
		globalThis.window = globalThis as unknown as Window & typeof globalThis;
		globalWithTauri.__TAURI_INTERNALS__ = {
			invoke: async (cmd: string, args?: unknown) => {
				invoked.push({
					cmd,
					args: args as { request: { pluginName: string; eventId: string } },
				});
			},
		};

		// standard plugin event
		await handlePluginEvent({} as unknown as SakuraCommandHandler, [
			"plugin",
			"my-plugin",
			"OnCustomEvent",
			"ref0",
			"ref1",
		]);
		assert.equal(invoked.length, 1);
		assert.equal(invoked[0].cmd, "execute_plugin_event");
		assert.equal(invoked[0].args.request.pluginName, "my-plugin");

		// timer plugin event
		await handlePluginEvent({} as unknown as SakuraCommandHandler, [
			"timerraise",
			"1000",
			"0",
			"my-plugin",
			"OnTimerEvent",
			"val",
		]);
		assert.equal(invoked.length, 2);
		assert.equal(invoked[1].args.request.eventId, "OnTimerEvent");

		// invoke failure logs warning
		globalWithTauri.__TAURI_INTERNALS__.invoke = async () => {
			throw new Error("plugin invoke fail");
		};
		await handlePluginEvent({} as unknown as SakuraCommandHandler, [
			"plugin",
			"fail-plugin",
			"OnFail",
		]);
	});

	it("system/target.js covers biff, sntp, and open targets", async () => {
		let emailChecked = false;
		let sntpSent = false;
		const pathOpened: Array<{ cmd: string; args: { path: string } }> = [];
		let menuToggled = false;
		const windowOpened: Array<string | URL | undefined> = [];

		globalThis.window = globalThis as unknown as Window & typeof globalThis;
		globalThis.open = (url?: string | URL) => {
			windowOpened.push(url);
			return null;
		};
		globalWithTauri.__TAURI_INTERNALS__ = {
			invoke: async (cmd: string, args?: unknown) => {
				pathOpened.push({ cmd, args: args as { path: string } });
			},
		};

		const handler = {
			app: {
				networkActions: {
					checkEmail: async () => {
						emailChecked = true;
					},
				},
				ghostController: {
					sendShioriEvent: async (_ev: string, _args: string[]) => {
						sntpSent = true;
					},
					currentGhost: { path: "/ghost/path" },
				},
				toggleMenu: () => {
					menuToggled = true;
				},
				modalManager: {
					show: () => {},
				},
			},
		} as unknown as SakuraCommandHandler;

		await handleBiffCommand(handler, []);
		assert.equal(emailChecked, true);

		await handleExecuteSntpCommand(handler, []);
		assert.equal(sntpSent, true);

		// open explorer
		await handleOpenSystemTarget(handler, ["open", "explorer"]);
		assert.equal(menuToggled, true);

		// open file
		await handleOpenSystemTarget(handler, ["open", "file", "/tmp/file.txt"]);
		assert.ok(pathOpened.some((p) => p.args.path === "/tmp/file.txt"));

		// open browser URL
		await handleOpenSystemTarget(handler, [
			"open",
			"browser",
			"https://example.com",
		]);
		assert.equal(windowOpened[0], "https://example.com");

		// open configuration
		await handleOpenSystemTarget(handler, ["open", "configuration", "ghost"]);

		// open devtools
		await handleOpenSystemTarget(handler, ["open", "developer"]);

		// open readme
		await handleOpenSystemTarget(handler, ["open", "readme"]);

		// open unknown target
		await handleOpenSystemTarget(handler, ["open", "unknown-target"]);
	});

	it("system/desktop.js covers alignment, tray, notifications, and reset position", async () => {
		let trayIconSet: unknown = null;
		let notificationShown: unknown = null;
		const actionDispatched: string[] = [];

		globalThis.window = globalThis as unknown as Window & typeof globalThis;
		globalWithTauri.__TAURI_INTERNALS__ = {
			invoke: async (cmd: string, args?: unknown) => {
				if (cmd === "set_tray_icon") trayIconSet = args;
				if (cmd === "show_tray_notification") notificationShown = args;
			},
		};

		const handler = {
			app: {
				dispatchAction: async (action: string) => actionDispatched.push(action),
			},
		} as unknown as SakuraCommandHandler;

		// alignment free (returns early)
		await handleSetAlignmentOnDesktop(handler, [
			"set",
			"alignmentondesktop",
			"free",
		]);

		// task tray icon
		await handleSetTaskTrayIcon(handler, ["set", "tasktrayicon", "/icon.ico"]);
		assert.deepEqual(trayIconSet, { iconPath: "/icon.ico" });

		// tray balloon notification
		await handleSetTrayBalloon(handler, [
			"set",
			"trayballoon",
			"Title",
			"Text",
		]);
		assert.deepEqual(notificationShown, { title: "Title", text: "Text" });

		// reset window and balloon pos
		await handleExecuteResetWindowPos(handler, []);
		assert.ok(actionDispatched.includes("reset-shell-position"));

		await handleExecuteResetBalloonPos(handler, []);
		assert.ok(actionDispatched.includes("reset-balloon-position"));
	});
});
