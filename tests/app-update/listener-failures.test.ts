import assert from "node:assert/strict";
import { test } from "vitest";
import {
	createPersistentListenersProxy,
	updateMethods,
} from "./mock-environment.js";

test("updateMethods.startNetworkUpdate handles update-progress listen failure and unlisten failure", async () => {
	const savedInternals = globalThis.__TAURI_INTERNALS__;

	// Listen failure
	globalThis.__TAURI_INTERNALS__ = {
		metadata: { currentWindow: { label: "main" } },
		invoke: async (cmd: string) => {
			if (cmd === "check_ghost_update") {
				return {
					has_update: true,
					total_count: 1,
					update_files: [{ path: "f.txt" }],
				};
			}
			if (cmd === "execute_ghost_update") {
				return { success: true, updated_files: ["f.txt"] };
			}
			return null;
		},
		transformCallback: (cb: unknown) => cb,
		plugins: {
			event: {
				listeners: createPersistentListenersProxy(),
				listen: async (eventName: string) => {
					if (eventName === "update-progress") throw new Error("listen fail");
					return () => {};
				},
				emit: async () => {},
				unregisterListener: () => {},
			},
		},
	};

	const mockApp = {
		...updateMethods,
		ghostController: {
			currentGhost: { name: "MockGhost", path: "path" },
			sendShioriEvent: async () => ({ script: "" }),
		},
		showBalloon() {},
	};

	await mockApp.startNetworkUpdate();

	// Unlisten failure
	globalThis.__TAURI_INTERNALS__.plugins.event.listen = async () => () => {
		throw new Error("unlisten fail");
	};
	await mockApp.startNetworkUpdate();

	globalThis.__TAURI_INTERNALS__ = savedInternals;
	assert.ok(true);
});
