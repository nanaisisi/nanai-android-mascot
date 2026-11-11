import { describe, expect, it } from "vitest";

globalThis.window = globalThis;

import {
	handleReloadShiori,
	handleSetShioriDebugMode,
} from "../../ui/ts/ghost/command-handler/system/shiori.js";

describe("system/shiori.js", () => {
	it("handleSetShioriDebugMode updates ghostController", async () => {
		const handler = {
			app: {
				ghostController: {
					shioriDebugMode: false,
				},
			},
		};

		await handleSetShioriDebugMode(handler, ["set", "shioridebugmode", "true"]);
		expect(handler.app.ghostController.shioriDebugMode).toBe(true);

		await handleSetShioriDebugMode(handler, [
			"set",
			"shioridebugmode",
			"false",
		]);
		expect(handler.app.ghostController.shioriDebugMode).toBe(false);
	});

	it("handleReloadShiori reloads current ghost SHIORI", async () => {
		let reloadedGhost = null;
		const ghost = { name: "TestGhost" };
		const handler = {
			app: {
				ghostController: {
					currentGhost: ghost,
					initializeGhostSHIORI: async (g) => {
						reloadedGhost = g;
					},
				},
			},
		};

		await handleReloadShiori(handler, ["reload", "shiori"]);
		expect(reloadedGhost).toBe(ghost);
	});
});
