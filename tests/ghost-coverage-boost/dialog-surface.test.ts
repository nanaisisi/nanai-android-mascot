import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { handleOpenDialogCommand } from "../../ui/ts/ghost/command-handler/dialog.js";
import {
	handleAnimCommand,
	handleBindCommand,
} from "../../ui/ts/ghost/command-handler/surface.js";
import type { SakuraCommandHandler } from "../../ui/ts/ghost/sakura-command-handler.js";

describe("command-handler/dialog.js & surface.js", () => {
	it("handleOpenDialogCommand invokes modalDialogController.openSystemDialog with dialogType and parameters", async () => {
		let openedDialog: {
			type: string;
			params: string[];
			scope?: number;
		} | null = null;
		const handler = {
			player: { currentScope: 1 },
			app: {
				modalDialogController: {
					openSystemDialog: async (
						type: string,
						params: string[],
						scope?: number,
					) => {
						openedDialog = { type, params, scope };
						return "selected-path";
					},
				},
			},
		} as unknown as SakuraCommandHandler;

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
		const noControllerHandler = {
			player: { currentScope: 0 },
			app: {},
		} as unknown as SakuraCommandHandler;
		const res3 = await handleOpenDialogCommand(noControllerHandler, [
			"open",
			"dialog",
		]);
		assert.strictEqual(res3, undefined);
	});

	it("handleAnimCommand handles pause, resume, stop, clear, and offset", async () => {
		const animActions: Array<{
			action: string;
			id: string | number;
			scope: number;
			x?: number;
			y?: number;
		}> = [];
		const mockSurfaceManager = {
			pauseAnimationById: (id: string | number, scope: number) => {
				animActions.push({ action: "pause", id, scope });
			},
			resumeAnimationById: (id: string | number, scope: number) => {
				animActions.push({ action: "resume", id, scope });
			},
			stopAnimationById: (id: string | number, scope: number) => {
				animActions.push({ action: "stop", id, scope });
			},
			setAnimationOffset: (
				id: string | number,
				x: number,
				y: number,
				scope: number,
			) => {
				animActions.push({ action: "offset", id, x, y, scope });
			},
		};

		const handler = {
			player: { currentScope: 0 },
			app: { surfaceManager: mockSurfaceManager },
		} as unknown as SakuraCommandHandler;

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
		const baseMoveOffsets: Array<{ scope: number; x: number; y: number }> = [];
		const ghostOffsets: Array<{ scope: number; x: number; y: number }> = [];
		const surfaceUpdates: Array<{
			base: string | number;
			scope: number;
			layers: unknown;
		}> = [];

		const mockSurfaceManager: {
			setBaseMoveOffset: (scope: number, x: number, y: number) => void;
			currentSurfaceIdFor: (scope: number) => 1 | 11;
			resolveSurfaceNumber?: (num: string | number, _scope: number) => string;
		} = {
			setBaseMoveOffset: (scope: number, x: number, y: number) => {
				baseMoveOffsets.push({ scope, x, y });
			},
			currentSurfaceIdFor: (scope: number) => (scope === 1 ? 11 : 1),
			resolveSurfaceNumber: (num: string | number, _scope: number) => `0${num}`,
		};

		const mockGhostController = {
			setScopeMoveOffset: (scope: number, x: number, y: number) => {
				ghostOffsets.push({ scope, x, y });
			},
			updateSurface: async (
				base: string | number,
				scope: number,
				layers: unknown,
			) => {
				surfaceUpdates.push({ base, scope, layers });
			},
		};

		const handler = {
			player: { currentScope: 0 },
			app: {
				surfaceManager: mockSurfaceManager,
				ghostController: mockGhostController,
			},
		} as unknown as SakuraCommandHandler;

		// 1. anim, add (empty)
		await handleAnimCommand(handler, ["anim", "add"]);

		// 2. anim, add, move, x, y
		await handleAnimCommand(handler, ["anim", "add", "move", "10", "20"]);
		assert.deepStrictEqual(baseMoveOffsets, [{ scope: 0, x: 10, y: 20 }]);
		assert.deepStrictEqual(ghostOffsets, [{ scope: 0, x: 10, y: 20 }]);

		// 3. anim, add, move without ghostController.setScopeMoveOffset (DOM fallback)
		const mockElement = { style: {} as Record<string, string> };
		globalThis.document = {
			getElementById: (id: string) =>
				id === "ghost-display" ? (mockElement as unknown as HTMLElement) : null,
		} as unknown as Document;
		const domFallbackHandler = {
			player: { currentScope: 0 },
			app: { surfaceManager: mockSurfaceManager, ghostController: {} },
		} as unknown as SakuraCommandHandler;
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
		const dressupCalls: Array<{
			cat: string;
			part: string;
			status: string;
			scope: number;
			raise: boolean;
		}> = [];
		const handler = {
			player: { currentScope: 0 },
			app: {
				surfaceManager: {
					bindDressup: async (
						cat: string,
						part: string,
						status: string,
						scope: number,
						raise: boolean,
					) => {
						dressupCalls.push({ cat, part, status, scope, raise });
					},
				},
			},
		} as unknown as SakuraCommandHandler;

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
