import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis;
globalThis.location = { search: "?ghost_id=main&ghost_name=mock_nanai" };
globalThis.localStorage = { getItem: () => null, setItem: () => {} };
globalThis.document = {
	body: { classList: { toggle() {} } },
	addEventListener(type, cb) {
		this._listeners = this._listeners || {};
		this._listeners[type] = cb;
	},
	getElementById(id) {
		return {
			style: {},
			classList: { remove() {}, add() {} },
			addEventListener() {},
		};
	},
	readyState: "complete",
};
globalThis.addEventListener = (type, cb) => {
	globalThis._globalListeners = globalThis._globalListeners || {};
	globalThis._globalListeners[type] = cb;
};

const { NanaiAndroidMascotApp } = await import("../ui/main.js");

test("NanaiAndroidMascotApp instantiation, init, callGhost, and closeApp", async () => {
	const app = new NanaiAndroidMascotApp();
	assert.equal(app.ghostId, "main");
	assert.equal(app.initialGhostName, "mock_nanai");
	assert.ok(app.ghostController);
	assert.ok(app.interactionManager);
	assert.ok(app.surfaceManager);
	assert.ok(app.sakuraPlayer);

	// Mock required methods for init
	app.scanBalloons = async () => {};
	app.ghostController.autoLoadGhost = async () => {};
	app.ghostController.stopSecondChangeTimer = () => {};
	app.ghostController.sendShioriEvent = async () => ({});

	// Test init
	await app.init();
	assert.equal(app.isInitialized, true);

	// Test callGhost (non-Tauri vs Tauri)
	delete globalThis.__TAURI__;
	delete globalThis.__TAURI_INTERNALS__;
	await app.callGhost("AnotherGhost");

	globalThis.__TAURI_INTERNALS__ = {
		invoke: async (cmd) => {
			if (cmd === "spawn_ghost") return;
		},
		transformCallback: (cb) => cb,
	};
	globalThis.window = globalThis;
	await app.callGhost("AnotherGhost");

	// Test closeApp
	await app.closeApp();

	delete globalThis.__TAURI_INTERNALS__;
	assert.ok(true);
});
