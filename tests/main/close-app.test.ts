import assert from "node:assert/strict";
import { test } from "vitest";
import {
	clearTauriGlobals,
	createTauriInternals,
	NanaiAndroidMascotApp,
	setupMainDomGlobals,
} from "./helpers.js";

test("NanaiAndroidMascotApp closeApp (lines 164-183) covers all exit fallbacks and isPlaying state", async () => {
	setupMainDomGlobals();
	const origInit = NanaiAndroidMascotApp.prototype.init;
	NanaiAndroidMascotApp.prototype.init = async () => {};

	try {
		// 1. Normal exit with close_ghost success
		const app1 = new NanaiAndroidMascotApp();
		(app1 as unknown as { hideMenu: () => void }).hideMenu = () => {};
		app1.modalManager = { hide: () => {} } as unknown as null;
		(app1 as unknown as Record<string, unknown>).ghostController = {
			stopSecondChangeTimer: () => {},
			sendShioriEvent: async () => ({}),
		};
		(app1 as unknown as Record<string, unknown>).sakuraPlayer = {
			isPlaying: false,
		};

		const cmds1: string[] = [];
		clearTauriGlobals();
		(globalThis as Record<string, unknown>).__TAURI_INTERNALS__ =
			createTauriInternals(async (cmd) => {
				if (cmd.startsWith("plugin:event|")) return 1;
				cmds1.push(cmd);
				if (cmd === "unload_current_ghost") return;
				if (cmd === "close_ghost") return;
			});

		await app1.closeApp();
		await new Promise((r) => setTimeout(r, 450));
		assert.ok(cmds1.includes("unload_current_ghost"));
		assert.ok(cmds1.includes("close_ghost"));

		// 2. Exit with unload_current_ghost error, close_ghost error, exit_app error -> window.close fallback
		const app2 = new NanaiAndroidMascotApp();
		(app2 as unknown as { hideMenu: () => void }).hideMenu = () => {};
		app2.modalManager = { hide: () => {} } as unknown as null;
		(app2 as unknown as Record<string, unknown>).ghostController = {
			stopSecondChangeTimer: () => {},
			sendShioriEvent: async () => {
				throw new Error("OnClose error");
			},
		};
		(app2 as unknown as Record<string, unknown>).sakuraPlayer = {
			isPlaying: true,
		};

		const cmds2: string[] = [];
		let windowClosed = false;
		globalThis.close = () => {
			windowClosed = true;
		};
		clearTauriGlobals();
		(globalThis as Record<string, unknown>).__TAURI_INTERNALS__ =
			createTauriInternals(async (cmd) => {
				if (cmd.startsWith("plugin:event|")) return 1;
				cmds2.push(cmd);
				throw new Error(`${cmd} error`);
			});

		await app2.closeApp();
		await app2.closeApp(); // _isExiting early return
		await new Promise((r) => setTimeout(r, 1550));
		assert.ok(cmds2.includes("unload_current_ghost"));
		assert.ok(cmds2.includes("close_ghost"));
		assert.ok(cmds2.includes("exit_app"));
		assert.equal(windowClosed, true);

		// 3. exit_app success & hideMenu error catch(_err)
		clearTauriGlobals();
		const app3 = new NanaiAndroidMascotApp();
		(app3 as unknown as { hideMenu: () => void }).hideMenu = () => {
			throw new Error("hideMenu error");
		};
		const cmds3: string[] = [];
		(globalThis as Record<string, unknown>).__TAURI_INTERNALS__ =
			createTauriInternals(async (cmd) => {
				if (cmd.startsWith("plugin:event|")) return 1;
				cmds3.push(cmd);
				if (cmd === "exit_app") return;
				throw new Error(`${cmd} error`);
			});
		await app3.closeApp();
		await new Promise((r) => setTimeout(r, 50));
		assert.ok(cmds3.includes("exit_app"));

		// 4. Non-Tauri closeApp -> skips isTauriAvailable() block and calls window.close()
		clearTauriGlobals();
		const app4 = new NanaiAndroidMascotApp();
		(app4 as unknown as { hideMenu: () => void }).hideMenu = () => {};
		app4.modalManager = null;
		(app4 as unknown as Record<string, unknown>).ghostController = null;
		(app4 as unknown as Record<string, unknown>).sakuraPlayer = null;
		let nonTauriClosed = false;
		globalThis.close = () => {
			nonTauriClosed = true;
		};
		await app4.closeApp();
		await new Promise((r) => setTimeout(r, 450));
		assert.equal(nonTauriClosed, true);
	} finally {
		NanaiAndroidMascotApp.prototype.init = origInit;
		clearTauriGlobals();
	}
});
