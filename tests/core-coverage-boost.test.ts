import assert from "node:assert/strict";
import { beforeEach, describe, it, vi } from "vitest";
import { applyAssetProperties } from "../ui/js/core/actions/balloon-descript/assets.js";
import { applyBaseFontProperties } from "../ui/js/core/actions/balloon-descript/font/base.js";
import { applySpecialFontProperties } from "../ui/js/core/actions/balloon-descript/font/special.js";
import { ghostActions } from "../ui/js/core/actions/ghost-actions.js";
import { actionMethods } from "../ui/js/core/app-actions.js";
import { eventMethods } from "../ui/js/core/app-events.js";
import { updateMethods } from "../ui/js/core/app-update.js";
import {
	getCurrentWindowPosition,
	invoke,
	ipcQueueStats,
	moveCurrentWindowBy,
	startDraggingWindow,
} from "../ui/js/core/tauri-helper.js";

describe("core-coverage-boost: tauri-helper & app-actions", () => {
	beforeEach(() => {
		ipcQueueStats.reset();
		delete globalThis.__TAURI__;
		delete globalThis.__TAURI_INTERNALS__;
	});

	describe("tauri-helper edge cases", () => {
		it("throws when Tauri is not available on invoke", async () => {
			await assert.rejects(
				() => invoke("non_existent_command"),
				/Tauri is not available to invoke command/,
			);
		});

		it("logs warnings on IPC queue alerts for 100, 1000, 5000 pending items", async () => {
			globalThis.window = globalThis;
			const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
			const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
			const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

			globalThis.__TAURI_INTERNALS__ = {
				invoke: async () => "ok",
			};

			// Simulate 100 pending
			ipcQueueStats.pendingCount = 99;
			await invoke("cmd_100");
			assert.ok(warnSpy.mock.calls.some((c) => c[0].includes("100件到達")));

			// Simulate 1000 pending
			ipcQueueStats.pendingCount = 999;
			await invoke("cmd_1000");
			assert.ok(warnSpy.mock.calls.some((c) => c[0].includes("1000件到達")));

			// Simulate 5000 pending
			ipcQueueStats.pendingCount = 4999;
			await invoke("cmd_5000");
			assert.ok(errorSpy.mock.calls.some((c) => c[0].includes("5000件到達")));

			warnSpy.mockRestore();
			errorSpy.mockRestore();
			logSpy.mockRestore();
		});

		it("handles errors gracefully in startDraggingWindow, moveCurrentWindowBy, getCurrentWindowPosition", async () => {
			const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

			globalThis.__TAURI_INTERNALS__ = {};
			// Mock window without required methods
			globalThis.__TAURI_PATTERN__ = { pattern: "all" };

			await startDraggingWindow();
			assert.ok(
				warnSpy.mock.calls.some((c) =>
					c[0].includes("startDraggingWindow failed:"),
				),
			);

			await moveCurrentWindowBy(5, 5, { x: 0, y: 0 });
			assert.ok(
				warnSpy.mock.calls.some((c) =>
					c[0].includes("moveCurrentWindowBy failed:"),
				),
			);

			const pos = await getCurrentWindowPosition();
			assert.equal(pos, null);
			assert.ok(
				warnSpy.mock.calls.some((c) =>
					c[0].includes("getCurrentWindowPosition failed:"),
				),
			);

			warnSpy.mockRestore();
		});
	});

	describe("app-actions edge cases", () => {
		it("handles action: talk with payload object scope", () => {
			let calledScope = null;
			const app = {
				...actionMethods,
				ghostController: {},
				onGhostClick: (_clientX, _clientY, _rect, scopeId) => {
					calledScope = scopeId;
				},
			};

			app.handleMenuAction("talk", { scope: 1 });
			assert.equal(calledScope, 1);

			app.handleMenuAction("talk", "invalid_scope_type");
			assert.equal(calledScope, 0);
		});

		it("handles action: keep-temporary-ghost (active vs inactive)", () => {
			let balloonMsg = "";
			let bootedSent = false;
			const app = {
				...actionMethods,
				ghostController: {
					currentGhost: { isTemporary: true },
					sendShioriEvent: (evt) => {
						if (evt === "OnBoot") bootedSent = true;
					},
				},
				showBalloon: (msg) => {
					balloonMsg = msg;
				},
				hideBalloon: () => {},
			};

			app.handleMenuAction("keep-temporary-ghost");
			assert.equal(app.ghostController.currentGhost.isTemporary, false);
			assert.ok(
				balloonMsg.includes("一時起動ゴーストを通常起動状態として保持しました"),
			);
			assert.equal(bootedSent, true);

			// Run again when not temporary
			app.handleMenuAction("keep-temporary-ghost");
			assert.ok(balloonMsg.includes("一時起動中のゴーストではありません"));
		});

		it("handles action: reset-shell-position and reset-balloon-position", () => {
			const ghostDisplay = {
				style: { left: "10px", top: "20px", transform: "scale(1.2)" },
				classList: {
					classes: new Set(["is-docked-left", "is-docked-right"]),
					remove(...cls) {
						for (const c of cls) this.classes.delete(c);
					},
				},
			};
			const interactionManager = {
				balloonOffsetX: 50,
				balloonOffsetY: 60,
			};

			const app = {
				...actionMethods,
				elements: { ghostDisplay },
				interactionManager,
				showBalloon: () => {},
				hideBalloon: () => {},
			};

			app.handleMenuAction("reset-shell-position");
			assert.equal(ghostDisplay.style.left, "");
			assert.equal(ghostDisplay.style.top, "");
			assert.equal(ghostDisplay.style.transform, "");
			assert.equal(ghostDisplay.classList.classes.has("is-docked-left"), false);

			app.handleMenuAction("reset-balloon-position");
			assert.equal(interactionManager.balloonOffsetX, 0);
			assert.equal(interactionManager.balloonOffsetY, 0);
		});

		it("handles ghost call, switch-to-shell, recent-ghost, and dressup-toggle", () => {
			let calledGhost = null;
			let calledShell = null;
			let toggledPayload = null;

			const app = {
				...actionMethods,
				ghostController: {
					selectGhost: async (name) => {
						calledGhost = name;
					},
					selectShell: async (name) => {
						calledShell = name;
					},
				},
				callGhost: (name) => {
					calledGhost = `called_${name}`;
				},
				handleDressupToggle: (payload) => {
					toggledPayload = payload;
				},
			};

			app.handleMenuAction("call-ghost", "Kero");
			assert.equal(calledGhost, "called_Kero");

			app.handleMenuAction("recent-ghost", { name: "Sakura" });
			assert.equal(calledGhost, "Sakura");

			app.handleMenuAction("switch-to-shell", { shellName: "winter" });
			assert.equal(calledShell, "winter");

			app.handleMenuAction("dressup-toggle", {
				category: "hat",
				part: "beret",
			});
			assert.deepEqual(toggledPayload, { category: "hat", part: "beret" });
		});

		it("falls back to modalManager for unhandled actions", () => {
			let shownModal = null;
			const app = {
				...actionMethods,
				modalManager: {
					show: (content) => {
						shownModal = content;
					},
				},
			};

			app.handleMenuAction("ghost-switch");
			assert.equal(shownModal, "ghost-modal-content");

			app.handleMenuAction("custom-menu");
			assert.equal(shownModal, "custom-menu-modal-content");
		});
	});

	describe("ghost-actions edge cases", () => {
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

	describe("app-events edge cases", () => {
		it("dispatches mouse down, up, wheel, drag start/end, and hover events with UKADOC coordinates", () => {
			const sentEvents = [];
			const app = {
				...eventMethods,
				ghostController: {
					sendShioriEvent: (evt, args) => {
						sentEvents.push({ evt, args });
					},
				},
				getCollisionInfo: (_x, _y, _r, scopeId) => ({
					name: "Head",
					canvasX: 42,
					canvasY: 99,
					scopeId,
				}),
				sakuraPlayer: {
					timeCritical: false,
					isPlaying: false,
				},
			};

			app.onGhostMouseDown(10, 10, {}, 0, "mouse", 0);
			app.onGhostMouseUp(10, 10, {}, 0, "mouse", 0);
			app.onGhostWheel(10, 10, {}, 120, 0);
			app.onGhostDragStart(10, 10, {}, 0);
			app.onGhostDragEnd(10, 10, {}, 0);
			app.onGhostHover(10, 10, {}, 0);

			assert.equal(sentEvents[0].evt, "OnMouseDown");
			assert.deepEqual(sentEvents[0].args, [42, 99, 0, 0, "Head", 0, "mouse"]);

			assert.equal(sentEvents[1].evt, "OnMouseUp");
			assert.equal(sentEvents[2].evt, "OnMouseWheel");
			assert.equal(sentEvents[2].args[2], 120);

			assert.equal(sentEvents[3].evt, "OnMouseDragStart");
			assert.equal(sentEvents[4].evt, "OnMouseDragEnd");
			assert.equal(sentEvents[5].evt, "OnMouseHover");
		});

		it("suppresses mouse events during timeCritical && isPlaying", () => {
			const sentEvents = [];
			const app = {
				...eventMethods,
				ghostController: {
					sendShioriEvent: (evt, args) => {
						sentEvents.push({ evt, args });
					},
				},
				getCollisionInfo: () => ({ name: "Head", canvasX: 0, canvasY: 0 }),
				sakuraPlayer: {
					timeCritical: true,
					isPlaying: true,
				},
			};

			app.onGhostClick(0, 0, {}, 0);
			app.onGhostStroke(0, 0, {}, 0);
			app.onGhostMouseDown(0, 0, {}, 0);
			app.onGhostMouseUp(0, 0, {}, 0);
			app.onGhostWheel(0, 0, {}, 0);
			app.onGhostDragStart(0, 0, {}, 0);
			app.onGhostDragEnd(0, 0, {}, 0);
			app.onGhostHover(0, 0, {}, 0);

			assert.equal(sentEvents.length, 0);
		});

		it("listens to request-subchar-image and emits updated subchar surface image", async () => {
			globalThis.window = globalThis;
			globalThis.addEventListener = () => {};
			let emittedEvent = null;
			let emittedPayload = null;
			let subcharHandler = null;

			globalThis.__TAURI_INTERNALS__ = {
				invoke: async (cmd, args) => {
					if (cmd === "plugin:event|listen") {
						if (args.event === "request-subchar-image") {
							subcharHandler = args.handler;
						}
					}
					if (cmd === "plugin:event|emit") {
						emittedEvent = args.event;
						emittedPayload = args.payload;
					}
				},
				transformCallback: (cb) => cb,
			};

			const surfacesMap = new Map();
			surfacesMap.set(1, "asset://subchar1.png");

			const app = {
				...eventMethods,
				ghostController: {
					currentSurfaces: surfacesMap,
				},
				syncMenuGhosts: () => {},
				handleMenuAction: () => {},
			};

			await app.setupExternalMenuListeners();

			// Simulate trigger of request-subchar-image
			assert.ok(typeof subcharHandler === "function");
			subcharHandler({
				event: "request-subchar-image",
				payload: { scopeId: 1 },
			});

			assert.equal(emittedEvent, "update-subchar-image-1");
			assert.deepEqual(emittedPayload, { src: "asset://subchar1.png" });
		});
	});

	describe("app-update edge cases", () => {
		it("startNetworkUpdate executes checkOnly mode with updates found", async () => {
			globalThis.window = globalThis;
			const sentEvents = [];
			let shownBalloon = "";

			globalThis.__TAURI_INTERNALS__ = {
				invoke: async (cmd) => {
					if (cmd === "check_ghost_update") {
						return {
							has_update: true,
							total_count: 3,
							message: "3件の更新があります",
							update_files: [
								{ path: "file1.txt" },
								{ path: "file2.txt" },
								{ path: "file3.txt" },
							],
						};
					}
					return null;
				},
				transformCallback: (cb) => cb,
				plugins: {
					event: {
						listeners: {},
						listen: async () => () => {},
						emit: async () => {},
						unregisterListener: () => {},
					},
				},
			};

			const app = {
				...updateMethods,
				ghostController: {
					currentGhost: { name: "TestGhost", path: "/ghost/path" },
					sendShioriEvent: async (evt, args) => {
						sentEvents.push({ evt, args });
						return null;
					},
				},
				showBalloon: (msg) => {
					shownBalloon = msg;
				},
			};

			await app.startNetworkUpdate(null, { checkOnly: true });

			assert.equal(shownBalloon, "3件の更新があります");
			const checkComp = sentEvents.find(
				(e) => e.evt === "OnUpdateCheckComplete",
			);
			assert.ok(checkComp);
			assert.equal(checkComp.args[0], "3");
			assert.equal(checkComp.args[1], "file1.txt,file2.txt,file3.txt");
		});

		it("startNetworkUpdate in checkOnly mode handles check failure", async () => {
			globalThis.window = globalThis;
			const sentEvents = [];

			globalThis.__TAURI_INTERNALS__ = {
				invoke: async (cmd) => {
					if (cmd === "check_ghost_update") {
						throw new Error("404 not found");
					}
					return null;
				},
				transformCallback: (cb) => cb,
				plugins: {
					event: {
						listeners: {},
						listen: async () => () => {},
						emit: async () => {},
						unregisterListener: () => {},
					},
				},
			};

			const app = {
				...updateMethods,
				ghostController: {
					currentGhost: { name: "TestGhost", path: "/ghost/path" },
					sendShioriEvent: async (evt, args) => {
						sentEvents.push({ evt, args });
						return null;
					},
				},
				showBalloon: () => {},
			};

			await app.startNetworkUpdate(null, { checkOnly: true });

			const failureEvt = sentEvents.find(
				(e) => e.evt === "OnUpdateCheckFailure",
			);
			assert.ok(failureEvt);
			assert.equal(failureEvt.args[0], "404");
		});
	});

	describe("balloon-descript edge cases (font & assets)", () => {
		it("applyBaseFontProperties handles font.size pt-to-px, styles, decorations, outline, and shadow", () => {
			const styleMap = new Map();
			const mockRoot = {
				style: {
					setProperty: (k, v) => styleMap.set(k, v),
				},
			};

			const props = {
				id: "custom-balloon",
				"font.name": "Courier New",
				"font.size": "12", // pt
				"font.bold": "true",
				"font.italic": "1",
				"font.underline": "1",
				"font.strike": "true",
				"font.outline": "1",
				"font.color.r": "255",
				"font.color.g": "128",
				"font.color.b": "64",
				"font.shadowcolor.r": "10",
				"font.shadowcolor.g": "20",
				"font.shadowcolor.b": "30",
				"font.shadowstyle": "drop",
			};

			applyBaseFontProperties(mockRoot, props);

			assert.equal(styleMap.get("--balloon-id"), "custom-balloon");
			assert.equal(
				styleMap.get("--balloon-font-family"),
				'"Courier New", Meiryo, sans-serif',
			);
			assert.equal(styleMap.get("--balloon-font-size"), "16px"); // 12 * 96 / 72 = 16px
			assert.equal(styleMap.get("--balloon-font-weight"), "bold");
			assert.equal(styleMap.get("--balloon-font-style"), "italic");
			assert.equal(
				styleMap.get("--balloon-text-decoration"),
				"underline line-through",
			);
			assert.equal(styleMap.get("--balloon-font-outline"), "1");
			assert.equal(styleMap.get("--balloon-text-color"), "rgb(255, 128, 64)");
			assert.equal(
				styleMap.get("--balloon-font-shadow-color"),
				"rgb(10, 20, 30)",
			);
			assert.equal(styleMap.get("--balloon-font-shadow-style"), "drop");
		});

		it("applySpecialFontProperties handles number, sstp, and disable font properties", () => {
			const styleMap = new Map();
			const mockRoot = {
				style: {
					setProperty: (k, v) => styleMap.set(k, v),
				},
			};

			const props = {
				"cursor.font.color": "rgb(200, 200, 200)",
				"cursor.color.font": "rgb(10, 10, 10)",
				"number.font.name": "Impact",
				"number.font.height": "24",
				"number.font.color.r": "100",
				"number.font.color.g": "150",
				"number.font.color.b": "200",
				"sstpmessage.font.name": "Consolas",
				"sstpmessage.font.height": "14",
				"sstpmessage.font.color.r": "50",
				"sstpmessage.font.color.g": "60",
				"sstpmessage.font.color.b": "70",
				"disable.font": "gray",
			};

			applySpecialFontProperties(mockRoot, props);

			assert.equal(
				styleMap.get("--balloon-highlight-bg"),
				"rgb(200, 200, 200)",
			);
			assert.equal(styleMap.get("--balloon-highlight-text"), "rgb(10, 10, 10)");
			assert.equal(
				styleMap.get("--balloon-number-font-family"),
				'"Impact", sans-serif',
			);
			assert.equal(styleMap.get("--balloon-number-font-size"), "24px");
			assert.equal(
				styleMap.get("--balloon-number-color"),
				"rgb(100, 150, 200)",
			);
			assert.equal(
				styleMap.get("--balloon-sstp-font-family"),
				'"Consolas", sans-serif',
			);
			assert.equal(styleMap.get("--balloon-sstp-font-size"), "14px");
			assert.equal(
				styleMap.get("--balloon-sstp-font-color"),
				"rgb(50, 60, 70)",
			);
			assert.equal(styleMap.get("--balloon-disable-font"), "gray");
		});

		it("applyAssetProperties handles markers, coordinates, alpha options, and vertical writing mode", () => {
			const styleMap = new Map();
			const mockRoot = {
				style: {
					setProperty: (k, v) => styleMap.set(k, v),
				},
			};
			const instance = { currentBalloonTheme: "test-theme" };

			const props = {
				readme: "readme.txt",
				"readme.charset": "UTF-8",
				"recommended.ghost": "Nanai",
				"recommended.ghost.path": "/path/nanai",
				"arrow.filename": "arrow_skin.png",
				"arrow0.x": "12",
				"arrow0.y": "34",
				"arrow1.x": "56",
				"arrow1.y": "78",
				"clickwaitmarker.filename": "clickwait.png",
				"clickwaitmarker.x": "5",
				"clickwaitmarker.y": "6",
				"sstpmarker.filename": "sstp.png",
				"sstpmarker.x": "7",
				"sstpmarker.y": "8",
				vertical: "1",
				"onlinemarker.interval": "500",
				"onlinemarker.x": "15",
				"onlinemarker.y": "25",
				"sstpmessage.x": "100",
				"sstpmessage.y": "200",
				paint_transparent_region_black: "1",
				use_self_alpha: "1",
				use_input_alpha: "1",
				overlay_outside_balloon: "1",
				cursor: "cursor.png",
				"mousecursor.arrow": "cur_arrow.png",
			};

			applyAssetProperties(mockRoot, props, instance);

			assert.equal(styleMap.get("--balloon-readme"), "readme.txt");
			assert.equal(styleMap.get("--balloon-readme-charset"), "UTF-8");
			assert.equal(styleMap.get("--balloon-recommended-ghost"), "Nanai");
			assert.equal(styleMap.get("--balloon-arrow0-x"), "12px");
			assert.equal(styleMap.get("--balloon-arrow0-y"), "34px");
			assert.equal(styleMap.get("--balloon-arrow1-x"), "56px");
			assert.equal(styleMap.get("--balloon-arrow1-y"), "78px");
			assert.equal(styleMap.get("--balloon-clickwait-x"), "5px");
			assert.equal(styleMap.get("--balloon-sstpmarker-x"), "7px");
			assert.equal(styleMap.get("--balloon-writing-mode"), "vertical-rl");
			assert.equal(instance.onlineMarkerInterval, 500);
			assert.equal(styleMap.get("--balloon-online-x"), "15px");
			assert.equal(styleMap.get("--balloon-sstpmessage-x"), "100px");
			assert.equal(styleMap.get("--balloon-paint-black"), "1");
			assert.equal(styleMap.get("--balloon-use-self-alpha"), "1");
			assert.equal(styleMap.get("--balloon-use-input-alpha"), "1");
			assert.equal(styleMap.get("--balloon-overlay-outside"), "1");
		});
	});
});
