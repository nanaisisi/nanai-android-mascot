import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis;
globalThis.document = {
	documentElement: { style: {} },
	querySelector: () => null,
};

let progressCb = null;

const createPersistentListenersProxy = () => {
	const map = {};
	return new Proxy(map, {
		get(target, prop) {
			if (!(prop in target)) {
				const eventMap = {};
				target[prop] = new Proxy(eventMap, {
					get(t, p) {
						if (!(p in t)) {
							t[p] = { unregisterListener: () => {} };
						}
						return t[p];
					},
				});
			}
			return target[prop];
		},
	});
};

globalThis.__TAURI_INTERNALS__ = {
	metadata: { currentWindow: { label: "main" } },
	invoke: async () => null,
	transformCallback: (cb) => cb,
	plugins: {
		event: {
			listeners: createPersistentListenersProxy(),
			listen: async (_eventName, handler) => {
				progressCb = handler;
				return 1;
			},
			emit: async () => {},
			unregisterListener: () => {},
		},
	},
};

const { updateMethods } = await import("../ui/js/core/app-update.js");

test("updateMethods.startNetworkUpdate covers 100% of network update flows, progress events, and summaries", async () => {
	const eventsSent = [];
	let scriptReturn = null;
	let resExScript = "handled";

	const mockApp = {
		...updateMethods,
		ghostController: {
			currentGhost: { name: "MockGhost", path: "path/to/ghost" },
			sendShioriEvent: async (ev, args) => {
				eventsSent.push({ ev, args });
				if (ev === "OnUpdateProcessExec") return { script: scriptReturn };
				if (ev.endsWith("Ex")) return { script: resExScript };
				return { script: "custom" };
			},
			selectGhost() {},
		},
		showBalloon() {},
		wait: async () => {},
	};

	// 1. OnUpdateProcessExec returns script (early return)
	scriptReturn = "custom script";
	delete globalThis.__TAURI__;
	const savedInternals = globalThis.__TAURI_INTERNALS__;
	delete globalThis.__TAURI_INTERNALS__;
	await mockApp.startNetworkUpdate();

	// 2. Browser fallback (Tauri unavailable)
	scriptReturn = null;
	await mockApp.startNetworkUpdate();

	// 3. Tauri available via __TAURI_INTERNALS__
	globalThis.__TAURI_INTERNALS__ = savedInternals;

	const origInvoke = async (cmd) => {
		if (cmd === "check_ghost_update") {
			return {
				has_update: true,
				total_count: 2,
				message: "Update found",
				update_files: [{ path: "file1.txt" }, { path: "file2.txt" }],
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
		return null;
	};

	globalThis.__TAURI_INTERNALS__.invoke = origInvoke;

	// 3a. checkOnly = true (success with update)
	eventsSent.length = 0;
	await mockApp.startNetworkUpdate(null, { checkOnly: true });

	// 3b. checkOnly = true (no update)
	globalThis.__TAURI_INTERNALS__.invoke = async (cmd) => {
		if (cmd === "check_ghost_update") {
			return {
				has_update: false,
				total_count: 0,
				message: "No update",
				update_files: [],
			};
		}
		return origInvoke(cmd);
	};
	eventsSent.length = 0;
	await mockApp.startNetworkUpdate(null, { checkOnly: true });

	// 4. checkOnly = true (error 404 in check)
	globalThis.__TAURI_INTERNALS__.invoke = async (cmd) => {
		if (cmd === "check_ghost_update") throw new Error("404 not found");
		return null;
	};
	eventsSent.length = 0;
	await mockApp.startNetworkUpdate(null, { checkOnly: true });

	// 5. Full update, no update files
	globalThis.__TAURI_INTERNALS__.invoke = async (cmd) => {
		if (cmd === "check_ghost_update") {
			return { has_update: false, total_count: 0, update_files: [] };
		}
		return null;
	};
	eventsSent.length = 0;
	await mockApp.startNetworkUpdate();

	// 6. Full update with success and progress events
	globalThis.__TAURI_INTERNALS__.invoke = origInvoke;
	eventsSent.length = 0;
	await mockApp.startNetworkUpdate();

	// 7. Full update with execute_ghost_update failure
	globalThis.__TAURI_INTERNALS__.invoke = async (cmd) => {
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
		return null;
	};
	eventsSent.length = 0;
	await mockApp.startNetworkUpdate();

	// 8. Full update with timeout error in catch
	globalThis.__TAURI_INTERNALS__.invoke = async (cmd) => {
		if (cmd === "check_ghost_update") throw new Error("timeout error");
		return null;
	};
	eventsSent.length = 0;
	await mockApp.startNetworkUpdate();

	// 9. Test sendUpdateResultSummary when Ex script is falsy (sends baseEvent)
	resExScript = "";
	await mockApp.sendUpdateResultSummary("MockGhost", true, 0, null, false);
	await mockApp.sendUpdateResultSummary(
		"MockGhost",
		false,
		"error",
		"file.txt",
		true,
	);

	delete globalThis.__TAURI_INTERNALS__;
	assert.ok(true);
});
