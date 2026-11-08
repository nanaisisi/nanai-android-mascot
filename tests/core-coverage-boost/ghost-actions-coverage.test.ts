import assert from "node:assert/strict";
import { beforeEach, describe, it } from "vitest";
import { ghostActions } from "../../ui/js/core/actions/ghost-actions.js";

describe("core-coverage-boost: ghost-actions edge cases", () => {
	beforeEach(() => {
		delete globalThis.__TAURI__;
		delete globalThis.__TAURI_INTERNALS__;
	});

	it("showGhostInformation handles escaping, HTML rendering, and OK button click", () => {
		let hidden = false;
		let btnListener = null;

		const mockContent = {
			innerHTML: "",
			querySelector: (sel) => {
				if (sel === "#modal-ok-btn") {
					return {
						addEventListener: (_evt, cb) => {
							btnListener = cb;
						},
					};
				}
				return null;
			},
		};
		const mockOverlay = { style: {} };

		const app = {
			...ghostActions,
			ghostController: {
				currentGhost: {
					name: "Nanai <&> 'Test'",
					version: "1.0.0",
					sakura_name: "Sakura",
					kero_name: "Kero",
					shiori: "shiori.js",
					craftman: "Craftsman <Author>",
					craftman_url: "https://example.com?a=1&b=2",
					path: "/path/to/ghost",
				},
			},
			modalManager: {
				content: mockContent,
				overlay: mockOverlay,
				hide: () => {
					hidden = true;
				},
				showWindowIfNeeded: () => {},
			},
		};

		app.showGhostInformation();
		assert.ok(
			mockContent.innerHTML.includes("Nanai &lt;&amp;&gt; &#39;Test&#39;"),
		);
		assert.ok(mockContent.innerHTML.includes("Craftsman &lt;Author&gt;"));
		assert.equal(mockOverlay.style.display, "flex");

		assert.ok(typeof btnListener === "function");
		btnListener();
		assert.equal(hidden, true);

		// Early return when currentGhost is null
		app.ghostController.currentGhost = null;
		app.showGhostInformation();
	});

	it("recordRecentGhost limits history to 8 entries and handles storage failure", () => {
		const store = new Map();
		globalThis.localStorage = {
			getItem: (k) => store.get(k) ?? null,
			setItem: (k, v) => store.set(k, v),
		};

		const app = { ...ghostActions };
		app.recordRecentGhost("Ghost1");
		let parsed = JSON.parse(store.get("nanai_recent_ghosts"));
		assert.deepEqual(parsed, ["Ghost1"]);

		// Fill up past 8 entries
		for (let i = 2; i <= 10; i++) {
			app.recordRecentGhost(`Ghost${i}`);
		}
		parsed = JSON.parse(store.get("nanai_recent_ghosts"));
		assert.equal(parsed.length, 8);
		assert.equal(parsed[0], "Ghost10");

		// Invalid JSON or null payload
		app.recordRecentGhost(null);
		// Simulate getItem throwing an error or handling catch block
		globalThis.localStorage.getItem = () => {
			throw new Error("Storage unavailable");
		};
		app.recordRecentGhost("GhostFallback");
	});

	it("switchToNextGhost cycles between ghosts or early returns", () => {
		let selected = null;
		const app = {
			...ghostActions,
			ghostController: {
				ghosts: [{ name: "G1" }, { name: "G2" }, { name: "G3" }],
				currentGhost: { name: "G2" },
				selectGhost: (name) => {
					selected = name;
				},
			},
		};

		app.switchToNextGhost();
		assert.equal(selected, "G3");

		// At end of list, wrap to index 0
		app.ghostController.currentGhost = { name: "G3" };
		app.switchToNextGhost();
		assert.equal(selected, "G1");

		// 1 or fewer ghosts: no-op
		selected = null;
		app.ghostController.ghosts = [{ name: "G1" }];
		app.switchToNextGhost();
		assert.equal(selected, null);
	});

	it("uninstallCurrentGhost in non-Tauri environment respects globalThis.confirm", async () => {
		let confirmAsked = false;
		let confirmResult = false;
		globalThis.confirm = () => {
			confirmAsked = true;
			return confirmResult;
		};

		const app = {
			...ghostActions,
			ghostController: {
				currentGhost: { name: "TestGhost" },
			},
		};

		// User cancels confirm
		await app.uninstallCurrentGhost();
		assert.equal(confirmAsked, true);

		// User accepts confirm
		confirmResult = true;
		await app.uninstallCurrentGhost();

		delete globalThis.confirm;
	});

	it("handleDressupToggle handles mustselect option correctly", async () => {
		const state = new Map();
		const bindCalls = [];

		const app = {
			...ghostActions,
			surfaceManager: {
				dressupState: state,
				shellManifest: {
					bindgroups: [
						{
							category: "costume",
							name: "dress",
							options: ["mustselect"],
						},
					],
				},
				bindDressup: async (cat, part, on, scopeId) => {
					bindCalls.push({ cat, part, on, scopeId });
					state.set(`${scopeId}__${cat}__${part}`, on === "1");
				},
			},
		};

		// Turn on a dress in costume category
		await app.handleDressupToggle({
			category: "costume",
			part: "dress1",
			scope: 0,
		});
		assert.deepEqual(bindCalls[0], {
			cat: "costume",
			part: "dress1",
			on: "1",
			scopeId: 0,
		});

		// Turn off
		await app.handleDressupToggle({
			category: "costume",
			part: "dress1",
			scope: 0,
		});
		assert.deepEqual(bindCalls[1], {
			cat: "costume",
			part: "dress1",
			on: "0",
			scopeId: 0,
		});
	});
});
