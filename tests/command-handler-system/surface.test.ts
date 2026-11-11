import { describe, expect, it } from "vitest";

globalThis.window = globalThis;

import { scriptLifetimeState } from "../../ui/ts/ghost/command-handler/env.js";
import {
	handleGetPropertyCommand,
	handleKeyPressEvent,
	handleSetAlphaCommand,
	handleSetPositionCommand,
	handleSetPropertyCommand,
	handleSetScalingCommand,
} from "../../ui/ts/ghost/command-handler/system/surface.js";

describe("system/surface.js", () => {
	it("handleSetPropertyCommand sets property in scriptLifetimeState", async () => {
		await handleSetPropertyCommand({}, [
			"set",
			"property",
			"testKey",
			"testVal",
		]);
		expect(scriptLifetimeState.getVariable("testKey")).toBe("testVal");
	});

	it("handleSetScalingCommand, handleSetAlphaCommand, handleSetPositionCommand apply to surfaceManager", async () => {
		let scale = null;
		let alpha = null;
		let position = null;

		const handler = {
			player: { currentScope: 1 },
			app: {
				surfaceManager: {
					setScale: (sx, sy, scope) => {
						scale = { sx, sy, scope };
					},
					setAlpha: (val, scope) => {
						alpha = { val, scope };
					},
					setPosition: (x, y, scope) => {
						position = { x, y, scope };
					},
				},
			},
		};

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
		const events = [];
		const handler = {
			app: {
				ghostController: {
					sendShioriEvent: async (name, args) => {
						events.push({ name, args });
						return { response: { value: "mockVal" } };
					},
				},
			},
		};

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
