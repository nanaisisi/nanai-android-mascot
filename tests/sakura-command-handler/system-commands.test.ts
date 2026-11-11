import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
	SakuraCommandHandler,
	scriptLifetimeState,
} from "../../ui/ts/ghost/sakura-command-handler.js";
import { createMockApp, setupMockDom } from "./helpers.js";

setupMockDom();

describe("SakuraCommandHandler - System Commands", () => {
	it("handles system properties, positioning, scaling, notify, timers, and dev/config dialogs", async () => {
		const eventsSent = [];
		const mockApp = createMockApp(eventsSent);
		const player = { currentScope: 0, app: mockApp };
		const handler = new SakuraCommandHandler(player);

		// 13. set:property, scaling, alpha, position, shioridebugmode, resetwindowpos, resetballoonpos
		await handler.runCommand(["set", "property", "theme.color", "blue"]);
		assert.equal(scriptLifetimeState.getVariable("theme.color"), "blue");

		await handler.runCommand(["set", "scaling", "150", "150"]);
		assert.ok(
			eventsSent.some(
				(e) => e.ev === "setScale" && e.sx === 150 && e.sy === 150,
			),
		);

		await handler.runCommand(["set", "alpha", "80"]);
		assert.ok(eventsSent.some((e) => e.ev === "setAlpha" && e.alpha === 80));

		// Test alpha clamping
		await handler.runCommand(["set", "alpha", "150"]);
		assert.ok(eventsSent.some((e) => e.ev === "setAlpha" && e.alpha === 100));

		await handler.runCommand(["set", "position", "200", "400", "1"]);
		assert.ok(
			eventsSent.some(
				(e) =>
					e.ev === "setPosition" && e.x === 200 && e.y === 400 && e.scope === 1,
			),
		);

		await handler.runCommand(["set", "shioridebugmode", "true"]);
		assert.equal(mockApp.ghostController.shioriDebugMode, true);

		await handler.runCommand(["execute", "resetwindowpos"]);
		assert.ok(
			eventsSent.some(
				(e) => e.ev === "dispatchAction" && e.action === "reset-shell-position",
			),
		);

		await handler.runCommand(["execute", "resetballoonpos"]);
		assert.ok(
			eventsSent.some(
				(e) =>
					e.ev === "dispatchAction" && e.action === "reset-balloon-position",
			),
		);

		// 14. Cycle 4 features: notify, timerraise/cancel, open configurationdialog/developer/readme
		eventsSent.length = 0;
		await handler.runCommand(["notify", "OnTestNotify", "ref0", "ref1"]);
		assert.ok(
			eventsSent.some(
				(e) =>
					e.ev === "OnTestNotify" &&
					e.args[0] === "ref0" &&
					e.args[1] === "ref1",
			),
		);

		// timerraise one-shot and cancel
		await handler.runCommand([
			"timerraise",
			"10",
			"1",
			"OnTimerTest",
			"timeoutVal",
		]);
		// cancel timer immediately with 0 delay
		await handler.runCommand(["timerraise", "0", "1", "OnTimerTest"]);

		// open targets
		mockApp.modalManager = {
			show(contentId) {
				eventsSent.push({ ev: "modalShow", contentId });
			},
		};
		await handler.runCommand(["open", "configurationdialog", "talk"]);
		assert.ok(
			eventsSent.some(
				(e) => e.ev === "modalShow" && e.contentId === "settings-modal-content",
			),
		);

		await handler.runCommand(["open", "developer"]);
		assert.equal(mockApp.ghostController.shioriDebugMode, true);

		await handler.runCommand(["open", "readme"]);
		await handler.runCommand(["open", "history"]);
	});
});
