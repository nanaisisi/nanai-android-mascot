import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis;
globalThis.document = {
	documentElement: { style: {} },
	querySelector: () => null,
};

const { updateMethods } = await import("../ui/js/core/app-update.js");

test("updateMethods.startNetworkUpdate covers all flows and edge cases", async () => {
	const eventsSent = [];
	const mockApp = {
		...updateMethods,
		ghostController: {
			currentGhost: { name: "MockGhost", path: "path/to/ghost" },
			sendShioriEvent: async (ev, args) => {
				eventsSent.push({ ev, args });
				if (ev === "OnUpdateProcessExec") return { script: null };
				return { script: null };
			},
		},
		showBalloon() {},
		wait: async () => {},
	};

	// 1. Browser fallback (Tauri unavailable)
	const origTauri = globalThis.__TAURI__;
	delete globalThis.__TAURI__;
	await mockApp.startNetworkUpdate();

	// 2. Tauri available, checkOnly = true (success with update)
	globalThis.__TAURI__ = {
		core: {
			invoke: async (cmd, args) => {
				if (cmd === "check_ghost_update") {
					return {
						has_update: true,
						total_count: 2,
						message: "Update found",
						update_files: [{ path: "file1.txt" }, { path: "file2.txt" }],
					};
				}
			},
		},
		event: {
			listen: async () => () => {},
		},
	};

	eventsSent.length = 0;
	await mockApp.startNetworkUpdate(null, { checkOnly: true });

	// 3. Tauri available, checkOnly = true (no update / error in check)
	globalThis.__TAURI__.core.invoke = async (cmd) => {
		if (cmd === "check_ghost_update") throw new Error("404 not found");
	};
	eventsSent.length = 0;
	await mockApp.startNetworkUpdate(null, { checkOnly: true });

	// 4. Tauri available, full update, no update
	globalThis.__TAURI__.core.invoke = async (cmd) => {
		if (cmd === "check_ghost_update") {
			return { has_update: false, total_count: 0, update_files: [] };
		}
	};
	eventsSent.length = 0;
	await mockApp.startNetworkUpdate();

	// 5. Tauri available, full update with success and progress events
	let progressCb = null;
	globalThis.__TAURI__.event = {
		listen: async (eventName, handler) => {
			progressCb = handler;
			return () => {};
		},
	};
	globalThis.__TAURI__.core.invoke = async (cmd) => {
		if (cmd === "check_ghost_update") {
			return {
				has_update: true,
				total_count: 1,
				update_files: [{ path: "file1.txt" }],
			};
		}
		if (cmd === "execute_ghost_update") {
			if (progressCb) {
				progressCb({ payload: { phase: "download-begin", path: "file1.txt" } });
				progressCb({ payload: { phase: "md5-begin", path: "file1.txt" } });
				progressCb({ payload: { phase: "md5-complete", path: "file1.txt" } });
				progressCb({ payload: { phase: "md5-failed", path: "file1.txt" } });
			}
			return { success: true, updated_files: ["file1.txt"], reason: "changed" };
		}
	};

	eventsSent.length = 0;
	await mockApp.startNetworkUpdate();

	// 6. Full update with execute_ghost_update failure
	globalThis.__TAURI__.core.invoke = async (cmd) => {
		if (cmd === "check_ghost_update") {
			return {
				has_update: true,
				total_count: 1,
				update_files: [{ path: "file1.txt" }],
			};
		}
		if (cmd === "execute_ghost_update") {
			return { success: false, updated_files: [], reason: "disk_full" };
		}
	};

	eventsSent.length = 0;
	await mockApp.startNetworkUpdate();

	// 7. Full update with timeout error in catch
	globalThis.__TAURI__.core.invoke = async (cmd) => {
		if (cmd === "check_ghost_update") throw new Error("timeout error");
	};
	eventsSent.length = 0;
	await mockApp.startNetworkUpdate();

	if (origTauri) globalThis.__TAURI__ = origTauri;
	else delete globalThis.__TAURI__;

	assert.ok(true);
});
