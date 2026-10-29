import assert from "node:assert/strict";
import { test } from "vitest";

const { shioriNotifyMethods } = await import("../ui/js/ghost/shiori-notify.js");

test("shioriNotifyMethods covers sendShioriNotify and sendBootNotifyEvents", async () => {
	const calls = [];
	const controller = {
		...shioriNotifyMethods,
		app: { ghostId: "main" },
		currentGhost: {
			name: "Ghost1",
			sakura_name: "Sakura1",
			kero_name: "Kero1",
			path: "/assets/ghost/ghost1",
		},
		ghosts: [
			{
				name: "Ghost1",
				sakura_name: "Sakura1",
				kero_name: "Kero1",
				path: "/assets/ghost/ghost1",
			},
			{
				name: "Ghost2",
				sakura_name: "Sakura2",
				kero_name: "",
				path: "/assets/ghost/ghost2",
			},
		],
		shells: ["master", "alt"],
	};

	// 1. Non-Tauri environment (sendShioriNotify / sendBootNotifyEvents)
	delete globalThis.__TAURI__;
	delete globalThis.__TAURI_INTERNALS__;
	const res1 = await controller.sendShioriNotify("test", [1, 2]);
	assert.equal(res1, null);
	await controller.sendBootNotifyEvents();

	// 2. Tauri environment
	globalThis.__TAURI_INTERNALS__ = {
		invoke: async (cmd, args) => {
			calls.push({ cmd, args });
			if (cmd === "send_shiori_notify") return "ok";
		},
		transformCallback: (cb) => cb,
	};
	globalThis.window = globalThis;

	calls.length = 0;
	await controller.sendShioriNotify("test", [10, "abc"]);
	assert.equal(calls.length, 1);
	assert.equal(calls[0].args.references[0], "10");

	// 3. sendBootNotifyEvents with full ghost/shell metadata
	calls.length = 0;
	await controller.sendBootNotifyEvents();
	assert.ok(calls.some((c) => c.args.event === "installedghostname"));
	assert.ok(calls.some((c) => c.args.event === "installedkeroname"));
	assert.ok(calls.some((c) => c.args.event === "installedshellname"));
	assert.ok(calls.some((c) => c.args.event === "ghostpathlist"));
	assert.ok(calls.some((c) => c.args.event === "basewareversion"));
	assert.ok(calls.some((c) => c.args.event === "uniqueid"));

	// 4. sendShioriNotify with invoke error (catch branch)
	globalThis.__TAURI_INTERNALS__.invoke = async () => {
		throw new Error("Notify fail");
	};
	const res2 = await controller.sendShioriNotify("fail_event", [1]);
	assert.equal(res2, null);

	delete globalThis.__TAURI_INTERNALS__;
	assert.ok(true);
});
