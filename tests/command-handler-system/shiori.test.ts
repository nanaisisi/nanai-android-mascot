import { describe, expect, it } from "vitest";

globalThis.window = globalThis as unknown as Window & typeof globalThis;

import {
	handleReloadShiori,
	handleSetShioriDebugMode,
} from "../../ui/ts/ghost/command-handler/system/shiori.js";
import type { SakuraCommandHandler } from "../../ui/ts/ghost/sakura-command-handler.js";

describe("system/shiori.js", () => {
	it("handleSetShioriDebugMode updates ghostController", async () => {
		const handler = {
			app: {
				ghostController: {
					shioriDebugMode: false,
				},
			},
		} as unknown as SakuraCommandHandler;

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
		let reloadedGhost: { name: string } | null = null;
		const ghost = { name: "TestGhost" };
		const handler = {
			app: {
				ghostController: {
					currentGhost: ghost,
					initializeGhostSHIORI: async (g: { name: string }) => {
						reloadedGhost = g;
					},
				},
			},
		} as unknown as SakuraCommandHandler;

		await handleReloadShiori(handler, ["reload", "shiori"]);
		expect(reloadedGhost).toBe(ghost);
	});
});
