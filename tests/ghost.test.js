import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis;
globalThis.localStorage = { getItem: () => null, setItem: () => {} };
globalThis.document = {
	getElementById: () => ({ style: {}, textContent: "" }),
};

import { GhostController } from "../ui/js/ghost/ghost.js";
import { ghostShioriMethods } from "../ui/js/ghost/ghost-shiori.js";
import { parseSakuraScript } from "../ui/js/ghost/sakura-parser.js";
import {
	fromRustResponse,
	statusCodeFromRust,
} from "../ui/js/ghost/shiori-protocol.js";

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

test("ghostShioriMethods & GhostController full methods test", async () => {
	const mockApp = {
		initialGhostName: null,
		recordRecentGhost() {},
		setBalloonTheme() {},
		syncMenuGhosts() {},
		settings: { autoSwitchBalloonWithGhost: true },
		surfaceManager: {
			loadSurfacesTxt: async () => {},
		},
	};

	const controller = new GhostController(mockApp);
	controller.updateGhostCharacter = async () => {};
	controller.initializeGhostSHIORI = async () => {};
	controller.updateSurface = () => {};
	controller.sendShioriEvent = async () => {};

	// 1. autoLoadGhost non-Tauri
	delete globalThis.__TAURI__;
	delete globalThis.__TAURI_INTERNALS__;
	await controller.autoLoadGhost();
	assert.ok(controller.currentGhost);

	// 2. autoLoadGhost with initialGhostName
	mockApp.initialGhostName = "GhostA";
	controller.ghosts = [{ name: "GhostA", path: "/a", shells: [{ name: "master" }] }];
	await controller.autoLoadGhost();
	assert.equal(controller.currentGhost.name, "GhostA");

	// 3. verifyGhostExists
	assert.equal(await controller.verifyGhostExists({ name: "GhostA" }), false);

	// 4. scanGhosts & verifyGhostExists with Tauri
	globalThis.__TAURI_INTERNALS__ = {
		invoke: async (cmd) => {
			if (cmd === "scan_ghosts") {
				return {
					ghosts: [
						{ name: "GhostB", path: "/b" },
						{ name: "GhostA", path: "/a" },
					],
				};
			}
			if (cmd === "record_ghost_loaded") return;
			if (cmd === "show_loading_banner_window") return;
		},
		transformCallback: (cb) => cb,
	};
	globalThis.window = globalThis;

	const exists = await controller.verifyGhostExists({ name: "GhostA" });
	assert.equal(exists, true);

	const scanned = await controller.scanGhosts();
	assert.equal(scanned.length, 2);

	await controller.scanAndLoadFirstGhost();
	assert.equal(controller.currentGhost.name, "GhostB");

	// 5. selectShell
	controller.selectShell("alt_shell");
	assert.equal(controller.currentShell, "alt_shell");

	// 6. scanGhosts error catch
	globalThis.__TAURI_INTERNALS__.invoke = async () => { throw new Error("scan fail"); };
	await controller.scanGhosts();
	await controller.scanAndLoadFirstGhost();

	delete globalThis.__TAURI_INTERNALS__;
	assert.ok(true);
});
