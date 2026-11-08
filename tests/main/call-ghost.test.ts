import assert from "node:assert/strict";
import { test } from "vitest";
import {
	clearTauriGlobals,
	createTauriInternals,
	NanaiAndroidMascotApp,
	setupMainDomGlobals,
} from "./helpers.js";

test("NanaiAndroidMascotApp callGhost (lines 85-87) covers success and error branches", async () => {
	setupMainDomGlobals();
	const origInit = NanaiAndroidMascotApp.prototype.init;
	NanaiAndroidMascotApp.prototype.init = async () => {};

	try {
		const app = new NanaiAndroidMascotApp();

		// 1. Non-Tauri environment
		clearTauriGlobals();
		await app.callGhost("Ghost1");

		// 2. Tauri environment success
		clearTauriGlobals();
		const invokedCmds: { cmd: string; args: unknown }[] = [];
		(globalThis as Record<string, unknown>).__TAURI_INTERNALS__ =
			createTauriInternals(async (cmd, args) => {
				invokedCmds.push({ cmd, args });
			});

		await app.callGhost("Ghost2");
		assert.ok(
			invokedCmds.some(
				(c) =>
					c.cmd === "spawn_ghost" &&
					(c.args as { ghostName: string })?.ghostName === "Ghost2",
			),
		);

		// 3. Tauri environment error
		clearTauriGlobals();
		(globalThis as Record<string, unknown>).__TAURI_INTERNALS__ =
			createTauriInternals(async (cmd) => {
				if (cmd.startsWith("plugin:event|")) return 1;
				throw new Error("spawn_ghost error");
			});
		await app.callGhost("Ghost3");
	} finally {
		NanaiAndroidMascotApp.prototype.init = origInit;
		clearTauriGlobals();
	}
});
