import { describe, expect, it } from "vitest";

globalThis.window = globalThis as unknown as Window & typeof globalThis;

import { scriptLifetimeState } from "../../ui/ts/ghost/command-handler/env.js";
import {
	handleGetPropertyCommand,
	handleKeyPressEvent,
	handleSetAlphaCommand,
	handleSetPositionCommand,
	handleSetPropertyCommand,
	handleSetScalingCommand,
} from "../../ui/ts/ghost/command-handler/system/surface.js";
import type { SakuraCommandHandler } from "../../ui/ts/ghost/sakura-command-handler.js";

describe("system/surface.js", () => {
	it("handleSetPropertyCommand sets property in scriptLifetimeState", async () => {
		await handleSetPropertyCommand({} as unknown as SakuraCommandHandler, [
			"set",
			"property",
			"testKey",
			"testVal",
		]);
		expect(scriptLifetimeState.getVariable("testKey")).toBe("testVal");
	});

	it("handleSetScalingCommand, handleSetAlphaCommand, handleSetPositionCommand apply to surfaceManager", async () => {
		let scale: { sx: number; sy: number; scope: number } | null = null;
		let alpha: { val: number; scope: number } | null = null;
		let position: { x: number; y: number; scope: number } | null = null;

		const handler = {
			player: { currentScope: 1 },
			app: {
				surfaceManager: {
					setScale: (sx: number, sy: number, scope: number) => {
						scale = { sx, sy, scope };
					},
					setAlpha: (val: number, scope: number) => {
						alpha = { val, scope };
					},
					setPosition: (x: number, y: number, scope: number) => {
						position = { x, y, scope };
					},
				},
			},
		} as unknown as SakuraCommandHandler;

		await handleSetScalingCommand(handler, ["set", "scaling", "120", "120"]);
		expect(scale).toEqual({ sx: 120, sy: 120, scope: 1 });

		await handleSetAlphaCommand(handler, ["set", "alpha", "80"]);
		expect(alpha).toEqual({ val: 80, scope: 1 });

		await handleSetPositionCommand(handler, [
			"set",
			"position",
			"50",
			"60",
			"0",
		]);
		expect(position).toEqual({ x: 50, y: 60, scope: 0 });
	});

	it("handleGetPropertyCommand and handleKeyPressEvent dispatch SHIORI events", async () => {
		const events: Array<{ name: string; args: string[] }> = [];
		const handler = {
			app: {
				ghostController: {
					sendShioriEvent: async (name: string, args: string[]) => {
						events.push({ name, args });
						return { response: { value: "mockVal" } };
					},
				},
			},
		} as unknown as SakuraCommandHandler;

		const propVal = await handleGetPropertyCommand(handler, "test.prop");
		expect(propVal).toBe("mockVal");
		expect(events.some((e) => e.name === "property.get")).toBe(true);

		await handleKeyPressEvent(handler, "A", "ctrl");
		expect(
			events.some(
				(e) =>
					e.name === "OnKeyPress" && e.args[0] === "A" && e.args[1] === "ctrl",
			),
		).toBe(true);
	});
});
