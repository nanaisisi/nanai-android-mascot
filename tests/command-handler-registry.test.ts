import { describe, expect, it } from "vitest";

import { handleJumpCommand } from "../ui/ts/ghost/command-handler/jump.js";
import {
	getCommandHandler,
	normalizeCommandKey,
	registerCommandHandler,
	unregisterCommandHandler,
} from "../ui/ts/ghost/command-handler/registry.js";
import { SakuraCommandHandler } from "../ui/ts/ghost/sakura-command-handler.js";

describe("CommandHandlerMap & Registry", () => {
	it("normalizes command keys properly", () => {
		expect(normalizeCommandKey("OPEN", "INPUTBOX")).toBe("open:inputbox");
		expect(normalizeCommandKey("RAISE")).toBe("raise");
		expect(normalizeCommandKey("   close ", " teachbox ")).toBe(
			"close:teachbox",
		);
	});

	it("registers, gets, and unregisters handlers", () => {
		const dummyHandler = () => "custom";
		registerCommandHandler("test:custom", dummyHandler);

		expect(getCommandHandler("test", "custom")).toBe(dummyHandler);
		expect(getCommandHandler("TEST:CUSTOM")).toBe(dummyHandler);

		const unregistered = unregisterCommandHandler("test", "custom");
		expect(unregistered).toBe(true);
		expect(getCommandHandler("test", "custom")).toBeUndefined();
	});

	it("throws if registering non-function handler", () => {
		expect(() => {
			// @ts-expect-error test invalid type
			registerCommandHandler("invalid", "not-a-func");
		}).toThrow(TypeError);
	});

	it("dispatches custom commands via SakuraCommandHandler", async () => {
		let executed = false;
		let receivedArgs = [];

		registerCommandHandler("plugin:myfeature", (_handler, args) => {
			executed = true;
			receivedArgs = args;
		});

		const dummyApp = { ghostController: {} };
		const player = { currentScope: 0, app: dummyApp };
		const cmdHandler = new SakuraCommandHandler(player);

		await cmdHandler.runCommand(["plugin", "myfeature", "arg1", "arg2"]);
		expect(executed).toBe(true);
		expect(receivedArgs).toEqual(["plugin", "myfeature", "arg1", "arg2"]);

		unregisterCommandHandler("plugin:myfeature");
	});
});

describe("Jump command handler (\\j[...])", () => {
	it("opens external URL via globalThis.open", async () => {
		const originalOpen = globalThis.open;
		let openedUrl = "";
		let openedTarget = "";

		globalThis.open = (url, target) => {
			openedUrl = url;
			openedTarget = target;
			return null;
		};

		try {
			const dummyHandler = { app: {} };
			await handleJumpCommand(dummyHandler, "https://example.com/ghost/update");
			expect(openedUrl).toBe("https://example.com/ghost/update");
			expect(openedTarget).toBe("_blank");
		} finally {
			globalThis.open = originalOpen;
		}
	});

	it("dispatches On-event jump to SHIORI", async () => {
		const events = [];
		const dummyHandler = {
			app: {
				ghostController: {
					sendShioriEvent: async (ev, args) => {
						events.push({ ev, args });
					},
				},
			},
		};

		await handleJumpCommand(dummyHandler, "OnMyCustomJump", ["ref0", "ref1"]);
		expect(events.length).toBe(1);
		expect(events[0]).toEqual({
			ev: "OnMyCustomJump",
			args: ["ref0", "ref1"],
		});
	});

	it("dispatches choice label jump via OnChoiceSelect", async () => {
		const events = [];
		const dummyHandler = {
			app: {
				ghostController: {
					sendShioriEvent: async (ev, args) => {
						events.push({ ev, args });
					},
				},
			},
		};

		await handleJumpCommand(dummyHandler, "label_entry_point", ["arg1"]);
		expect(events.length).toBe(1);
		expect(events[0]).toEqual({
			ev: "OnChoiceSelect",
			args: ["label_entry_point", "arg1"],
		});
	});

	it("ignores empty jump target", async () => {
		const dummyHandler = { app: {} };
		await handleJumpCommand(dummyHandler, "");
		await handleJumpCommand(dummyHandler, null);
	});
});
