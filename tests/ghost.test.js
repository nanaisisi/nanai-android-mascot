import assert from "node:assert/strict";
import { test } from "vitest";

import { ghostShioriMethods } from "../ui/js/ghost/ghost-shiori.js";
import { GhostController } from "../ui/js/ghost/ghost.js";
import { parseSakuraScript } from "../ui/js/ghost/sakura-parser.js";
import { fromRustResponse, statusCodeFromRust } from "../ui/js/ghost/shiori-protocol.js";

test("sakura-parser test", () => {
	const ast = parseSakuraScript("\\0Hello\\1World\\e");
	assert.ok(ast);
});

test("shiori-protocol test", () => {
	assert.equal(statusCodeFromRust("Ok"), 200);
	assert.equal(statusCodeFromRust({ Other: 599 }), 599);

	const parsed = fromRustResponse({ status: "Ok", value: "\\0Hello\\e" });
	assert.equal(parsed.status, 200);
	assert.equal(parsed.value, "\\0Hello\\e");
});

test("ghostShioriMethods & GhostController test", async () => {
	const controller = new GhostController({
		showBalloon() {},
		hideBalloon() {},
	});
	assert.ok(controller);

	assert.ok(ghostShioriMethods.initializeGhostSHIORI);
	assert.ok(ghostShioriMethods.sendShioriEvent);
});
