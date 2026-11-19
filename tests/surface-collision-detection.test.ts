import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { wasmBridge } from "../ui/ts/core/wasm-bridge.js";
import {
	registerCollisionOverlayLayer,
	registerCollisionShapeSpec,
	renderCollisionOverlay,
	unregisterCollisionOverlayLayer,
	unregisterCollisionShapeSpec,
} from "../ui/ts/surface/collision-overlay-renderer.js";
import {
	findHitCollisionName,
	surfaceCollisionMethods,
} from "../ui/ts/surface/surface-collision.js";
import { SurfaceManager } from "../ui/ts/surface/surface-manager.js";

function clearTauriGlobals() {
	const g = globalThis as Record<string, unknown>;
	delete g.__TAURI__;
	delete g.__TAURI_INTERNALS__;
	delete g.__TAURI_IPC__;
	delete g.__TAURI_POST_MESSAGE__;
	delete g.ipc;
	delete g.rpc;
}

describe("SurfaceManager & surfaceCollisionMethods", () => {
	beforeEach(() => {
		clearTauriGlobals();
	});

	afterEach(() => {
		vi.restoreAllMocks();
		clearTauriGlobals();
	});

	it("initializes with no constructor args and tracks per-scope surface IDs", () => {
		const sm = new SurfaceManager();
		expect(sm.baseWidth).toBe(200);
		expect(sm.baseHeight).toBe(400);
		expect(sm.currentSurfaceId).toBe(0);
		expect(sm.currentSurfaceIdFor(0)).toBe(0);
		expect(sm.currentSurfaceIdFor(1)).toBe(10);
		expect(sm.currentSurfaceIdFor(2)).toBe(0);

		sm.setSurfaceId(5, 0);
		sm.setSurfaceId(12, 1);
		sm.setSurfaceId("25", 2);
		expect(sm.currentSurfaceId).toBe(5);
		expect(sm.currentSurfaceIdFor(1)).toBe(12);
		expect(sm.currentSurfaceIdFor(2)).toBe("25");

		sm.load();
		sm.render();
	});

	it("applyShellManifest populates all shape types, aliases, names, cursors, tooltips, and dressup defaults", () => {
		const sm = new SurfaceManager();
		sm.planCache.set("stale", {});

		const manifest = {
			directory: "/ghosts/emily/shell/master",
			collision_sort: "None",
			animation_sort: "Ascend",
			aliases: {
				happy: [1, 2],
			},
			kero_aliases: {
				kero_smile: [11],
			},
			char_aliases: {
				2: {
					extra_pose: [21],
				},
			},
			cursors: {
				sakura: [
					{ event: "mousemove", collision: "Head", cursor: "hand" },
					{ event: "mousemove", collision: "head", cursor: "pointer" },
				],
				"*": [{ event: "mousedown", collision: "Bust", cursor: "grab" }],
			},
			tooltips: {
				sakura: { Head: "撫でられます" },
				kero: { KeroBody: "うにゅう" },
				"*": { SharedPart: "共通ツールチップ" },
			},
			sakura_bind_groups: [
				{
					number: 100,
					category: "Hat",
					part: "Ribbon",
					default: true,
					add_ids: [],
				},
			],
			kero_bind_groups: [],
			surfaces: [
				{
					number: 0,
					definition: {
						name: "SakuraDefault",
						icon_rect: [10, 10, 60, 60],
						collisions: [
							{
								id: 0,
								name: "Head",
								shape: { Rect: { x1: 10, y1: 10, x2: 100, y2: 80 } },
							},
							{
								id: 1,
								name: "EyeCircle",
								shape: { Circle: { cx: 150, cy: 150, r: 20 } },
							},
							{
								id: 2,
								name: "CheekEllipse",
								shape: { Ellipse: { cx: 150, cy: 250, rx: 30, ry: 15 } },
							},
							{
								id: 3,
								name: "TriPoly",
								shape: {
									Polygon: {
										vertices: [
											[0, 300],
											[60, 300],
											[30, 360],
										],
									},
								},
							},
						],
						elements: [
							{ id: 0, method: "Base", file: "surface0.png", x: 0, y: 0 },
							{ id: 1, method: "Overlay", file: "eyes.png", x: 20, y: 30 },
						],
						animations: {
							100: {
								id: 100,
								interval: "Bind",
								patterns: [
									{
										index: 0,
										surface: 100,
										wait: 0,
										method: "Overlay",
										x: 0,
										y: 0,
									},
								],
							},
						},
					},
				},
			],
		};

		sm.applyShellManifest(manifest);

		expect(sm.planCache.size).toBe(0);
		expect(sm.names["0"]).toBe("SakuraDefault");
		expect(sm.iconRects["0"]).toEqual([10, 10, 60, 60]);
		expect(sm.aliases.happy).toEqual([1, 2]);
		expect(sm.keroAliases.kero_smile).toEqual([11]);
		expect(sm.charAliases[2].extra_pose).toEqual([21]);
		expect(sm.collisionSort).toBe("none");
		expect(sm.animationSort).toBe("ascend");
		expect(sm.dressupState.get("0__Hat__Ribbon")).toBe(true);
		expect(sm.isBindAnimationActive(0, 100)).toBe(true);
		expect(sm.isBindAnimationActive(0, 999)).toBe(false);

		const rect = { left: 0, top: 0, width: 200, height: 400 };
		// Rect hit & miss
		expect(sm.detectCollision(50, 40, rect, 0).name).toBe("head");
		// Circle hit & miss (outside circle radius 20 from 150,150)
		expect(sm.detectCollision(160, 150, rect, 0).name).toBe("eyecircle");
		expect(sm.detectCollision(168, 168, rect, 0).name).toBe("");
		// Ellipse hit & miss
		expect(sm.detectCollision(175, 250, rect, 0).name).toBe("cheekellipse");
		expect(sm.detectCollision(150, 270, rect, 0).name).toBe("");
		// Polygon hit & miss
		expect(sm.detectCollision(30, 320, rect, 0).name).toBe("tripoly");
		expect(sm.detectCollision(5, 350, rect, 0).name).toBe("");
	});

	it("detectCollision scales with naturalWidth/naturalHeight and falls back to baseWidth/baseHeight", () => {
		const sm = new SurfaceManager();
		sm.baseWidth = 200;
		sm.baseHeight = 400;
		sm.collisions["0"] = [
			{
				id: 1,
				name: "Face",
				shape: "rect",
				x1: 90,
				y1: 180,
				x2: 120,
				y2: 220,
				minX: 90,
				minY: 180,
				maxX: 120,
				maxY: 220,
			},
		];

		// Displayed at 100x200 with naturalWidth=200, naturalHeight=400 (2x scale)
		const naturalRect = {
			left: 10,
			top: 20,
			width: 100,
			height: 200,
			naturalWidth: 200,
			naturalHeight: 400,
		};
		const hitNatural = sm.detectCollision(60, 120, naturalRect, 0, 0);
		expect(hitNatural).toEqual({
			name: "Face",
			id: 1,
			canvasX: 100,
			canvasY: 200,
		});

		// Without naturalWidth/naturalHeight -> uses baseWidth=200, baseHeight=400
		const baseRect = {
			left: 10,
			top: 20,
			width: 100,
			height: 200,
		};
		const hitBase = sm.detectCollision(60, 120, baseRect, 0, 0);
		expect(hitBase).toEqual({
			name: "Face",
			id: 1,
			canvasX: 100,
			canvasY: 200,
		});

		// Zero / invalid targetRect
		expect(sm.detectCollision(50, 50, null)).toEqual({
			name: "",
			canvasX: 0,
			canvasY: 0,
		});
		expect(
			sm.detectCollision(50, 50, { left: 0, top: 0, width: 0, height: 100 }),
		).toEqual({
			name: "",
			canvasX: 0,
			canvasY: 0,
		});
	});

	it("detectCollision respects collisionSort (none, ascend, id, descend) and out-of-bounds", () => {
		const sm = new SurfaceManager();
		sm.collisions["0"] = [
			{
				id: 5,
				name: "Outer",
				shape: "rect",
				x1: 0,
				y1: 0,
				x2: 100,
				y2: 100,
				minX: 0,
				minY: 0,
				maxX: 100,
				maxY: 100,
			},
			{
				id: 2,
				name: "Inner",
				shape: "rect",
				x1: 0,
				y1: 0,
				x2: 100,
				y2: 100,
				minX: 0,
				minY: 0,
				maxX: 100,
				maxY: 100,
			},
			{
				name: "NoId",
				shape: "rect",
				x1: 0,
				y1: 0,
				x2: 100,
				y2: 100,
				minX: 0,
				minY: 0,
				maxX: 100,
				maxY: 100,
			},
		];

		const rect = { left: 0, top: 0, width: 200, height: 400 };

		// ascend -> lowest id (2 = Inner)
		sm.collisionSort = "ascend";
		expect(sm.detectCollision(50, 50, rect, 0).name).toBe("Inner");

		// id -> lowest id (2 = Inner)
		sm.collisionSort = "id";
		expect(sm.detectCollision(50, 50, rect, 0).name).toBe("Inner");

		// descend -> highest id (5 = Outer)
		sm.collisionSort = "descend";
		expect(sm.detectCollision(50, 50, rect, 0).name).toBe("Outer");

		// none with WASM ready -> first match in list (Outer)
		sm.collisionSort = "none";
		if (wasmBridge.isReady()) {
			expect(sm.detectCollision(50, 50, rect, 0).name).toBe("Outer");
		}

		// none with WASM not ready -> reverse loop (NoId)
		vi.spyOn(wasmBridge, "isReady").mockReturnValue(false);
		expect(sm.detectCollision(50, 50, rect, 0).name).toBe("NoId");
		vi.restoreAllMocks();

		// Negative out-of-bounds must NOT match (0,0) via WASM clamping
		expect(sm.detectCollision(-10, -10, rect, 0)).toEqual({
			name: "",
			canvasX: -10,
			canvasY: -10,
		});
		// Right/bottom out-of-bounds
		expect(sm.detectCollision(150, 200, rect, 0)).toEqual({
			name: "",
			canvasX: 150,
			canvasY: 200,
		});
	});

	it("delegates findHitCollisionName to wasmBridge", () => {
		const spy = vi
			.spyOn(wasmBridge, "findHitCollisionName")
			.mockReturnValue("Head");
		const cols = [
			{ name: "Head", shape: { shape: "rect", x1: 0, y1: 0, x2: 10, y2: 10 } },
		];
		expect(findHitCollisionName(cols, 5, 5)).toBe("Head");
		expect(surfaceCollisionMethods.findHitCollisionName(cols, 5, 5)).toBe(
			"Head",
		);
		expect(spy).toHaveBeenCalledTimes(2);
	});

	it("parseSurfacesTxt parses surfaces via WASM and TS fallback, and expandSurfaceRange handles exclusions", async () => {
		const sm = new SurfaceManager();
		expect(sm.expandSurfaceRange("0-2,5,10-12,!1,!11")).toEqual([
			"0",
			"2",
			"5",
			"10",
			"12",
		]);

		const sampleTxt = `
collision-sort,descend
surface0 {
name,NormalFace
element0,base,surface0.png,0,0
element1,overlay,eye.png,10,20
collision0,10,10,80,80,Face
collisionex1,Nose,circle,50,50,15
collisionex2,Cheek,ellipse,60,60,20,10
collisionex3,Jaw,polygon,10,90,90,90,50,130
}

sakura.surface.alias {
smile,1,2
}

kero.surface.alias {
kero_happy,11
}

sakura.cursor {
mousemove,Face,pointer
}

sakura.tooltips {
Face,顔領域
}
`;

		await sm.parseSurfacesTxt(sampleTxt);
		expect(sm.collisionSort).toBe("descend");
		expect(sm.collisions["0"]?.length).toBe(4);
		expect(sm.elements["0"]?.length).toBe(2);
		expect(sm.names["0"]).toBe("NormalFace");
		expect(sm.aliases.smile).toEqual([1, 2]);
		expect(sm.keroAliases.kero_happy).toEqual([11]);
		expect(sm.getCursorForCollision(0, "mousemove", "face")).toBe("pointer");
		expect(sm.getTooltipForCollision(0, "face")).toBe("顔領域");

		const rect = { left: 0, top: 0, width: 200, height: 400 };
		expect(sm.detectCollision(50, 50, rect, 0).name).toBe("nose");
		expect(sm.detectCollision(50, 110, rect, 0).name).toBe("jaw");

		// Pure TS fallback when wasmBridge.parseSurfacesTxt returns null
		const smFallback = new SurfaceManager();
		vi.spyOn(wasmBridge, "parseSurfacesTxt").mockReturnValueOnce(null);
		await smFallback.parseSurfacesTxt(sampleTxt);
		expect(smFallback.collisionSort).toBe("descend");
		expect(smFallback.collisions["0"]?.length).toBe(4);
		expect(smFallback.detectCollision(50, 50, rect, 0).name).toBe("nose");
		expect(smFallback.detectCollision(50, 110, rect, 0).name).toBe("jaw");
	});

	it("resolveSurfaceNumber resolves names, scope-isolated aliases, and numeric pass-through", () => {
		const sm = new SurfaceManager();
		sm.names = { "0": "SakuraBase", "10": "KeroBase" };
		sm.aliases = { happy: [5], multi: [6, 7] };
		sm.keroAliases = { kero_happy: [12] };
		sm.charAliases = {
			2: { c2_pose: [20, 21] },
		};

		// Empty / numeric pass-through
		expect(sm.resolveSurfaceNumber(0)).toBe(0);
		expect(sm.resolveSurfaceNumber("10")).toBe("10");
		expect(sm.resolveSurfaceNumber(-1)).toBe(-1);
		expect(sm.resolveSurfaceNumber("")).toBe("");
		expect(sm.resolveSurfaceNumber(null)).toBe("");
		expect(sm.resolveSurfaceNumber(undefined)).toBe("");

		// Case-insensitive name lookup
		expect(sm.resolveSurfaceNumber("sakurabase", 0)).toBe("0");
		expect(sm.resolveSurfaceNumber("KEROBase", 1)).toBe("10");

		// Scope isolation
		expect(sm.resolveSurfaceNumber("HAPPY", 0)).toBe("5");
		expect(["6", "7"]).toContain(String(sm.resolveSurfaceNumber("multi", 0)));
		expect(sm.resolveSurfaceNumber("happy", 1)).toBe("happy");
		expect(sm.resolveSurfaceNumber("kero_happy", 1)).toBe("12");
		expect(["20", "21"]).toContain(
			String(sm.resolveSurfaceNumber("C2_Pose", 2)),
		);
		expect(sm.resolveSurfaceNumber("unknown_alias", 0)).toBe("unknown_alias");
	});

	it("getCursorForCollision and getTooltipForCollision support scopes, case-insensitivity, overrides, and wildcards", () => {
		const sm = new SurfaceManager();
		sm.cursors = {
			sakura: [
				{ event: "MouseMove", collision: "Head", cursor: "hand" },
				{ event: "mousemove", collision: "head", cursor: "grab" },
			],
			kero: [{ event: "mousedown", collision: "Body", cursor: "move" }],
			char2: [{ event: "mousemove", collision: "Wing", cursor: "crosshair" }],
			"*": [{ event: "mousemove", collision: "GlobalPart", cursor: "help" }],
		};
		sm.tooltips = {
			sakura: { Head: "さくら頭" },
			kero: { Body: "うにゅう体" },
			char2: { Wing: "羽根" },
			"*": { GlobalPart: "共通パーツ" },
		};

		expect(sm.getCursorForCollision(0, "MOUSEMOVE", "HEAD")).toBe("grab");
		expect(sm.getCursorForCollision("sakura", "mousemove", "head")).toBe(
			"grab",
		);
		expect(sm.getCursorForCollision(1, "MouseDown", "body")).toBe("move");
		expect(sm.getCursorForCollision(2, "mousemove", "wing")).toBe("crosshair");
		expect(sm.getCursorForCollision(0, "mousemove", "globalpart")).toBe("help");
		expect(sm.getCursorForCollision(0, "mousemove", "missing")).toBeNull();
		expect(sm.getCursorForCollision(0, "mousemove", "")).toBeNull();

		expect(sm.getTooltipForCollision(0, "head")).toBe("さくら頭");
		expect(sm.getTooltipForCollision(1, "BODY")).toBe("うにゅう体");
		expect(sm.getTooltipForCollision(2, "wing")).toBe("羽根");
		expect(sm.getTooltipForCollision(1, "globalpart")).toBe("共通パーツ");
		expect(sm.getTooltipForCollision(0, "missing")).toBeNull();
		expect(sm.getTooltipForCollision(0, "")).toBeNull();
	});

	it("loadSurfacesTxt handles Tauri shell_manifest, open_file fallback, and non-Tauri fetch", async () => {
		const g = globalThis as Record<string, unknown>;
		g.window = globalThis;
		g.__TAURI_INTERNALS__ = {
			transformCallback: () => 0,
			invoke: async (cmd: string, args: Record<string, unknown>) => {
				if (cmd === "shell_manifest") {
					expect(args).toEqual({ ghostName: "emily", shellName: "custom" });
					return {
						surfaces: [
							{
								number: 0,
								definition: {
									collisions: [
										{
											id: 0,
											name: "Head",
											shape: { Rect: { x1: 0, y1: 0, x2: 50, y2: 50 } },
										},
									],
								},
							},
						],
					};
				}
				return null;
			},
		};

		const smTauri = new SurfaceManager();
		await smTauri.loadSurfacesTxt("/ghosts/emily/shell/custom");
		expect(smTauri.collisions["0"]?.[0]?.name).toBe("head");

		// Tauri shell_manifest returns null -> falls back to open_file -> parse_surfaces_text
		g.__TAURI_INTERNALS__ = {
			transformCallback: () => 0,
			invoke: async (cmd: string) => {
				if (cmd === "shell_manifest") return null;
				if (cmd === "open_file") {
					return "surface0\n{\ncollision0,0,0,20,20,Face\n}\n";
				}
				if (cmd === "parse_surfaces_text") {
					return {
						0: {
							number: 0,
							definition: {
								collisions: [
									{
										id: 0,
										name: "Face",
										shape: { Rect: { x1: 0, y1: 0, x2: 20, y2: 20 } },
									},
								],
							},
						},
					};
				}
				return null;
			},
		};
		const smOpenFile = new SurfaceManager();
		await smOpenFile.loadSurfacesTxt("/ghosts/emily", "master");
		expect(smOpenFile.collisions["0"]?.[0]?.name).toBe("face");

		// Non-Tauri fetch fallback
		clearTauriGlobals();
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => ({
				ok: true,
				text: async () => "surface0\n{\ncollision0,5,5,25,25,Eye\n}\n",
			})),
		);
		const smFetch = new SurfaceManager();
		await smFetch.loadSurfacesTxt("/ghosts/emily", "master");
		expect(smFetch.collisions["0"]?.[0]?.name).toBe("eye");
		vi.unstubAllGlobals();
	});

	it("supports bindDressup, processChromaKey, composeSurfaceElements, and transform state setters", async () => {
		const updated: Array<{ sid: number | string; scope: number }> = [];
		const events: Array<{ ev: string; args: unknown[] }> = [];
		const sm = new SurfaceManager({
			ghostController: {
				updateSurface: async (sid: number | string, scope = 0) => {
					updated.push({ sid, scope });
				},
				sendShioriEvent: async (ev: string, args: unknown[] = []) => {
					events.push({ ev, args });
					return { status: 200 };
				},
			},
		});

		await sm.bindDressup("Hat", "Ribbon", "1", 0, true);
		expect(sm.dressupState.get("0__Hat__Ribbon")).toBe(true);
		expect(updated).toEqual([{ sid: 0, scope: 0 }]);
		expect(events).toEqual([
			{ ev: "OnDressupChanged", args: ["Hat", "Ribbon", 1, 0] },
		]);

		// Toggle off without raising event
		await sm.bindDressup("Hat", "Ribbon", "", 0, false);
		expect(sm.dressupState.get("0__Hat__Ribbon")).toBe(false);
		expect(events.length).toBe(1);

		// Chroma key and composition return original src in non-DOM test env
		expect(await sm.processChromaKey("data:image/png;base64,abc")).toBe(
			"data:image/png;base64,abc",
		);
		expect(
			await sm.composeSurfaceElements(0, "data:image/png;base64,base"),
		).toBe("data:image/png;base64,base");

		// Chroma key reads seriko flags from shellManifest.descript.properties
		sm.shellManifest = {
			descript: {
				properties: {
					"seriko.use_self_alpha": "1",
					"seriko.paint_transparent_region_black": "true",
				},
			},
			sakura_bind_groups: [
				{
					number: 100,
					category: "Hat",
					part: "Ribbon",
					default: false,
					add_ids: [],
				},
			],
		};
		sm.elements["0"] = [
			{ id: 0, type: "base", method: "base", file: "surface0.png", x: 0, y: 0 },
			{
				id: 1,
				type: "overlay",
				method: "overlay",
				file: "eyes.png",
				x: 10,
				y: 20,
			},
		];
		sm.animations["0"] = [
			{
				id: 100,
				interval: "bind",
				patterns: [{ surface: 100, wait: 0, type: "overlay", x: 5, y: 6 }],
			},
		];
		await sm.bindDressup("Hat", "Ribbon", "1", 0, false);

		const drawCalls: Array<{ x: number; y: number; op: string }> = [];
		const origDocument = globalThis.document;
		const origImage = globalThis.Image;
		try {
			globalThis.Image = class {
				naturalWidth = 200;
				naturalHeight = 400;
				width = 200;
				height = 400;
				onload?: () => void;
				set src(_val: string) {
					queueMicrotask(() => this.onload?.());
				}
			} as unknown as typeof Image;
			globalThis.document = {
				createElement: (tag: string) => {
					if (tag === "canvas") {
						const ctx = {
							globalCompositeOperation: "source-over",
							clearRect() {},
							drawImage(_img: unknown, x: number, y: number) {
								drawCalls.push({
									x,
									y,
									op: ctx.globalCompositeOperation,
								});
							},
						};
						return {
							width: 0,
							height: 0,
							getContext: () => ctx,
							toDataURL: () => "data:image/png;base64,composed",
						};
					}
					return {};
				},
			} as unknown as Document;

			const resolvedFiles: string[] = [];
			const composed = await sm.composeSurfaceElements(
				0,
				"data:image/png;base64,base",
				async (file) => {
					resolvedFiles.push(file);
					return `data:image/png;base64,${file}`;
				},
				0,
				[{ file: "blink.png", x: 3, y: 4, type: "add" }],
			);
			expect(composed).toBe("data:image/png;base64,composed");
			expect(resolvedFiles).toEqual([
				"eyes.png",
				"surface100.png",
				"blink.png",
			]);
			expect(drawCalls).toEqual([
				{ x: 0, y: 0, op: "source-over" },
				{ x: 10, y: 20, op: "source-over" },
				{ x: 5, y: 6, op: "source-over" },
				{ x: 3, y: 4, op: "lighter" },
			]);
		} finally {
			globalThis.document = origDocument;
			globalThis.Image = origImage;
		}

		sm.setScale(120, 120, 0);
		sm.setAlpha(80, 1);
		sm.setPosition(10, 20, 0);
		sm.setBaseMoveOffset(0, 15, -5);
		expect(sm.scales.get(0)).toEqual({ scaleX: 120, scaleY: 120 });
		expect(sm.alphas.get(1)).toBe(80);
		expect(sm.positions.get(0)).toEqual({ x: 10, y: 20 });
		expect(sm.getBaseMoveOffset(0)).toEqual({ x: 15, y: -5 });
		expect(sm.getBaseMoveOffset(2)).toEqual({ x: 0, y: 0 });
	});

	it("renderCollisionOverlay draws wireframe shapes, window layers, rect mode, and supports dynamic spec/layer registration", () => {
		const ops = {
			strokeRects: [] as number[][],
			ellipses: [] as number[][],
			moves: [] as number[][],
			lines: [] as number[][],
			strokes: 0,
			fillRects: 0,
			fills: 0,
			fillTexts: [] as Array<{ text: string; x: number; y: number }>,
		};

		const mockCanvas = {
			width: 240,
			height: 420,
			getContext: () => ({
				strokeStyle: "",
				fillStyle: "",
				lineWidth: 1,
				font: "",
				clearRect() {},
				setLineDash() {},
				beginPath() {},
				closePath() {},
				moveTo(x: number, y: number) {
					ops.moves.push([x, y]);
				},
				lineTo(x: number, y: number) {
					ops.lines.push([x, y]);
				},
				stroke() {
					ops.strokes += 1;
				},
				fill() {
					ops.fills += 1;
				},
				fillRect() {
					ops.fillRects += 1;
				},
				strokeRect(x: number, y: number, w: number, h: number) {
					ops.strokeRects.push([x, y, w, h]);
				},
				ellipse(cx: number, cy: number, rx: number, ry: number) {
					ops.ellipses.push([cx, cy, rx, ry]);
				},
				arc(cx: number, cy: number, r: number) {
					ops.ellipses.push([cx, cy, r, r]);
				},
				fillText(text: string, x: number, y: number) {
					ops.fillTexts.push({ text, x, y });
				},
			}),
		} as unknown as HTMLCanvasElement;

		renderCollisionOverlay(mockCanvas, {
			scale: 1,
			iconRect: [5, 5, 25, 25],
			points: {
				center_x: 120,
				center_y: 210,
				"future.anchor.x": 60,
				"future.anchor.y": 80,
			},
			collisions: [
				{ name: "Head", shape: { Rect: { x1: 10, y1: 10, x2: 50, y2: 40 } } },
				{ name: "Nose", shape: { Circle: { cx: 30, cy: 25, r: 5 } } },
				{
					name: "CheekBox",
					shape: { type: "ellipse", x1: 20, y1: 20, x2: 60, y2: 40 },
				},
				{
					name: "Ribbon",
					shape: {
						Polygon: {
							vertices: [
								[100, 100],
								[120, 100],
								[110, 120],
							],
						},
					},
				},
				{
					name: "RegionMask",
					shape: {
						Region: {
							file: "atari.png",
							r: 255,
							g: 0,
							b: 0,
							x1: 12,
							y1: 14,
							x2: 42,
							y2: 54,
						},
					},
				},
			],
		});

		expect(ops.fillRects).toBe(0);
		expect(ops.fills).toBe(0);
		expect(ops.strokeRects).toEqual([
			[1, 1, 238, 418], // window-bounds
			[5, 5, 20, 20], // icon-rect
			[10, 10, 40, 30], // Head Rect
			[12, 14, 30, 40], // RegionMask resolved bounds
		]);
		expect(ops.ellipses).toEqual([
			[30, 25, 5, 5], // Nose Circle
			[40, 30, 20, 10], // CheekBox bounding-box Ellipse converted to center-radius
		]);
		expect(ops.fillTexts.map((t) => t.text)).toEqual([
			"icon.rect",
			"point.center",
			"point.future.anchor",
			"Head",
			"Nose",
			"CheekBox",
			"Ribbon",
			"RegionMask",
		]);

		// mode: "rect" hides labels (\![enter,collisionmode,rect]) while keeping wireframes
		ops.fillTexts.length = 0;
		ops.strokeRects.length = 0;
		renderCollisionOverlay(mockCanvas, {
			mode: "rect",
			collisions: [
				{ name: "Head", shape: "rect", x1: 1, y1: 2, x2: 11, y2: 12 },
			],
		});
		expect(ops.fillTexts).toEqual([]);
		expect(ops.strokeRects).toEqual([
			[1, 1, 238, 418],
			[1, 2, 10, 10],
		]);

		// Dynamic future shape & layer registration works cleanly
		try {
			registerCollisionShapeSpec<{ cx: number; cy: number; size: number }>({
				kind: "diamond",
				normalize: (coords) => ({
					cx: Number(coords.cx ?? 0),
					cy: Number(coords.cy ?? 0),
					size: Number(coords.size ?? 10),
				}),
				stroke: (ctx, norm, scale) => {
					const s = norm.size * scale;
					ctx.strokeRect?.(
						norm.cx * scale - s / 2,
						norm.cy * scale - s / 2,
						s,
						s,
					);
				},
				getLabelAnchor: (norm, scale) => ({
					x: norm.cx * scale,
					y: norm.cy * scale,
				}),
			});
			registerCollisionOverlayLayer({
				id: "custom-window-guide",
				order: 15,
				strokeColor: "#6a1b9a",
				render: ({ ctx, options }) => {
					if (options.metadata?.guide) {
						ctx.strokeRect?.(2, 2, 10, 10);
					}
				},
			});

			ops.strokeRects.length = 0;
			ops.fillTexts.length = 0;
			renderCollisionOverlay(mockCanvas, {
				metadata: { guide: true },
				collisions: [
					{
						name: "FuturePart",
						shape: { Diamond: { cx: 50, cy: 60, size: 20 } },
					},
				],
			});
			expect(ops.strokeRects).toEqual([
				[1, 1, 238, 418],
				[2, 2, 10, 10],
				[40, 50, 20, 20],
			]);
			expect(ops.fillTexts.map((t) => t.text)).toEqual(["FuturePart"]);
		} finally {
			unregisterCollisionShapeSpec("diamond");
			unregisterCollisionOverlayLayer("custom-window-guide");
		}
	});
});
