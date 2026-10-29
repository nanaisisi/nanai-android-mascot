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

const createTauriInternals = (invokeFn) => ({
	metadata: { currentWindow: { label: "main" } },
	invoke: invokeFn || (async () => {}),
	transformCallback: (cb) => cb,
	plugins: {
		event: {
			listen: async () => () => {},
			emit: async () => {},
		},
	},
});

const { NanaiAndroidMascotApp } = await import("../ui/main.js");

test("NanaiAndroidMascotApp callGhost (lines 85-87) covers success and error branches", async () => {
	const origInit = NanaiAndroidMascotApp.prototype.init;
	NanaiAndroidMascotApp.prototype.init = async () => {};

	try {
		const app = new NanaiAndroidMascotApp();

		// 1. Non-Tauri environment
		delete globalThis.__TAURI__;
		delete globalThis.__TAURI_INTERNALS__;
		await app.callGhost("Ghost1");

		// 2. Tauri environment success
		const invokedCmds = [];
		globalThis.__TAURI_INTERNALS__ = createTauriInternals(async (cmd, args) => {
			invokedCmds.push({ cmd, args });
		});

		await app.callGhost("Ghost2");
		assert.ok(invokedCmds.some((c) => c.cmd === "spawn_ghost" && c.args.ghostName === "Ghost2"));

		// 3. Tauri environment error
		globalThis.__TAURI_INTERNALS__ = createTauriInternals(async () => {
			throw new Error("spawn_ghost error");
		});
		await app.callGhost("Ghost3");
	} finally {
		NanaiAndroidMascotApp.prototype.init = origInit;
		delete globalThis.__TAURI_INTERNALS__;
	}
});

test("NanaiAndroidMascotApp closeApp (lines 164-183) covers all exit fallbacks and isPlaying state", async () => {
	const origInit = NanaiAndroidMascotApp.prototype.init;
	NanaiAndroidMascotApp.prototype.init = async () => {};

	try {
		// 1. Normal exit with close_ghost success
		const app1 = new NanaiAndroidMascotApp();
		app1.hideMenu = () => {};
		app1.modalManager = { hide: () => {} };
		app1.ghostController = {
			stopSecondChangeTimer: () => {},
			sendShioriEvent: async () => ({}),
		};
		app1.sakuraPlayer = { isPlaying: false };

		const cmds1 = [];
		globalThis.__TAURI_INTERNALS__ = createTauriInternals(async (cmd) => {
			cmds1.push(cmd);
			if (cmd === "unload_current_ghost") return;
			if (cmd === "close_ghost") return;
		});

		await app1.closeApp();
		await new Promise((r) => setTimeout(r, 450));
		assert.ok(cmds1.includes("unload_current_ghost"));
		assert.ok(cmds1.includes("close_ghost"));

		// 2. Exit with unload_current_ghost error, close_ghost error, exit_app error -> window.close fallback
		const app2 = new NanaiAndroidMascotApp();
		app2.hideMenu = () => {};
		app2.modalManager = { hide: () => {} };
		app2.ghostController = {
			stopSecondChangeTimer: () => {},
			sendShioriEvent: async () => { throw new Error("OnClose error"); },
		};
		app2.sakuraPlayer = { isPlaying: true };

		const cmds2 = [];
		let windowClosed = false;
		globalThis.close = () => { windowClosed = true; };
		globalThis.__TAURI_INTERNALS__ = createTauriInternals(async (cmd) => {
			cmds2.push(cmd);
			throw new Error(`${cmd} error`);
		});

		await app2.closeApp();
		await new Promise((r) => setTimeout(r, 1550));
		assert.ok(cmds2.includes("unload_current_ghost"));
		assert.ok(cmds2.includes("close_ghost"));
		assert.ok(cmds2.includes("exit_app"));
		assert.equal(windowClosed, true);
	} finally {
		NanaiAndroidMascotApp.prototype.init = origInit;
		delete globalThis.__TAURI_INTERNALS__;
	}
});

test("NanaiAndroidMascotApp initialization and mixin delegation", async () => {
	delete globalThis.__TAURI_INTERNALS__;
	const app = new NanaiAndroidMascotApp();
	assert.equal(app.ghostId, "main");
	assert.equal(app.initialGhostName, "mock_nanai");

	app.ghostController.sendShioriEvent = async () => ({});
	app.onGhostClick(10, 10, { left: 0, top: 0, width: 100, height: 100 }, 0);

	app.scanBalloons = async () => {};
	app.ghostController.autoLoadGhost = async () => {};
	app.ghostController.stopSecondChangeTimer = () => {};

	app.settings.autoLoadGhost = false;
	await app.init();
	assert.equal(app.isInitialized, true);

	app.settings.autoLoadGhost = true;
	await app.init();

	globalThis._globalListeners?.DOMContentLoaded?.();

	assert.ok(true);
});
