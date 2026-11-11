import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { SakuraCommandHandler } from "../../ui/ts/ghost/sakura-command-handler.js";
import { createMockApp, setupMockDom } from "./helpers.js";

setupMockDom();

describe("SakuraCommandHandler - Dialog Commands", () => {
	it("handles open and close commands for extended modal dialogs", async () => {
		const eventsSent = [];
		const mockApp = createMockApp(eventsSent);
		const player = { currentScope: 0, app: mockApp };
		const handler = new SakuraCommandHandler(player);

		// 12. open passwordinput, textareabox, sliderinput & close dialogs
		await handler.runCommand([
			"open",
			"passwordinput",
			"PassID",
			"--timeout=100",
			"--text=secret",
		]);
		assert.ok(eventsSent.some((e) => e.ev === "openPasswordInput"));

		await handler.runCommand([
			"open",
			"textareabox",
			"TextAreaID",
			"--timeout=100",
			"--text=multiline",
		]);
		assert.ok(eventsSent.some((e) => e.ev === "openTextAreaBox"));

		await handler.runCommand([
			"open",
			"sliderinput",
			"SliderID",
			"--timeout=100",
			"--min=0",
			"--max=100",
			"--default=50",
		]);
		assert.ok(eventsSent.some((e) => e.ev === "openSliderInput"));

		// Targeted close commands
		await handler.runCommand(["close", "inputbox", "PassID"]);
		assert.ok(
			eventsSent.some((e) => e.ev === "closeInputBox" && e.id === "PassID"),
		);

		await handler.runCommand(["close", "textareabox", "TextAreaID"]);
		assert.ok(
			eventsSent.some(
				(e) => e.ev === "closeTextAreaBox" && e.id === "TextAreaID",
			),
		);

		await handler.runCommand(["close", "dialog", "SliderID"]);
		assert.ok(
			eventsSent.some((e) => e.ev === "closeDialog" && e.id === "SliderID"),
		);
	});
});
