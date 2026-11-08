import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { updateMethods } from "../../ui/js/core/app-update.js";

describe("core-coverage-boost: app-update edge cases", () => {
	it("startNetworkUpdate executes checkOnly mode with updates found", async () => {
		globalThis.window = globalThis;
		const sentEvents = [];
		let shownBalloon = "";

		globalThis.__TAURI_INTERNALS__ = {
			invoke: async (cmd) => {
				if (cmd === "check_ghost_update") {
					return {
						has_update: true,
						total_count: 3,
						message: "3件の更新があります",
						update_files: [
							{ path: "file1.txt" },
							{ path: "file2.txt" },
							{ path: "file3.txt" },
						],
					};
				}
				return null;
			},
			transformCallback: (cb) => cb,
			plugins: {
				event: {
					listeners: {},
					listen: async () => () => {},
					emit: async () => {},
					unregisterListener: () => {},
				},
			},
		};

		const app = {
			...updateMethods,
			ghostController: {
				currentGhost: { name: "TestGhost", path: "/ghost/path" },
				sendShioriEvent: async (evt, args) => {
					sentEvents.push({ evt, args });
					return null;
				},
			},
			showBalloon: (msg) => {
				shownBalloon = msg;
			},
		};

		await app.startNetworkUpdate(null, { checkOnly: true });

		assert.equal(shownBalloon, "3件の更新があります");
		const checkComp = sentEvents.find((e) => e.evt === "OnUpdateCheckComplete");
		assert.ok(checkComp);
		assert.equal(checkComp.args[0], "3");
		assert.equal(checkComp.args[1], "file1.txt,file2.txt,file3.txt");
	});

	it("startNetworkUpdate in checkOnly mode handles check failure", async () => {
		globalThis.window = globalThis;
		const sentEvents = [];

		globalThis.__TAURI_INTERNALS__ = {
			invoke: async (cmd) => {
				if (cmd === "check_ghost_update") {
					throw new Error("404 not found");
				}
				return null;
			},
			transformCallback: (cb) => cb,
			plugins: {
				event: {
					listeners: {},
					listen: async () => () => {},
					emit: async () => {},
					unregisterListener: () => {},
				},
			},
		};

		const app = {
			...updateMethods,
			ghostController: {
				currentGhost: { name: "TestGhost", path: "/ghost/path" },
				sendShioriEvent: async (evt, args) => {
					sentEvents.push({ evt, args });
					return null;
				},
			},
			showBalloon: () => {},
		};

		await app.startNetworkUpdate(null, { checkOnly: true });

		const failureEvt = sentEvents.find((e) => e.evt === "OnUpdateCheckFailure");
		assert.ok(failureEvt);
		assert.equal(failureEvt.args[0], "404");
	});
});
