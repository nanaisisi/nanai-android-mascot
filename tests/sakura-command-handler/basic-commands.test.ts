import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { SakuraCommandHandler } from "../../ui/ts/ghost/sakura-command-handler.js";
import { createMockApp, setupMockDom } from "./helpers.js";

setupMockDom();

describe("SakuraCommandHandler - Basic Commands", () => {
	it("handles raise, bind, anim, dressup, update, tray/time, and open commands", async () => {
		const eventsSent = [];
		const mockApp = createMockApp(eventsSent);
		const player = { currentScope: 0, app: mockApp };
		const handler = new SakuraCommandHandler(player);

		// 1. raise command
		await handler.runCommand(["raise", "OnCustom", "arg1"]);
		assert.ok(eventsSent.some((e) => e.ev === "OnCustom"));

		// 2. bind and bind-noevent
		await handler.runCommand(["bind", "hat", "ribbon", "1"]);
		await handler.runCommand(["bind-noevent", "hat", "ribbon", "0"]);

		// 3. anim (pause / pouse / resume)
		await handler.runCommand(["anim", "pause", "10"]);
		await handler.runCommand(["anim", "pouse", "10"]);
		await handler.runCommand(["anim", "resume", "10"]);
		await handler.runCommand(["anim", "invalid", "notanumber"]);

		// 4. dressupexplorer
		await handler.runCommand(["open", "dressupexplorer"]);
		assert.equal(mockApp.menuToggled, true);

		// 5. update / updatebymyself
		await handler.runCommand(["update"]);
		await handler.runCommand(["updatebymyself"]);

		// 6. alignmenttodesktop & alignmentondesktop
		await handler.runCommand(["set", "alignmenttodesktop", "free"]);
		await handler.runCommand(["set", "alignmenttodesktop", "bottom"]);
		await handler.runCommand(["set", "alignmentondesktop", "top"]);

		// 6b. choicetimeout / balloontimeout
		await handler.runCommand(["set", "choicetimeout", "5000"]);
		assert.equal(player.choiceTimeout, 5000);
		await handler.runCommand(["set", "balloontimeout", "3000"]);
		assert.equal(player.balloonTimeout, 3000);

		// 6c. tasktrayicon, trayballoon, biff, executesntp
		await handler.runCommand(["set", "tasktrayicon", "tray.ico"]);
		await handler.runCommand(["set", "trayballoon", "Title", "Message"]);
		await handler.runCommand(["biff"]);
		await handler.runCommand(["executesntp"]);
		assert.ok(eventsSent.some((e) => e.ev === "OnSNTPCompare"));

		// 6d. open:explorer, shellexplorer, balloonexplorer, ghostexplorer, file, browser
		await handler.runCommand(["open", "explorer"]);
		await handler.runCommand(["open", "shellexplorer"]);
		await handler.runCommand(["open", "file", "/tmp/test.txt"]);
		await handler.runCommand(["open", "browser", "https://example.com"]);

		// 7. unknown command
		await handler.runCommand(["unknown"]);
	});
});
