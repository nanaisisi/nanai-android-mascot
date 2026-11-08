import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { SakuraCommandHandler } from "../../ui/ts/ghost/sakura-command-handler.js";
import { createMockApp, setupMockDom } from "./helpers.js";

setupMockDom();

describe("SakuraCommandHandler - Cycle 10 Extended Commands", () => {
	it("handles load,makoto, unload,makoto, and reload,makoto commands", async () => {
		const makotoActions: { action: string; module: string }[] = [];
		const mockApp = createMockApp([]);
		mockApp.ghostController.loadMakoto = async (moduleName: string) => {
			makotoActions.push({ action: "load", module: moduleName });
		};
		mockApp.ghostController.unloadMakoto = async (moduleName: string) => {
			makotoActions.push({ action: "unload", module: moduleName });
		};
		mockApp.ghostController.reloadMakoto = async (moduleName: string) => {
			makotoActions.push({ action: "reload", module: moduleName });
		};

		const player = { currentScope: 0, app: mockApp };
		const handler = new SakuraCommandHandler(player);

		// 1. load:makoto
		await handler.runCommand(["load", "makoto", "my_makoto.dll"]);
		assert.equal(makotoActions.length, 1);
		assert.deepEqual(makotoActions[0], {
			action: "load",
			module: "my_makoto.dll",
		});

		// 2. unload:makoto
		await handler.runCommand(["unload", "makoto", "my_makoto.dll"]);
		assert.equal(makotoActions.length, 2);
		assert.deepEqual(makotoActions[1], {
			action: "unload",
			module: "my_makoto.dll",
		});

		// 3. reload:makoto
		await handler.runCommand(["reload", "makoto", "my_makoto.dll"]);
		assert.equal(makotoActions.length, 3);
		assert.deepEqual(makotoActions[2], {
			action: "reload",
			module: "my_makoto.dll",
		});
	});

	it("handles open,aigraph and reload,aigraph commands", async () => {
		let aigraphOpened = false;
		let aigraphReloaded = false;
		const mockApp = createMockApp([]);
		mockApp.ghostController.openAigraph = async () => {
			aigraphOpened = true;
		};
		mockApp.ghostController.reloadAigraph = async () => {
			aigraphReloaded = true;
		};

		const player = { currentScope: 0, app: mockApp };
		const handler = new SakuraCommandHandler(player);

		// 1. open,aigraph
		await handler.runCommand(["open", "aigraph"]);
		assert.equal(aigraphOpened, true);

		// 2. reload,aigraph
		await handler.runCommand(["reload", "aigraph"]);
		assert.equal(aigraphReloaded, true);
	});
});
