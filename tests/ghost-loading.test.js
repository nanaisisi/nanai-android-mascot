import assert from "node:assert/strict";
import { test } from "node:test";

const deferred = () => {
	let resolve;
	const promise = new Promise((r) => { resolve = r; });
	return { promise, resolve };
};

const calls = [];
let showGate;
let hideGate;
globalThis.window = globalThis;
globalThis.__TAURI_INTERNALS__ = {
	transformCallback: () => 0,
	invoke: async (cmd) => {
		calls.push(cmd);
		if (cmd === "show_loading_banner_window") await showGate?.promise;
		if (cmd === "hide_loading_banner_window") await hideGate?.promise;
		return null;
	},
};
globalThis.localStorage = { setItem() {}, getItem: () => null };
globalThis.document = { getElementById: () => null, querySelector: () => null };

const { GhostController } = await import("../ui/js/ghost/ghost.js");

function setup() {
	calls.length = 0;
	showGate = deferred();
	hideGate = deferred();
	const assets = deferred();
	const app = {
		surfaceManager: { loadSurfacesTxt: () => assets.promise },
		settings: { autoSwitchBalloonWithGhost: false },
	};
	const gc = new GhostController(app);
	gc.ghosts = [{ name: "g", path: "ghost/g" }];
	gc.updateGhostCharacter = async () => {};
	gc.sendShioriEvent = async (event) => { calls.push(event); };
	gc.startSecondChangeTimer = () => {};
	return { gc, assets };
}

test("boot waits for assets and for banner to finish hiding", async () => {
	const { gc, assets } = setup();
	const starting = gc.selectGhost("g");
	assets.resolve();
	await new Promise((r) => setImmediate(r));
	assert.equal(calls.includes("OnBoot"), false);
	showGate.resolve();
	await new Promise((r) => setImmediate(r));
	assert.equal(calls.includes("OnBoot"), false);
	assert.equal(calls.includes("hide_loading_banner_window"), true);
	hideGate.resolve();
	await starting;
	assert.ok(calls.indexOf("hide_loading_banner_window") < calls.indexOf("OnBoot"));
});

test("automatic startup waits until selected ghost is ready", async () => {
	for (const initialGhostName of ["g", undefined]) {
		const { gc } = setup();
		gc.app.initialGhostName = initialGhostName;
		gc.scanGhosts = async () => { gc.ghosts = [{ name: "g", path: "ghost/g" }]; };
		const gate = deferred();
		gc.selectGhost = () => gate.promise;
		let finished = false;
		const startup = gc.autoLoadGhost().then(() => { finished = true; });
		await new Promise((r) => setImmediate(r));
		assert.equal(finished, false);
		gate.resolve();
		await startup;
		assert.equal(finished, true);
	}
});

test("stale ghost load cannot hide the next ghost's banner or boot", async () => {
	const { gc, assets } = setup();
	const first = gc.selectGhost("g");
	const second = gc.selectGhost("g");
	showGate.resolve();
	assets.resolve();
	hideGate.resolve();
	await Promise.all([first, second]);
	assert.equal(calls.filter((c) => c === "OnBoot").length, 1);
});
