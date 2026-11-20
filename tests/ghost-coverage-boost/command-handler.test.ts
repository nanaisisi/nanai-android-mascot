import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { SakuraCommandHandler } from "../../ui/ts/ghost/sakura-command-handler.js";
import type { SakuraScriptPlayer } from "../../ui/ts/ghost/sakura-script.js";

describe("SakuraCommandHandler methods & lifecycle", () => {
	it("exercises openInputBox, teachBox, communicateBox, alignment, windowState, and jump", async () => {
		globalThis.document = {
			createElement: () =>
				({
					style: {},
					appendChild: () => {},
					addEventListener: () => {},
					remove: () => {},
					focus: () => {},
				}) as unknown as HTMLElement,
		} as unknown as Document;
		const modalCalls: { method: string; opts?: unknown; cancel?: unknown }[] =
			[];
		const mockPlayer = {
			currentScope: 0,
			app: {
				elements: {
					balloonText: { appendChild: () => {}, innerHTML: "" },
					keroBalloonText: { appendChild: () => {}, innerHTML: "" },
				},
				modalDialogController: {
					openInputBox: (opts: unknown) =>
						modalCalls.push({ method: "inputbox", opts }),
					openTeachBox: (opts: unknown) =>
						modalCalls.push({ method: "teachbox", opts }),
					openCommunicateBox: (opts: unknown) =>
						modalCalls.push({ method: "communicatebox", opts }),
					closeTeachBox: () => modalCalls.push({ method: "closeTeachBox" }),
					closeCommunicateBox: (cancel: unknown) =>
						modalCalls.push({ method: "closeCommunicateBox", cancel }),
				},
				ghostController: {
					username: "Alice",
					currentGhost: { name: "Nanai" },
					sendShioriEvent: async () => {},
					lastGhostName: "OldNanai",
					lastObjectName: "Obj1",
				},
			},
		};

		const handler = new SakuraCommandHandler(
			mockPlayer as unknown as SakuraScriptPlayer,
		);

		// 1. Box methods
		handler.openInputBox(["id1", "--text=hello"]);
		handler.openTeachBox(["word1", "--text=sample"], { title: "Teach" });
		assert.ok(handler.teachForm != null);
		handler.closeTeachBox();
		assert.strictEqual(handler.teachForm, null);

		handler.openCommunicateBox(["prompt1"]);
		assert.ok(handler.communicateForm != null);
		handler.closeCommunicateBox(true);
		assert.strictEqual(handler.communicateForm, null);

		assert.ok(modalCalls.some((c) => c.method === "inputbox"));

		// 2. setAlignmentToDesktop
		await handler.setAlignmentToDesktop("bottom");

		// 3. handleWindowState
		await handler.handleWindowState("minimize");

		// 4. handleJump
		await handler.handleJump("raise", ["OnCustomJump", "ref1"]);

		// 5. expandEnv
		const expanded = handler.expandEnv("Hello %username, I am %selfname");
		assert.strictEqual(expanded, "Hello Alice, I am Nanai");

		// 6. resetLifetimeState
		handler.resetLifetimeState();
	});
});
