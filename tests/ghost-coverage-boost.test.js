import assert from "node:assert/strict";
import { describe, it, vi } from "vitest";

import { handleOpenDialogCommand } from "../ui/js/ghost/command-handler/dialog.js";
import {
	handleAnimCommand,
	handleBindCommand,
} from "../ui/js/ghost/command-handler/surface.js";
import { SakuraCommandHandler } from "../ui/js/ghost/sakura-command-handler.js";
import { SakuraScriptPlayer } from "../ui/js/ghost/sakura-script.js";

describe("command-handler/dialog.js & surface.js", () => {
	it("handleOpenDialogCommand invokes modalDialogController.openSystemDialog with dialogType and parameters", async () => {
		let openedDialog = null;
		const handler = {
			player: { currentScope: 1 },
			app: {
				modalDialogController: {
					openSystemDialog: async (type, params, scope) => {
						openedDialog = { type, params, scope };
						return "selected-path";
					},
				},
			},
		};

		// 1. Explicit dialog type & parameters
		const res1 = await handleOpenDialogCommand(handler, [
			"open",
			"dialog",
			"save",
			"--title=Save As",
			"--filter=png",
		]);
		assert.strictEqual(res1, "selected-path");
		assert.deepStrictEqual(openedDialog, {
			type: "save",
			params: ["--title=Save As", "--filter=png"],
			scope: 1,
		});

		// 2. Default fallback dialog type ("open") when not provided
		const res2 = await handleOpenDialogCommand(handler, ["open", "dialog"]);
		assert.strictEqual(res2, "selected-path");
		assert.deepStrictEqual(openedDialog, {
			type: "open",
			params: [],
			scope: 1,
		});

		// 3. Graceful return when modalDialogController is not present
		const noControllerHandler = { player: { currentScope: 0 }, app: {} };
		const res3 = await handleOpenDialogCommand(noControllerHandler, [
			"open",
			"dialog",
		]);
		assert.strictEqual(res3, undefined);
	});

	it("handleAnimCommand handles pause, resume, stop, clear, and offset", async () => {
		const animActions = [];
		const mockSurfaceManager = {
			pauseAnimationById: (id, scope) => {
				animActions.push({ action: "pause", id, scope });
			},
			resumeAnimationById: (id, scope) => {
				animActions.push({ action: "resume", id, scope });
			},
			stopAnimationById: (id, scope) => {
				animActions.push({ action: "stop", id, scope });
			},
			setAnimationOffset: (id, x, y, scope) => {
				animActions.push({ action: "offset", id, x, y, scope });
			},
		};

		const handler = {
			player: { currentScope: 0 },
			app: { surfaceManager: mockSurfaceManager },
		};

		// pause and typo "pouse"
		await handleAnimCommand(handler, ["anim", "pause", "10"]);
		await handleAnimCommand(handler, ["anim", "pouse", "anim_idle"]);
		// resume
		await handleAnimCommand(handler, ["anim", "resume", "20"]);
		// stop and clear
		await handleAnimCommand(handler, ["anim", "stop", "30"]);
		await handleAnimCommand(handler, ["anim", "clear", "40"]);
		// offset
		await handleAnimCommand(handler, ["anim", "offset", "50", "15", "25"]);

		assert.deepStrictEqual(animActions, [
			{ action: "pause", id: 10, scope: 0 },
			{ action: "pause", id: "anim_idle", scope: 0 },
			{ action: "resume", id: 20, scope: 0 },
			{ action: "stop", id: 30, scope: 0 },
			{ action: "stop", id: 40, scope: 0 },
			{ action: "offset", id: 50, x: 15, y: 25, scope: 0 },
		]);
	});

	it("handleAnimCommand handles 'add' subcommands: move, base, overlay, overlayfast", async () => {
		const baseMoveOffsets = [];
		const ghostOffsets = [];
		const surfaceUpdates = [];

		const mockSurfaceManager = {
			setBaseMoveOffset: (scope, x, y) => {
				baseMoveOffsets.push({ scope, x, y });
			},
			currentSurfaceIdFor: (scope) => (scope === 1 ? 11 : 1),
			resolveSurfaceNumber: (num, _scope) => `0${num}`,
		};

		const mockGhostController = {
			setScopeMoveOffset: (scope, x, y) => {
				ghostOffsets.push({ scope, x, y });
			},
			updateSurface: async (base, scope, layers) => {
				surfaceUpdates.push({ base, scope, layers });
			},
		};

		const handler = {
			player: { currentScope: 0 },
			app: {
				surfaceManager: mockSurfaceManager,
				ghostController: mockGhostController,
			},
		};

		// 1. anim, add (empty)
		await handleAnimCommand(handler, ["anim", "add"]);

		// 2. anim, add, move, x, y
		await handleAnimCommand(handler, ["anim", "add", "move", "10", "20"]);
		assert.deepStrictEqual(baseMoveOffsets, [{ scope: 0, x: 10, y: 20 }]);
		assert.deepStrictEqual(ghostOffsets, [{ scope: 0, x: 10, y: 20 }]);

		// 3. anim, add, move without ghostController.setScopeMoveOffset (DOM fallback)
		const mockElement = { style: {} };
		globalThis.document = {
			getElementById: (id) => (id === "ghost-display" ? mockElement : null),
		};
		const domFallbackHandler = {
			player: { currentScope: 0 },
			app: { surfaceManager: mockSurfaceManager, ghostController: {} },
		};
		await handleAnimCommand(domFallbackHandler, [
			"anim",
			"add",
			"move",
			"5",
			"15",
		]);
		assert.strictEqual(mockElement.style.transform, "translate(5px, 15px)");

		// 4. anim, add, base, ID
		await handleAnimCommand(handler, ["anim", "add", "base", "2"]);
		assert.strictEqual(surfaceUpdates[0].base, "2");
		assert.strictEqual(surfaceUpdates[0].scope, 0);

		// 5. anim, add, overlay, ID, x, y
		await handleAnimCommand(handler, [
			"anim",
			"add",
			"overlay",
			"5",
			"30",
			"40",
		]);
		assert.strictEqual(surfaceUpdates[1].base, 1);
		assert.deepStrictEqual(surfaceUpdates[1].layers, [
			{ file: "surface05.png", x: 30, y: 40, type: "overlay" },
		]);

		// 6. anim, add, overlayfast without resolveSurfaceNumber
		delete mockSurfaceManager.resolveSurfaceNumber;
		handler.player.currentScope = 1;
		await handleAnimCommand(handler, ["anim", "add", "overlayfast", "10"]);
		assert.strictEqual(surfaceUpdates[2].base, 11);
		assert.deepStrictEqual(surfaceUpdates[2].layers, [
			{ file: "surface10.png", x: 0, y: 0, type: "overlayfast" },
		]);
	});

	it("handleBindCommand calls surfaceManager.bindDressup", async () => {
		const dressupCalls = [];
		const handler = {
			player: { currentScope: 0 },
			app: {
				surfaceManager: {
					bindDressup: async (cat, part, status, scope, raise) => {
						dressupCalls.push({ cat, part, status, scope, raise });
					},
				},
			},
		};

		await handleBindCommand(handler, ["bind", "head", "ribbon", "1"], true);
		assert.deepStrictEqual(dressupCalls, [
			{
				cat: "head",
				part: "ribbon",
				status: "1",
				scope: 0,
				raise: true,
			},
		]);
	});
});

describe("SakuraCommandHandler methods & lifecycle", () => {
	it("exercises openInputBox, teachBox, communicateBox, alignment, windowState, and jump", async () => {
		globalThis.document = {
			createElement: () => ({
				style: {},
				appendChild: () => {},
				addEventListener: () => {},
				remove: () => {},
				focus: () => {},
			}),
		};
		const modalCalls = [];
		const mockPlayer = {
			currentScope: 0,
			app: {
				elements: {
					balloonText: { appendChild: () => {}, innerHTML: "" },
					keroBalloonText: { appendChild: () => {}, innerHTML: "" },
				},
				modalDialogController: {
					openInputBox: (opts) => modalCalls.push({ method: "inputbox", opts }),
					openTeachBox: (opts) => modalCalls.push({ method: "teachbox", opts }),
					openCommunicateBox: (opts) =>
						modalCalls.push({ method: "communicatebox", opts }),
					closeTeachBox: () => modalCalls.push({ method: "closeTeachBox" }),
					closeCommunicateBox: (cancel) =>
						modalCalls.push({ method: "closeCommunicateBox", cancel }),
				},
				ghostController: {
					username: "Alice",
					currentGhost: { name: "Nanai" },
					sendShioriEvent: async () => {},
					lastGhostName: "OldNanai",
					lastObjectName: "Obj1",
				},
			},
		};

		const handler = new SakuraCommandHandler(mockPlayer);

		// 1. Box methods
		handler.openInputBox(["id1", "--text=hello"]);
		handler.openTeachBox(["word1", "--text=sample"], { title: "Teach" });
		assert.ok(handler.teachForm != null);
		handler.closeTeachBox();
		assert.strictEqual(handler.teachForm, null);

		handler.openCommunicateBox(["prompt1"]);
		assert.ok(handler.communicateForm != null);
		handler.closeCommunicateBox(true);
		assert.strictEqual(handler.communicateForm, null);

		assert.ok(modalCalls.some((c) => c.method === "inputbox"));

		// 2. setAlignmentToDesktop
		await handler.setAlignmentToDesktop("bottom");

		// 3. handleWindowState
		await handler.handleWindowState("minimize");

		// 4. handleJump
		await handler.handleJump("raise", ["OnCustomJump", "ref1"]);

		// 5. expandEnv
		const expanded = handler.expandEnv("Hello %username, I am %selfname");
		assert.strictEqual(expanded, "Hello Alice, I am Nanai");

		// 6. resetLifetimeState
		handler.resetLifetimeState();
	});
});

describe("SakuraScriptPlayer lifecycle & edge cases", () => {
	it("exercises destroy(), sleep cancellation, scheduleSurfaceRestore error handling, and keydown variants in waitForClickOrTimeout", async () => {
		vi.useFakeTimers();

		const eventsSent = [];
		const mockApp = {
			ghostController: {
				sendShioriEvent: async (ev, args) => {
					if (ev === "OnSurfaceRestoreThrow") {
						throw new Error("Restore error");
					}
					eventsSent.push({ ev, args });
				},
			},
			elements: {
				balloonDisplay: { style: {} },
				keroBalloonDisplay: { style: {} },
				balloonText: { innerHTML: "", appendChild() {} },
				keroBalloonText: { innerHTML: "", appendChild() {} },
			},
		};

		const player = new SakuraScriptPlayer(mockApp);

		// 1. sleep with cancellation via destroy()
		let sleepResolved = false;
		const sleepPromise = player.sleep(5000).then(() => {
			sleepResolved = true;
		});

		// Setup timers and active state
		player._restoreTimer = setTimeout(() => {}, 10000);
		player.choiceTimeoutTimer = setTimeout(() => {}, 10000);
		player.balloonTimeoutTimer = setTimeout(() => {}, 10000);
		let pauseResolved = false;
		player._pauseResolver = () => {
			pauseResolved = true;
		};

		// Call destroy()
		player.destroy();
		assert.strictEqual(player.isPlaying, false);
		assert.strictEqual(player._restoreTimer, null);
		assert.strictEqual(player.choiceTimeoutTimer, null);
		assert.strictEqual(player.balloonTimeoutTimer, null);
		assert.strictEqual(pauseResolved, true);

		// Sleep promise should be resolved immediately by cancel
		await sleepPromise;
		assert.strictEqual(sleepResolved, true);

		// 2. onChoiceTimeout error ignoring
		player.choiceTimeoutTimer = setTimeout(() => {}, 1000);
		player.lastScript = "\\0Hello";
		mockApp.ghostController.sendShioriEvent = async () => {
			throw new Error("Network offline");
		};
		await player.onChoiceTimeout();
		assert.strictEqual(player.choiceTimeoutTimer, null);

		// 3. scheduleSurfaceRestore mismatch and exception
		player.playbackId = 10;
		player.isPlaying = false;
		player.scheduleSurfaceRestore(9); // Mismatched ID, should not send
		vi.advanceTimersByTime(8500);
		await vi.advanceTimersByTimeAsync(0);

		// Now matching ID with throwing event
		player.playbackId = 12;
		mockApp.ghostController.sendShioriEvent = async () => {
			throw new Error("Restore boom");
		};
		player.scheduleSurfaceRestore(12);
		vi.advanceTimersByTime(8500);
		await vi.advanceTimersByTimeAsync(0);

		// 4. waitForClickOrTimeout keydown Space, Escape and timeout
		const docListeners = {};
		globalThis.document = {
			addEventListener: (t, cb) => {
				docListeners[t] = cb;
			},
			removeEventListener: () => {},
		};

		// Space key
		const waitPromiseSpace = player.waitForClickOrTimeout(null, 1000);
		docListeners.keydown?.({ key: " " });
		await waitPromiseSpace;

		// Escape key
		const waitPromiseEsc = player.waitForClickOrTimeout(null, 1000);
		docListeners.keydown?.({ key: "Escape" });
		await waitPromiseEsc;

		// Other key (ignored) followed by timeout
		const waitPromiseTimeout = player.waitForClickOrTimeout(null, 500);
		docListeners.keydown?.({ key: "a" });
		vi.advanceTimersByTime(600);
		await waitPromiseTimeout;

		vi.useRealTimers();
	});
});

describe("sakura-play.js timeouts & balloon-window edge cases", () => {
	it("exercises playScript choiceTimeout and balloonTimeout timers and OnBalloonTimeout notification", async () => {
		vi.useFakeTimers();

		const eventsSent = [];
		const mockApp = {
			elements: {
				balloonDisplay: { style: { display: "block" } },
				keroBalloonDisplay: { style: { display: "block" } },
				balloonText: { innerHTML: "", appendChild() {} },
				keroBalloonText: { innerHTML: "", appendChild() {} },
			},
			ghostController: {
				sendShioriEvent: async (ev, args) => {
					eventsSent.push({ ev, args });
				},
			},
			surfaceManager: {
				onCharSpoken: () => {},
				onTalkEnd: () => {},
				onScriptEnd: () => {},
			},
		};

		const player = new SakuraScriptPlayer(mockApp);

		globalThis.document = {
			createElement: () => ({
				style: {},
				appendChild: () => {},
				addEventListener: () => {},
				removeEventListener: () => {},
				setAttribute: () => {},
				remove: () => {},
				focus: () => {},
			}),
		};

		// 1. playScript with choiceTimeout
		player.choiceTimeout = 3000;
		player.parse = async () => [
			{ type: "scope", value: 0 },
			{ type: "choice", id: "c1", text: "Choice 1" },
		];
		const playPromise1 = player.play("\\0\\q[Choice 1,c1]");
		await vi.advanceTimersByTimeAsync(100);
		await playPromise1;
		assert.ok(player.choiceTimeoutTimer != null);

		// Trigger choice timeout timer
		vi.advanceTimersByTime(3100);
		await vi.advanceTimersByTimeAsync(0);
		assert.ok(eventsSent.some((e) => e.ev === "OnChoiceTimeout"));

		// 2. playScript with balloonTimeout (no choices)
		player.choiceTimeout = 0;
		player.balloonTimeout = 4000;
		player.parse = async () => [
			{ type: "scope", value: 0 },
			{ type: "char", value: "A" },
		];
		const playPromise2 = player.play("\\0Hello");
		await vi.advanceTimersByTimeAsync(100);
		await playPromise2;
		assert.ok(player.balloonTimeoutTimer != null);

		// Trigger balloon timeout timer
		vi.advanceTimersByTime(4100);
		await vi.advanceTimersByTimeAsync(0);
		assert.strictEqual(mockApp.elements.balloonDisplay.style.display, "none");
		assert.strictEqual(
			mockApp.elements.keroBalloonDisplay.style.display,
			"none",
		);
		assert.ok(eventsSent.some((e) => e.ev === "OnBalloonTimeout"));

		// 3. Clear existing timers branch: re-running playScript clears previous timers
		player.balloonTimeoutTimer = setTimeout(() => {}, 5000);
		player.choiceTimeoutTimer = setTimeout(() => {}, 5000);
		player.balloonTimeout = 0;
		player.choiceTimeout = 0;
		const playPromise3 = player.play("\\0Next");
		await vi.runAllTimersAsync();
		await playPromise3;

		vi.useRealTimers();
	});

	it("exercises balloon-window and balloon-window/theme edge branches", async () => {
		const { loadBalloonSkinImages, applyBalloonDescript } = await import(
			"../ui/js/ghost/balloon-window/theme.js"
		);

		// 1. loadBalloonSkinImages for scope >= 2 with fallback to balloons0.png/pna
		globalThis.__TAURI_INTERNALS__ = {
			metadata: { currentWindow: { label: "balloon_window_2" } },
			invoke: async (cmd, args) => {
				if (cmd === "load_balloon_image") {
					if (args.file.startsWith("balloonp2")) {
						// Simulate missing scope 2 file
						return null;
					}
					if (args.file === "balloons0.png") {
						return "data:image/png;base64,fallback_png";
					}
					if (args.file === "balloons0.pna") {
						return "data:image/png;base64,fallback_pna";
					}
					return null;
				}
				if (cmd === "balloon_manifest") {
					// invalid / empty props
					return null;
				}
				return null;
			},
			transformCallback: (cb) => cb,
		};

		const bgScope2 = await loadBalloonSkinImages("theme_custom", 2);
		// processChromaKey might return null or base64 without canvas DOM, but function executes without throwing
		assert.ok(bgScope2 !== undefined);

		// 2. applyBalloonDescript when props is null
		const nullPropsRes = await applyBalloonDescript({
			theme: "empty_theme",
			scopeId: 0,
			currentUserScale: 1.0,
		});
		assert.strictEqual(nullPropsRes, null);

		// 3. applyBalloonDescript when invoke throws
		globalThis.__TAURI_INTERNALS__.invoke = async () => {
			throw new Error("Manifest error");
		};
		const errRes = await applyBalloonDescript({
			theme: "throw_theme",
			scopeId: 0,
			currentUserScale: 1.0,
		});
		assert.strictEqual(errRes, null);
	});
});
