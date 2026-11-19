import assert from "node:assert/strict";
import { beforeEach, describe, it } from "vitest";
import { ghostActions } from "../../ui/ts/core/actions/ghost-actions.js";

describe("core-coverage-boost: ghost-actions edge cases", () => {
	beforeEach(() => {
		delete globalThis.__TAURI__;
		delete globalThis.__TAURI_INTERNALS__;
	});

	it("showGhostInformation handles escaping, HTML rendering, and OK button click", () => {
		let hidden = false;
		let btnListener: (() => void) | null = null;

		const mockContent = {
			innerHTML: "",
			querySelector: (sel: string) => {
				if (sel === "#modal-ok-btn") {
					return {
						addEventListener: (_evt: string, cb: () => void) => {
							btnListener = cb;
						},
					};
				}
				return null;
			},
		};
		const mockOverlay: { style: Record<string, string> } = { style: {} };

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
				} as {
					name: string;
					version: string;
					sakura_name: string;
					kero_name: string;
					shiori: string;
					craftman: string;
					craftman_url: string;
					path: string;
				} | null,
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

		const onBtnClick = btnListener as (() => void) | null;
		assert.ok(typeof onBtnClick === "function");
		onBtnClick();
		assert.equal(hidden, true);

		// Early return when currentGhost is null
		app.ghostController.currentGhost = null;
		app.showGhostInformation();
	});

	it("recordRecentGhost limits history to 8 entries and handles storage failure", () => {
		const store = new Map<string, string>();
		globalThis.localStorage = {
			getItem: (k: string) => store.get(k) ?? null,
			setItem: (k: string, v: string) => store.set(k, v),
		} as unknown as Storage;

		const app = { ...ghostActions };
		app.recordRecentGhost("Ghost1");
		let parsed = JSON.parse(store.get("nanai_recent_ghosts") ?? "[]");
		assert.deepEqual(parsed, ["Ghost1"]);

		// Fill up past 8 entries
		for (let i = 2; i <= 10; i++) {
			app.recordRecentGhost(`Ghost${i}`);
		}
		parsed = JSON.parse(store.get("nanai_recent_ghosts") ?? "[]");
		assert.equal(parsed.length, 8);
		assert.equal(parsed[0], "Ghost10");

		// Invalid JSON or null payload
		app.recordRecentGhost(null as unknown as string);
		// Simulate getItem throwing an error or handling catch block
		globalThis.localStorage.getItem = () => {
			throw new Error("Storage unavailable");
		};
		app.recordRecentGhost("GhostFallback");
	});

	it("switchToNextGhost cycles between ghosts or early returns", () => {
		let selected: string | null = null;
		const app = {
			...ghostActions,
			ghostController: {
				ghosts: [{ name: "G1" }, { name: "G2" }, { name: "G3" }],
				currentGhost: { name: "G2" },
				selectGhost: (name: string) => {
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

		delete (globalThis as unknown as { confirm?: unknown }).confirm;
	});

	it("handleDressupToggle handles mustselect option correctly", async () => {
		const state = new Map<string, boolean>();
		const bindCalls: Array<{
			cat: string;
			part: string;
			on: string;
			scopeId: number;
		}> = [];

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
				bindDressup: async (
					cat: string,
					part: string,
					on: string,
					scopeId: number,
				) => {
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
