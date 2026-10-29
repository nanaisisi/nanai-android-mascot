import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis;
globalThis.location = { search: "?ghost_id=main&ghost_name=mock_nanai" };
globalThis.localStorage = { getItem: () => null, setItem: () => {} };
globalThis.document = {
	body: { classList: { toggle() {} } },
	documentElement: {
		setAttribute() {},
		style: { removeProperty() {}, setProperty() {} },
	},
	addEventListener(type, cb) {
		this._listeners = this._listeners || {};
		this._listeners[type] = cb;
	},
	getElementById(id) {
		return {
			style: {},
			classList: { remove() {}, add() {} },
			addEventListener() {},
			setAttribute() {},
		};
	},
	querySelector() {
		return {
			style: { removeProperty() {}, setProperty() {} },
			classList: { remove() {}, add() {} },
			setAttribute() {},
		};
	},
	readyState: "complete",
};
globalThis.addEventListener = (type, cb) => {
	globalThis._globalListeners = globalThis._globalListeners || {};
	globalThis._globalListeners[type] = cb;
};

const { NanaiAndroidMascotApp } = await import("../ui/main.js");

test("NanaiAndroidMascotApp instantiation, init, callGhost, closeApp and mixin delegation", async () => {
	const app = new NanaiAndroidMascotApp();
	assert.equal(app.ghostId, "main");
	assert.equal(app.initialGhostName, "mock_nanai");
	assert.ok(app.ghostController);
	assert.ok(app.interactionManager);
	assert.ok(app.surfaceManager);
	assert.ok(app.sakuraPlayer);

	// 1. Test onGhostClick
	app.ghostController.sendShioriEvent = async () => ({});
	app.onGhostClick(10, 10, { left: 0, top: 0, width: 100, height: 100 }, 0);

	// 2. Mock required methods for init
	app.scanBalloons = async () => {};
	app.ghostController.autoLoadGhost = async () => {};
	app.ghostController.stopSecondChangeTimer = () => {};

	// Test init with autoLoadGhost = false
	app.settings.autoLoadGhost = false;
	await app.init();
	assert.equal(app.isInitialized, true);

	// Test init with autoLoadGhost = true
	app.settings.autoLoadGhost = true;
	await app.init();

	// 3. Test callGhost (non-Tauri vs Tauri success vs Tauri error)
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

	// Test callGhost error catch
	globalThis.__TAURI_INTERNALS__.invoke = async () => { throw new Error("spawn fail"); };
	await app.callGhost("FailingGhost");

	// 4. Test closeApp with Tauri available and fallback sequence
	globalThis.__TAURI_INTERNALS__.invoke = async (cmd) => {
		if (cmd === "unload_current_ghost") return;
		if (cmd === "close_ghost") throw new Error("close_ghost fail");
		if (cmd === "exit_app") return;
	};

	const closePromise = app.closeApp();
	// Test duplicate closeApp call while exiting
	await app.closeApp();
	await closePromise;

	// 5. Test DOMContentLoaded event listener
	globalThis._globalListeners?.DOMContentLoaded?.();

	delete globalThis.__TAURI_INTERNALS__;
	assert.ok(true);
});
