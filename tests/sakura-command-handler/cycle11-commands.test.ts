import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
	SakuraCommandHandler,
	scriptLifetimeState,
} from "../../ui/ts/ghost/sakura-command-handler.js";
import { createMockApp, setupMockDom } from "./helpers.js";

setupMockDom();

describe("SakuraCommandHandler - Cycle 11 Extended Commands", () => {
	it("handles get,property command and emits event with resolved property values", async () => {
		const eventsSent: Array<{ ev: string; args: unknown[] }> = [];
		const mockApp = createMockApp(eventsSent);

		// Mock evaluateProperty on ghostController
		mockApp.ghostController.evaluateProperty = async (prop: string) => {
			if (prop === "baseware.name") return "NanaiSSP";
			if (prop === "currentghost.name") return "SakuraGhost";
			return null;
		};

		const player = { currentScope: 0, app: mockApp };
		const handler = new SakuraCommandHandler(player);

		scriptLifetimeState.setVariable("custom.temp", "customValue");

		// Run \![get,property,OnPropertyResult,baseware.name,currentghost.name,custom.temp]
		await handler.runCommand([
			"get",
			"property",
			"OnPropertyResult",
			"baseware.name",
			"currentghost.name",
			"custom.temp",
		]);

		const emitted = eventsSent.find((e) => e.ev === "OnPropertyResult");
		assert.ok(emitted, "OnPropertyResult event should be emitted");
		assert.deepEqual(emitted.args, ["NanaiSSP", "SakuraGhost", "customValue"]);
	});

	it("falls back to property.get SHIORI event if evaluateProperty is unavailable", async () => {
		const eventsSent: Array<{ ev: string; args: unknown[] }> = [];
		const mockApp = createMockApp(eventsSent);

		mockApp.ghostController.sendShioriEvent = async (
			ev: string,
			args: unknown[],
		) => {
			eventsSent.push({ ev, args });
			if (ev === "property.get") {
				const prop = args[0];
				return { response: { value: `val_${prop}` } };
			}
			return { response: { value: "" } };
		};

		const player = { currentScope: 0, app: mockApp };
		const handler = new SakuraCommandHandler(player);

		await handler.runCommand([
			"get",
			"property",
			"OnPropReturn",
			"prop1",
			"prop2",
		]);

		const emitted = eventsSent.find((e) => e.ev === "OnPropReturn");
		assert.ok(emitted, "OnPropReturn should be emitted");
		assert.deepEqual(emitted.args, ["val_prop1", "val_prop2"]);
	});

	it("handles lifetime state inspections and null/undefined resilience", () => {
		scriptLifetimeState.reset();
		assert.equal(scriptLifetimeState.getVariable("none"), undefined);
		assert.equal(scriptLifetimeState.hasVariable("none"), false);

		scriptLifetimeState.setVariable("key1", "val1");
		assert.equal(scriptLifetimeState.hasVariable("key1"), true);
		assert.equal(scriptLifetimeState.getVariable("key1"), "val1");
		assert.deepEqual(scriptLifetimeState.getAllVariables(), { key1: "val1" });

		assert.equal(scriptLifetimeState.deleteVariable("key1"), true);
		assert.equal(scriptLifetimeState.hasVariable("key1"), false);

		// Safe handling of null/undefined
		scriptLifetimeState.setVariable(null, "val");
		scriptLifetimeState.setVariable(undefined, "val");
		assert.equal(scriptLifetimeState.getVariable(null), undefined);
		assert.equal(scriptLifetimeState.getVariable(undefined), undefined);

		// Mode inspection
		scriptLifetimeState.setMode("passiveMode", true);
		assert.equal(scriptLifetimeState.hasMode("passivemode"), true);
		assert.deepEqual(scriptLifetimeState.getModes(), ["passivemode"]);
		scriptLifetimeState.clearModes();
		assert.equal(scriptLifetimeState.hasMode("passivemode"), false);
	});
});
