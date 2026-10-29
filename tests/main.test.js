import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis;
globalThis.close = function () {
	this.closed = true;
};
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
	getElementById(_id) {
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
		delete globalThis.__TAURI__;
		delete globalThis.window.__TAURI__;
		const invokedCmds = [];
		globalThis.__TAURI_INTERNALS__ = createTauriInternals(async (cmd, args) => {
			invokedCmds.push({ cmd, args });
		});

		await app.callGhost("Ghost2");
		assert.ok(
			invokedCmds.some(
				(c) => c.cmd === "spawn_ghost" && c.args.ghostName === "Ghost2",
			),
		);

		// 3. Tauri environment error
		delete globalThis.__TAURI__;
		delete globalThis.window.__TAURI__;
		globalThis.__TAURI_INTERNALS__ = createTauriInternals(async (cmd) => {
			if (cmd.startsWith("plugin:event|")) return 1;
			throw new Error("spawn_ghost error");
		});
		await app.callGhost("Ghost3");
	} finally {
		NanaiAndroidMascotApp.prototype.init = origInit;
		delete globalThis.__TAURI__;
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
		delete globalThis.__TAURI__;
		delete globalThis.window.__TAURI__;
		globalThis.__TAURI_INTERNALS__ = createTauriInternals(async (cmd) => {
			if (cmd.startsWith("plugin:event|")) return 1;
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
			sendShioriEvent: async () => {
				throw new Error("OnClose error");
			},
		};
		app2.sakuraPlayer = { isPlaying: true };

		const cmds2 = [];
		let windowClosed = false;
		globalThis.close = () => {
			windowClosed = true;
		};
		delete globalThis.__TAURI__;
		delete globalThis.window.__TAURI__;
		globalThis.__TAURI_INTERNALS__ = createTauriInternals(async (cmd) => {
			if (cmd.startsWith("plugin:event|")) return 1;
			cmds2.push(cmd);
			throw new Error(`${cmd} error`);
		});

		await app2.closeApp();
		await app2.closeApp(); // _isExiting early return
		await new Promise((r) => setTimeout(r, 1550));
		assert.ok(cmds2.includes("unload_current_ghost"));
		assert.ok(cmds2.includes("close_ghost"));
		assert.ok(cmds2.includes("exit_app"));
		assert.equal(windowClosed, true);

		// 3. exit_app success & hideMenu error catch(_err)
		delete globalThis.__TAURI__;
		delete globalThis.window.__TAURI__;
		delete globalThis.__TAURI_INTERNALS__;
		const app3 = new NanaiAndroidMascotApp();
		app3.hideMenu = () => {
			throw new Error("hideMenu error");
		};
		const cmds3 = [];
		globalThis.__TAURI_INTERNALS__ = createTauriInternals(async (cmd) => {
			if (cmd.startsWith("plugin:event|")) return 1;
			cmds3.push(cmd);
			if (cmd === "exit_app") return;
			throw new Error(`${cmd} error`);
		});
		await app3.closeApp();
		await new Promise((r) => setTimeout(r, 50));
		assert.ok(cmds3.includes("exit_app"));
	} finally {
		NanaiAndroidMascotApp.prototype.init = origInit;
		delete globalThis.__TAURI__;
		delete globalThis.__TAURI_INTERNALS__;
	}
});

test("NanaiAndroidMascotApp initialization and mixin delegation", async () => {
	delete globalThis.__TAURI__;
	delete globalThis.__TAURI_INTERNALS__;
	const app = new NanaiAndroidMascotApp();
	assert.equal(app.ghostId, "main");
	assert.equal(app.initialGhostName, "mock_nanai");

	app.ghostController.sendShioriEvent = async () => ({});
	app.onGhostClick(10, 10, { left: 0, top: 0, width: 100, height: 100 }, 0);
	// Direct call to original class method onGhostClick before/aside from Object.assign override
	const origEventOnGhostClick = Object.getOwnPropertyDescriptor(
		NanaiAndroidMascotApp.prototype,
		"onGhostClick",
	);
	assert.ok(origEventOnGhostClick);

	app.scanBalloons = async () => {};
	app.ghostController.autoLoadGhost = async () => {};
	app.ghostController.stopSecondChangeTimer = () => {};

	app.settings.autoLoadGhost = false;
	await app.init();
	assert.equal(app.isInitialized, true);

	app.settings.autoLoadGhost = true;
	await app.init();

	globalThis.__TAURI_INTERNALS__ = createTauriInternals(async () => 1);
	app.initUIEnvironment();
	delete globalThis.__TAURI_INTERNALS__;

	globalThis._globalListeners?.DOMContentLoaded?.();

	assert.ok(true);
});
