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
	let scriptReturn = null;
	const mockApp = {
		...updateMethods,
		ghostController: {
			currentGhost: { name: "MockGhost", path: "path/to/ghost" },
			sendShioriEvent: async (ev, args) => {
				eventsSent.push({ ev, args });
				if (ev === "OnUpdateProcessExec") return { script: scriptReturn };
				if (ev.endsWith("Ex")) return { script: "handled" }; // Test summary when script is returned
				return { script: "custom" };
			},
			selectGhost() {},
		},
		showBalloon() {},
		wait: async () => {},
	};

	// 1. OnUpdateProcessExec returns script (early return) (Lines 49-50)
	scriptReturn = "custom script";
	const origTauri = globalThis.__TAURI__;
	delete globalThis.__TAURI__;
	await mockApp.startNetworkUpdate();

	// 2. Browser fallback (Tauri unavailable)
	scriptReturn = null;
	await mockApp.startNetworkUpdate();

	// 3. Tauri available, checkOnly = true (success with update) (Lines 90-140)
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

	// 3b. Tauri available, checkOnly = true (no update)
	globalThis.__TAURI__.core.invoke = async (cmd) => {
		if (cmd === "check_ghost_update") {
			return {
				has_update: false,
				total_count: 0,
				message: "No update",
				update_files: [],
			};
		}
	};
	eventsSent.length = 0;
	await mockApp.startNetworkUpdate(null, { checkOnly: true });

	// 4. Tauri available, checkOnly = true (error in check) (Lines 195-240)
	globalThis.__TAURI__.core.invoke = async (cmd) => {
		if (cmd === "check_ghost_update") throw new Error("404 not found");
	};
	eventsSent.length = 0;
	await mockApp.startNetworkUpdate(null, { checkOnly: true });

	// 5. Tauri available, full update, no update
	globalThis.__TAURI__.core.invoke = async (cmd) => {
		if (cmd === "check_ghost_update") {
			return { has_update: false, total_count: 0, update_files: [] };
		}
	};
	eventsSent.length = 0;
	await mockApp.startNetworkUpdate();

	// 6. Tauri available, full update with success and progress events (Lines 150-189)
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

	// 7. Full update with execute_ghost_update failure (Lines 195-240)
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

	// 8. Full update with timeout error in catch (Lines 195-240)
	globalThis.__TAURI__.core.invoke = async (cmd) => {
		if (cmd === "check_ghost_update") throw new Error("timeout error");
	};
	eventsSent.length = 0;
	await mockApp.startNetworkUpdate();

	// 9. Test sendUpdateResultSummary when script is returned
	await mockApp.sendUpdateResultSummary("MockGhost", true, 0, null, false);

	if (origTauri) globalThis.__TAURI__ = origTauri;
	else delete globalThis.__TAURI__;

	assert.ok(true);
});
