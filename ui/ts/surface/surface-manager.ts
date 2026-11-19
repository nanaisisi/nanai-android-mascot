/**
 * @file surface-manager.ts
 * @brief SurfaceManager - surfaces.txt / ShellManifest 管理、着せ替え、合成、当たり判定統合マネージャー
 */

import { invoke, isTauriAvailable } from "../core/tauri-helper.js";
import { wasmBridge } from "../core/wasm-bridge.js";
import {
	bindAnimationIds,
	bindGroupsForScope,
	dressupKey,
	patternSurfaceFile,
	seedDressupDefaults,
} from "./bind-menu.js";
import {
	collisionRecord,
	getShellManifest,
	manifestToSurfaceData,
	parseSurfacesTextWithRust,
	type RawShellManifest,
} from "./shell-manifest.js";
import {
	type CollisionAreaRecord,
	type CollisionHitResult,
	type CursorDefinitionRecord,
	normalizeCollisionRecord,
	surfaceCollisionMethods,
} from "./surface-collision.js";
import {
	type ComposedLayerInput,
	composeSurfaceElements,
	drawComposedLayer,
	loadLayerImage,
	processChromaKey,
} from "./surface-compositor.js";

export { surfaceCollisionMethods } from "./surface-collision.js";

export interface SurfaceElementRecord {
	id?: number;
	type?: string;
	method?: string;
	file: string;
	x: number;
	y: number;
}

export interface SurfaceAnimationPatternRecord {
	surface?: string | number;
	wait?: number;
	waitMax?: number | null;
	type?: string;
	x?: number;
	y?: number;
	target_param?: string;
}

export interface SurfaceAnimationRecord {
	id: number;
	interval: string;
	name?: string;
	options?: string[];
	collisions?: CollisionAreaRecord[];
	patterns: SurfaceAnimationPatternRecord[];
}

export interface SurfaceLayerInput {
	file: string;
	x?: number;
	y?: number;
	type?: string;
}

export interface ShellManifestLike {
	directory?: string;
	descript?: {
		properties?: Record<string, string>;
		[key: string]: unknown;
	};
	sakura_bind_groups?: unknown[];
	kero_bind_groups?: unknown[];
	[key: string]: unknown;
}

interface WasmParsedSurfacesResult {
	elements?:
		| Map<string, Array<Record<string, unknown>>>
		| Record<string, Array<Record<string, unknown>>>;
	collisions?:
		| Map<string, Array<Record<string, unknown>>>
		| Record<string, Array<Record<string, unknown>>>;
	animations?:
		| Map<string, Array<Record<string, unknown>>>
		| Record<string, Array<Record<string, unknown>>>;
	collision_sort?: string;
	animation_sort?: string;
	points?: Record<string, unknown>;
	balloonOffsets?: Record<string, unknown>;
}

function entriesOf<V>(
	obj: Map<string, V> | Record<string, V> | null | undefined,
): Array<[string, V]> {
	if (!obj) return [];
	if (obj instanceof Map) return Array.from(obj.entries());
	if (typeof obj === "object") return Object.entries(obj);
	return [];
}

interface AppSurfaceHost {
	ghostController?: {
		currentGhost?: { name?: string; path?: string } | null;
		currentShell?: string;
		updateSurface?: (
			surfaceId: number | string,
			scopeId?: number,
			extraLayers?: unknown[] | null,
		) => Promise<unknown>;
		sendShioriEvent?: (event: string, args?: unknown[]) => Promise<unknown>;
	};
}

function expandRangeValues(rangeStr: string): string[] {
	const included: string[] = [];
	const excluded = new Set<string>();

	for (const rawPart of String(rangeStr ?? "").split(",")) {
		let part = rawPart.trim().replace(/^\[/, "").replace(/\]$/, "");
		if (!part) continue;

		const isExclude = part.startsWith("!");
		if (isExclude) {
			part = part.slice(1).trim();
		}

		if (part.includes("-")) {
			const [sStr, eStr] = part.split("-");
			const start = Number.parseInt(sStr, 10);
			const end = Number.parseInt(eStr, 10);
			if (!Number.isNaN(start) && !Number.isNaN(end) && start <= end) {
				for (let i = start; i <= end; i++) {
					if (isExclude) excluded.add(String(i));
					else included.push(String(i));
				}
				continue;
			}
		}

		const num = Number.parseInt(part, 10);
		if (!Number.isNaN(num)) {
			if (isExclude) excluded.add(String(num));
			else included.push(String(num));
		} else if (!isExclude && part.length > 0) {
			included.push(part);
		}
	}

	if (excluded.size === 0) return included;
	return included.filter((id) => !excluded.has(id));
}

interface BindGroupRecord {
	category: string;
	part: string;
	number: number;
	add_ids: number[];
}

const getBindAnimIds = bindAnimationIds as (
	number: number,
	addIds?: number[],
) => number[];

function normalizeParsedCollision(
	raw: Record<string, unknown>,
): CollisionAreaRecord {
	return normalizeCollisionRecord(raw) ?? (raw as CollisionAreaRecord);
}

function preprocessSurfacesTxtForWasm(text: string): string {
	return text
		.replace(/\r\n?/g, "\n")
		.replace(
			/^(\s*)(?:(?:sakura|kero|char\d+)\.)?surface(\.append)?(?:\[([^\]]+)\]|([^\s{]+))?\s*(\{)?/gim,
			(
				_m,
				indent: string,
				append: string | undefined,
				bracketSpec: string | undefined,
				plainSpec: string | undefined,
				brace: string | undefined,
			) => {
				const spec = (bracketSpec ?? plainSpec ?? "").trim();
				if (!spec) return _m;
				const header = `${indent}surface${append ?? ""}${spec}`;
				return brace ? `${header}\n{` : header;
			},
		);
}

export {
	expandRangeValues as expandSurfaceRange,
	parseSurfacesTxtFallback as parseSurfacesTxt,
};

function parseCollisionFallbackLine(
	trimmed: string,
	currentSurfaces: string[],
	collisions: Record<string, CollisionAreaRecord[]>,
) {
	const lower = trimmed.toLowerCase();
	const parts = trimmed.split(",").map((s) => s.trim());
	let rec: CollisionAreaRecord | null = null;

	if (lower.startsWith("collisionex") && parts.length >= 3) {
		const idMatch = parts[0].match(/\d+/);
		const id = idMatch ? Number.parseInt(idMatch[0], 10) : 0;
		const name = parts[1];
		const kind = parts[2].toLowerCase();
		if ((kind === "rect" || kind === "box") && parts.length >= 7) {
			rec = collisionRecord({
				id,
				name,
				shape: {
					Rect: {
						x1: Number.parseInt(parts[3], 10) || 0,
						y1: Number.parseInt(parts[4], 10) || 0,
						x2: Number.parseInt(parts[5], 10) || 0,
						y2: Number.parseInt(parts[6], 10) || 0,
					},
				},
			}) as CollisionAreaRecord;
		} else if (kind === "circle" && parts.length >= 6) {
			rec = collisionRecord({
				id,
				name,
				shape: {
					Circle: {
						cx: Number.parseInt(parts[3], 10) || 0,
						cy: Number.parseInt(parts[4], 10) || 0,
						r: Number.parseInt(parts[5], 10) || 0,
					},
				},
			}) as CollisionAreaRecord;
		} else if (kind === "ellipse" && parts.length >= 7) {
			rec = collisionRecord({
				id,
				name,
				shape: {
					Ellipse: {
						cx: Number.parseInt(parts[3], 10) || 0,
						cy: Number.parseInt(parts[4], 10) || 0,
						rx: Number.parseInt(parts[5], 10) || 0,
						ry: Number.parseInt(parts[6], 10) || 0,
					},
				},
			}) as CollisionAreaRecord;
		} else if (kind === "polygon") {
			const vertices: [number, number][] = [];
			for (let i = 3; i + 1 < parts.length; i += 2) {
				const vx = Number.parseInt(parts[i], 10);
				const vy = Number.parseInt(parts[i + 1], 10);
				if (!Number.isNaN(vx) && !Number.isNaN(vy)) {
					vertices.push([vx, vy]);
				}
			}
			if (vertices.length >= 3) {
				rec = collisionRecord({
					id,
					name,
					shape: { Polygon: { vertices } },
				}) as CollisionAreaRecord;
			}
		}
	} else if (lower.startsWith("collision") && parts.length >= 6) {
		const idMatch = parts[0].match(/\d+/);
		const id = idMatch ? Number.parseInt(idMatch[0], 10) : 0;
		rec = collisionRecord({
			id,
			name: parts[5],
			shape: {
				Rect: {
					x1: Number.parseInt(parts[1], 10) || 0,
					y1: Number.parseInt(parts[2], 10) || 0,
					x2: Number.parseInt(parts[3], 10) || 0,
					y2: Number.parseInt(parts[4], 10) || 0,
				},
			},
		}) as CollisionAreaRecord;
	}

	if (!rec) return;
	for (const sid of currentSurfaces) {
		if (!collisions[sid]) collisions[sid] = [];
		collisions[sid].push({ ...rec });
	}
}

function parseSurfacesTxtFallback(text: string) {
	const collisions: Record<string, CollisionAreaRecord[]> = {};
	const elements: Record<string, SurfaceElementRecord[]> = {};
	const animations: Record<string, SurfaceAnimationRecord[]> = {};
	const points: Record<string, Record<string, unknown>> = {};
	const balloonOffsets: Record<
		string,
		Record<string, { x?: number; y?: number }>
	> = {};
	const aliases: Record<string, number[]> = {};
	const keroAliases: Record<string, number[]> = {};
	const charAliases: Record<number, Record<string, number[]>> = {};
	const cursors: Record<string, CursorDefinitionRecord[]> = {};
	const tooltips: Record<string, Record<string, string>> = {};
	const names: Record<string, string> = {};
	const iconRects: Record<string, number[]> = {};
	let collisionSort = "none";
	let animationSort = "none";

	let currentSurfaces = ["default"];
	let blockType: "surface" | "alias" | "cursor" | "tooltip" | null = null;
	let blockScope = "sakura";

	for (const rawLine of text.split(/\r?\n/)) {
		const trimmed = rawLine.trim();
		if (!trimmed || trimmed.startsWith("//") || trimmed === "{") continue;
		if (trimmed === "}") {
			blockType = null;
			continue;
		}

		const sortMatch = trimmed.match(
			/^(collision[.-]sort|animation[.-]sort)\s*,\s*(\S+)/i,
		);
		if (sortMatch) {
			if (sortMatch[1].toLowerCase().startsWith("collision")) {
				collisionSort = sortMatch[2].toLowerCase();
			} else {
				animationSort = sortMatch[2].toLowerCase();
			}
			continue;
		}

		const aliasMatch = trimmed.match(
			/^(?:(sakura|kero|char\d+)\.)?surface\.alias\s*\{?$/i,
		);
		if (aliasMatch) {
			const rawScope = (aliasMatch[1] || "sakura").toLowerCase();
			blockType = "alias";
			blockScope =
				rawScope === "char1"
					? "kero"
					: rawScope === "char0"
						? "sakura"
						: rawScope;
			continue;
		}

		const cursorMatch = trimmed.match(
			/^(?:(sakura|kero|char\d+)\.)?cursor\s*\{?$/i,
		);
		if (cursorMatch) {
			const rawScope = (cursorMatch[1] || "*").toLowerCase();
			blockType = "cursor";
			blockScope =
				rawScope === "char0"
					? "sakura"
					: rawScope === "char1"
						? "kero"
						: rawScope;
			if (!cursors[blockScope]) cursors[blockScope] = [];
			continue;
		}

		const tooltipMatch = trimmed.match(
			/^(?:(sakura|kero|char\d+)\.)?tooltips\s*\{?$/i,
		);
		if (tooltipMatch) {
			const rawScope = (tooltipMatch[1] || "*").toLowerCase();
			blockType = "tooltip";
			blockScope =
				rawScope === "char0"
					? "sakura"
					: rawScope === "char1"
						? "kero"
						: rawScope;
			if (!tooltips[blockScope]) tooltips[blockScope] = {};
			continue;
		}

		if (blockType === "alias") {
			const idx = trimmed.indexOf(",");
			if (idx !== -1) {
				const aliasName = trimmed.slice(0, idx).trim();
				const nums = expandRangeValues(trimmed.slice(idx + 1))
					.map((v) => Number.parseInt(v, 10))
					.filter((n) => !Number.isNaN(n));
				if (aliasName && nums.length > 0) {
					if (blockScope === "sakura") aliases[aliasName] = nums;
					else if (blockScope === "kero") keroAliases[aliasName] = nums;
					else if (blockScope.startsWith("char")) {
						const cid = Number.parseInt(blockScope.slice(4), 10);
						if (!Number.isNaN(cid)) {
							if (!charAliases[cid]) charAliases[cid] = {};
							charAliases[cid][aliasName] = nums;
						}
					}
				}
			}
			continue;
		}

		if (blockType === "cursor") {
			const parts = trimmed.split(",").map((s) => s.trim());
			if (parts.length >= 3) {
				cursors[blockScope].push({
					event: parts[0],
					collision: parts[1],
					cursor: parts[2],
				});
			}
			continue;
		}

		if (blockType === "tooltip") {
			const idx = trimmed.indexOf(",");
			if (idx !== -1) {
				const key = trimmed.slice(0, idx).trim();
				const val = trimmed.slice(idx + 1).trim();
				if (key) tooltips[blockScope][key] = val;
			}
			continue;
		}

		const surfaceMatch = trimmed.match(
			/^(?:(?:sakura|kero|char\d+)\.)?surface(?:\.append)?(?:\[([^\]]+)\]|([0-9,\-!]+))(?:\s*\{.*)?$/i,
		);
		if (surfaceMatch) {
			blockType = "surface";
			const rangeSpec = surfaceMatch[1] ?? surfaceMatch[2] ?? "";
			currentSurfaces = expandRangeValues(rangeSpec);
			for (const s of currentSurfaces) {
				if (!collisions[s]) collisions[s] = [];
			}
			continue;
		}

		const lower = trimmed.toLowerCase();
		if (lower.startsWith("name,")) {
			const defName = trimmed.slice(trimmed.indexOf(",") + 1).trim();
			for (const s of currentSurfaces) {
				names[s] = defName;
			}
		} else if (lower.startsWith("icon.rect,")) {
			const coords = trimmed
				.slice(trimmed.indexOf(",") + 1)
				.split(",")
				.map((n) => Number.parseInt(n.trim(), 10))
				.filter((n) => !Number.isNaN(n));
			if (coords.length >= 4) {
				const rect = [coords[0], coords[1], coords[2], coords[3]];
				for (const s of currentSurfaces) iconRects[s] = rect;
			}
		} else if (lower.startsWith("collision")) {
			parseCollisionFallbackLine(trimmed, currentSurfaces, collisions);
		} else if (lower.startsWith("element")) {
			const parts = trimmed.split(",").map((s) => s.trim());
			if (parts.length >= 5) {
				const idMatch = parts[0].match(/\d+/);
				const id = idMatch ? Number.parseInt(idMatch[0], 10) : 0;
				const method = parts[1].toLowerCase();
				const file = parts[2];
				const x = Number.parseInt(parts[3], 10) || 0;
				const y = Number.parseInt(parts[4], 10) || 0;
				for (const s of currentSurfaces) {
					if (!elements[s]) elements[s] = [];
					elements[s].push({ id, type: method, method, file, x, y });
				}
			}
		} else if (lower.startsWith("point.")) {
			const parts = trimmed.split(",").map((s) => s.trim());
			if (parts.length >= 2) {
				const key = parts[0].slice("point.".length);
				const val = Number.parseInt(parts[1], 10);
				for (const s of currentSurfaces) {
					if (!points[s]) points[s] = {};
					points[s][key] = Number.isNaN(val) ? parts[1] : val;
				}
			}
		} else if (
			lower.startsWith("balloon.offset") ||
			/^[a-z0-9_]+\.balloon\.offset/i.test(lower)
		) {
			const parts = trimmed.split(",").map((s) => s.trim());
			if (parts.length >= 2) {
				const keyPart = parts[0].toLowerCase();
				const scope = keyPart.startsWith("kero.")
					? "kero"
					: keyPart.startsWith("sakura.")
						? "sakura"
						: "*";
				const axis = keyPart.endsWith("x")
					? "x"
					: keyPart.endsWith("y")
						? "y"
						: null;
				const val = Number.parseInt(parts[1], 10);
				if (axis && !Number.isNaN(val)) {
					for (const s of currentSurfaces) {
						if (!balloonOffsets[s]) balloonOffsets[s] = {};
						if (!balloonOffsets[s][scope]) balloonOffsets[s][scope] = {};
						balloonOffsets[s][scope][axis] = val;
					}
				}
			}
		}
	}

	return {
		collisions,
		elements,
		animations,
		points,
		balloonOffsets,
		aliases,
		keroAliases,
		charAliases,
		cursors,
		tooltips,
		names,
		iconRects,
		collisionSort,
		animationSort,
	};
}

export class SurfaceManager {
	declare resolveSurfaceNumber: (
		surfaceId: number | string | null | undefined,
		scopeId?: number,
	) => number | string;
	declare detectCollision: (
		clickX: number,
		clickY: number,
		targetRect: unknown,
		surfaceId?: number | string | null,
		scopeId?: number,
	) => CollisionHitResult;
	declare getCursorForCollision: (
		scopeId: number | string,
		eventType: string,
		collisionName: string,
	) => string | null;
	declare getTooltipForCollision: (
		scopeId: number | string,
		collisionName: string,
	) => string | null;
	declare findHitCollisionName: (
		collisions: unknown[],
		x: number,
		y: number,
	) => string | null;

	app: unknown;
	collisions: Record<string, CollisionAreaRecord[]>;
	elements: Record<string, SurfaceElementRecord[]>;
	animations: Record<string, SurfaceAnimationRecord[]>;
	points: Record<string, unknown>;
	balloonOffsets: Record<string, unknown>;
	aliases: Record<string, number[]>;
	keroAliases: Record<string, number[]>;
	charAliases: Record<number | string, Record<string, number[]>>;
	cursors: Record<string, CursorDefinitionRecord[]>;
	tooltips: Record<string, Record<string, string>>;
	names: Record<string, string>;
	iconRects: Record<string, number[]>;
	collisionSort: string;
	animationSort: string;
	baseWidth: number;
	baseHeight: number;
	currentSurfaceIds: Map<number, number | string>;
	chromaKeyCache: Map<string, string>;
	dressupState: Map<string, boolean>;
	dressupStateVersion: number;
	shellManifest: ShellManifestLike | null;
	shellPath: string;
	planCache: Map<string, unknown>;
	baseCanvasCache: Map<string, HTMLCanvasElement>;
	scales: Map<number, { scaleX: number; scaleY: number }>;
	alphas: Map<number, number>;
	positions: Map<number, { x: number; y: number }>;
	baseMoveOffsets: Map<number, { x: number; y: number }>;
	private _activeBindAnimationIdsCache: Map<
		number,
		{ version: number; ids: number[] }
	>;

	constructor(app: unknown = null) {
		this.app = app;
		this.collisions = {};
		this.elements = {};
		this.animations = {};
		this.points = {};
		this.balloonOffsets = {};
		this.aliases = {};
		this.keroAliases = {};
		this.charAliases = {};
		this.cursors = {};
		this.tooltips = {};
		this.names = {};
		this.iconRects = {};
		this.collisionSort = "none";
		this.animationSort = "none";
		this.baseWidth = 200;
		this.baseHeight = 400;
		this.currentSurfaceIds = new Map<number, number | string>([
			[0, 0],
			[1, 10],
		]);
		this.chromaKeyCache = new Map();
		this.dressupStateVersion = 0;
		this.dressupState = new Map();
		this._activeBindAnimationIdsCache = new Map();

		const originalSet = this.dressupState.set.bind(this.dressupState);
		this.dressupState.set = (key: string, value: boolean) => {
			this.dressupStateVersion++;
			this._activeBindAnimationIdsCache.clear();
			return originalSet(key, value);
		};
		const originalDelete = this.dressupState.delete.bind(this.dressupState);
		this.dressupState.delete = (key: string) => {
			this.dressupStateVersion++;
			this._activeBindAnimationIdsCache.clear();
			return originalDelete(key);
		};
		const originalClear = this.dressupState.clear.bind(this.dressupState);
		this.dressupState.clear = () => {
			this.dressupStateVersion++;
			this._activeBindAnimationIdsCache.clear();
			originalClear();
		};

		this.shellManifest = null;
		this.shellPath = "";
		this.planCache = new Map();
		this.baseCanvasCache = new Map();
		this.scales = new Map();
		this.alphas = new Map();
		this.positions = new Map();
		this.baseMoveOffsets = new Map();
	}

	get currentSurfaceId(): number | string {
		return this.currentSurfaceIds.get(0) ?? 0;
	}

	currentSurfaceIdFor(scopeId = 0): number | string {
		return this.currentSurfaceIds.get(scopeId) ?? (scopeId === 1 ? 10 : 0);
	}

	setSurfaceId(surfaceId: number | string, scopeId = 0): void {
		this.currentSurfaceIds.set(scopeId, surfaceId);
	}

	load(): void {}

	render(): void {}

	expandSurfaceRange(rangeStr: string): string[] {
		return expandRangeValues(rangeStr);
	}

	async loadSurfacesTxt(
		ghostPath: string,
		shellName = "master",
	): Promise<void> {
		if (!ghostPath) return;
		try {
			const cleanPath = ghostPath.replace(/[/\\]+$/, "");
			let basePath = cleanPath;
			let shell = shellName;
			const shellMatch = cleanPath.match(/[/\\]shell[/\\]([^/\\]+)$/);
			if (shellMatch && shellMatch.index !== undefined) {
				basePath = cleanPath.slice(0, shellMatch.index);
				shell = shellMatch[1];
			}
			const ghostName = basePath.split(/[\\/]/).filter(Boolean).pop() || "";
			this.shellPath = `${basePath}/shell/${shell}`;

			if (isTauriAvailable()) {
				const manifest = await getShellManifest(ghostName, shell);
				if (manifest) {
					this.applyShellManifest(manifest);
					return;
				}
			}

			let content = "";
			const surfacesPath = `${basePath}/shell/${shell}/surfaces.txt`;
			if (isTauriAvailable()) {
				try {
					content = await invoke<string>("open_file", { path: surfacesPath });
				} catch (_err) {
					if (typeof fetch === "function") {
						const res = await fetch(surfacesPath);
						if (res.ok) content = await res.text();
					}
				}
			} else if (typeof fetch === "function") {
				const res = await fetch(surfacesPath);
				if (res.ok) content = await res.text();
			}

			if (content) {
				await this.parseSurfacesTxt(content);
			}
		} catch (err) {
			console.warn(
				"surfaces.txt 読み込みスキップ (デフォルト設定を使用):",
				err,
			);
		}
	}

	applyShellManifest(manifest: RawShellManifest | unknown): void {
		if (!manifest || typeof manifest !== "object") return;
		const data = manifestToSurfaceData(manifest as RawShellManifest);
		this.collisions =
			(data.collisions as Record<string, CollisionAreaRecord[]>) ?? {};
		this.elements =
			(data.elements as Record<string, SurfaceElementRecord[]>) ?? {};
		this.animations =
			(data.animations as Record<string, SurfaceAnimationRecord[]>) ?? {};
		this.points = (data.points as Record<string, unknown>) ?? {};
		this.balloonOffsets =
			(data.balloonOffsets as Record<string, unknown>) ?? {};
		this.aliases = (data.aliases as Record<string, number[]>) ?? {};
		this.keroAliases = (data.keroAliases as Record<string, number[]>) ?? {};
		this.charAliases =
			(data.charAliases as Record<number | string, Record<string, number[]>>) ??
			{};
		this.cursors =
			(data.cursors as Record<string, CursorDefinitionRecord[]>) ?? {};
		this.tooltips =
			(data.tooltips as Record<string, Record<string, string>>) ?? {};
		this.names = (data.names as Record<string, string>) ?? {};
		this.iconRects = (data.iconRects as Record<string, number[]>) ?? {};
		this.collisionSort = data.collisionSort ?? "none";
		this.animationSort = data.animationSort ?? "none";
		this.shellManifest = manifest as ShellManifestLike;
		if (this.shellManifest.directory) {
			this.shellPath = String(this.shellManifest.directory);
		}
		this.planCache.clear();
		this.baseCanvasCache.clear();
		this._activeBindAnimationIdsCache.clear();

		seedDressupDefaults(manifest as Record<string, unknown>, this.dressupState);
	}

	async parseSurfacesTxt(text: string): Promise<void> {
		this.planCache.clear();
		this.baseCanvasCache.clear();
		if (!text || typeof text !== "string") return;

		const supplementary = parseSurfacesTxtFallback(text);
		const wasmInput = preprocessSurfacesTxtForWasm(text);

		if (isTauriAvailable()) {
			const rustData = await parseSurfacesTextWithRust(wasmInput);
			if (rustData) {
				this.collisions =
					(rustData.collisions as Record<string, CollisionAreaRecord[]>) ?? {};
				this.elements =
					(rustData.elements as Record<string, SurfaceElementRecord[]>) ?? {};
				this.animations =
					(rustData.animations as Record<string, SurfaceAnimationRecord[]>) ??
					{};
				this.points =
					Object.keys(rustData.points ?? {}).length > 0
						? (rustData.points as Record<string, unknown>)
						: supplementary.points;
				this.balloonOffsets =
					Object.keys(rustData.balloonOffsets ?? {}).length > 0
						? (rustData.balloonOffsets as Record<string, unknown>)
						: supplementary.balloonOffsets;
				this.aliases = supplementary.aliases;
				this.keroAliases = supplementary.keroAliases;
				this.charAliases = supplementary.charAliases;
				this.cursors = supplementary.cursors;
				this.tooltips = supplementary.tooltips;
				this.names = supplementary.names;
				this.iconRects = supplementary.iconRects;
				this.collisionSort = supplementary.collisionSort;
				this.animationSort = supplementary.animationSort;
				return;
			}
		}

		const wasmData = wasmBridge.parseSurfacesTxt(
			wasmInput,
		) as WasmParsedSurfacesResult | null;
		if (wasmData) {
			const normalizedCollisions: Record<string, CollisionAreaRecord[]> = {};
			for (const [sid, list] of entriesOf(wasmData.collisions)) {
				normalizedCollisions[sid] = Array.isArray(list)
					? list.map(normalizeParsedCollision)
					: [];
			}

			const normalizedElements: Record<string, SurfaceElementRecord[]> = {};
			for (const [sid, list] of entriesOf(wasmData.elements)) {
				normalizedElements[sid] = Array.isArray(list)
					? list.map((e, idx) => ({
							id: Number(e.id ?? idx),
							type: String(e.method ?? e.type ?? "overlay").toLowerCase(),
							method: String(e.method ?? e.type ?? "overlay").toLowerCase(),
							file: String(e.file ?? ""),
							x: Number(e.x ?? 0),
							y: Number(e.y ?? 0),
						}))
					: [];
			}

			const normalizedAnimations: Record<string, SurfaceAnimationRecord[]> = {};
			for (const [sid, list] of entriesOf(wasmData.animations)) {
				normalizedAnimations[sid] = Array.isArray(list)
					? (list as unknown as SurfaceAnimationRecord[])
					: [];
			}

			this.collisions = normalizedCollisions;
			this.elements = normalizedElements;
			this.animations = normalizedAnimations;
			this.points =
				(wasmData.points as Record<string, unknown>) ?? supplementary.points;
			this.balloonOffsets =
				(wasmData.balloonOffsets as Record<string, unknown>) ??
				supplementary.balloonOffsets;
			this.aliases = supplementary.aliases;
			this.keroAliases = supplementary.keroAliases;
			this.charAliases = supplementary.charAliases;
			this.cursors = supplementary.cursors;
			this.tooltips = supplementary.tooltips;
			this.names = supplementary.names;
			this.iconRects = supplementary.iconRects;
			this.collisionSort = String(
				wasmData.collision_sort || supplementary.collisionSort || "none",
			).toLowerCase();
			this.animationSort = String(
				wasmData.animation_sort || supplementary.animationSort || "none",
			).toLowerCase();
			return;
		}

		this.collisions = supplementary.collisions;
		this.elements = supplementary.elements;
		this.animations = supplementary.animations;
		this.points = supplementary.points;
		this.balloonOffsets = supplementary.balloonOffsets;
		this.aliases = supplementary.aliases;
		this.keroAliases = supplementary.keroAliases;
		this.charAliases = supplementary.charAliases;
		this.cursors = supplementary.cursors;
		this.tooltips = supplementary.tooltips;
		this.names = supplementary.names;
		this.iconRects = supplementary.iconRects;
		this.collisionSort = supplementary.collisionSort;
		this.animationSort = supplementary.animationSort;
	}

	processChromaKey(
		imageSrc: string,
		pnaSrc: string | null = null,
	): Promise<string> {
		const props = this.shellManifest?.descript?.properties;
		const useSelfAlpha =
			props?.["seriko.use_self_alpha"] === "1" ||
			props?.["seriko.use_self_alpha"]?.toLowerCase() === "true";
		const paintTransparentRegionBlack =
			props?.["seriko.paint_transparent_region_black"] === "1" ||
			props?.["seriko.paint_transparent_region_black"]?.toLowerCase() ===
				"true";
		return processChromaKey(imageSrc, pnaSrc, this.chromaKeyCache, {
			useSelfAlpha,
			paintTransparentRegionBlack,
		});
	}

	activeBindAnimationIds(scopeId = 0): number[] {
		if (!this.shellManifest) return [];
		const cached = this._activeBindAnimationIdsCache.get(scopeId);
		if (cached && cached.version === this.dressupStateVersion) {
			return cached.ids;
		}

		const groups = bindGroupsForScope(
			this.shellManifest as Record<string, unknown>,
			scopeId,
		) as BindGroupRecord[];
		const ids = groups
			.filter((group) =>
				this.dressupState.get(dressupKey(scopeId, group.category, group.part)),
			)
			.flatMap((group) => getBindAnimIds(group.number, group.add_ids))
			.sort((a: number, b: number) => a - b);

		this._activeBindAnimationIdsCache.set(scopeId, {
			version: this.dressupStateVersion,
			ids,
		});
		return ids;
	}

	activeBindLayers(
		scopeId = 0,
		surfaceId: number | string | null = null,
	): SurfaceLayerInput[] {
		if (!this.shellManifest) return [];
		const sid = String(surfaceId ?? this.currentSurfaceIdFor(scopeId));
		const animList = this.animations[sid] ?? [];
		const animById = new Map<string, SurfaceAnimationRecord>(
			animList.map((a) => [String(a.id), a]),
		);

		const layers: SurfaceLayerInput[] = [];
		const activeIds = new Set<number>(this.activeBindAnimationIds(scopeId));
		const insertedIds = new Set<number>();

		for (const animId of activeIds) {
			const anim = animById.get(String(animId));
			for (const p of anim?.patterns ?? []) {
				if (String(p.type || "").toLowerCase() === "insert") {
					const targetId = Number.parseInt(String(p.surface).trim(), 10);
					if (!Number.isNaN(targetId)) {
						insertedIds.add(targetId);
					}
				}
			}
		}

		const visited = new Set<number>();
		const expandAnim = (id: number) => {
			if (visited.has(id)) return;
			visited.add(id);
			const anim = animById.get(String(id));
			if (!anim) return;
			for (const pattern of anim.patterns ?? []) {
				const typeLower = String(pattern.type || "overlay").toLowerCase();
				if (typeLower === "insert") {
					const childId = Number.parseInt(String(pattern.surface).trim(), 10);
					if (!Number.isNaN(childId) && activeIds.has(childId)) {
						expandAnim(childId);
					}
				} else {
					const file = patternSurfaceFile(
						this.resolveSurfaceNumber(pattern.surface, scopeId),
					);
					if (file) {
						layers.push({
							file,
							x: pattern.x ?? 0,
							y: pattern.y ?? 0,
							type: typeLower,
						});
					}
				}
			}
		};

		const groups = bindGroupsForScope(
			this.shellManifest as Record<string, unknown>,
			scopeId,
		) as BindGroupRecord[];
		for (const group of groups) {
			if (
				!this.dressupState.get(dressupKey(scopeId, group.category, group.part))
			) {
				continue;
			}
			for (const animId of getBindAnimIds(group.number, group.add_ids)) {
				if (!insertedIds.has(animId)) {
					expandAnim(animId);
				}
			}
		}
		return layers;
	}

	async composeSurfaceElements(
		surfaceId: number | string,
		baseImgSrc: string,
		resolveImagePath?: (file: string) => Promise<string | null>,
		scopeId = 0,
		frameLayers: SurfaceLayerInput[] | null = null,
	): Promise<string> {
		if (!baseImgSrc) return baseImgSrc || "";
		const sid = String(surfaceId);
		const numericSid = Number(surfaceId);

		const elementList =
			this.elements[sid] || (scopeId === 0 ? this.elements.default : []) || [];

		const wasmElements = elementList.map((el, idx) => ({
			id: Number(el.id ?? idx),
			file: String(el.file ?? ""),
			method: String(el.method ?? el.type ?? "overlay").toLowerCase(),
			x: Number(el.x ?? 0),
			y: Number(el.y ?? 0),
		}));

		const plan = composeSurfaceElements(
			Number.isFinite(numericSid) ? numericSid : 0,
			wasmElements,
			[],
		);

		const elementLayers: SurfaceLayerInput[] = plan?.layers
			? plan.layers.map((l) => ({
					file: l.file,
					x: l.x ?? 0,
					y: l.y ?? 0,
					type: String(l.method || "overlay").toLowerCase(),
				}))
			: elementList
					.filter(
						(el) =>
							String(el.type ?? el.method ?? "overlay").toLowerCase() !==
							"base",
					)
					.map((el) => ({
						file: el.file,
						x: el.x ?? 0,
						y: el.y ?? 0,
						type: String(el.type ?? el.method ?? "overlay").toLowerCase(),
					}));

		const bindLayers =
			scopeId === 0 || scopeId === 1 ? this.activeBindLayers(scopeId, sid) : [];
		const extraLayers = Array.isArray(frameLayers) ? frameLayers : [];
		const allLayers = [...elementLayers, ...bindLayers, ...extraLayers].filter(
			(l) => Boolean(l?.file),
		);

		if (allLayers.length === 0) {
			return baseImgSrc;
		}

		if (
			typeof document === "undefined" ||
			typeof document.createElement !== "function" ||
			typeof Image === "undefined" ||
			typeof resolveImagePath !== "function"
		) {
			return baseImgSrc;
		}

		try {
			const [baseImg, ...layerImgs] = await Promise.all([
				loadLayerImage(baseImgSrc),
				...allLayers.map((layer) =>
					resolveImagePath(layer.file).then((resolved) =>
						resolved ? loadLayerImage(resolved) : null,
					),
				),
			]);
			if (!baseImg) return baseImgSrc;

			const width =
				baseImg.naturalWidth || baseImg.width || this.baseWidth || 200;
			const height =
				baseImg.naturalHeight || baseImg.height || this.baseHeight || 400;
			const canvas = document.createElement("canvas");
			canvas.width = width;
			canvas.height = height;
			const ctx = canvas.getContext("2d");
			if (!ctx) return baseImgSrc;

			ctx.drawImage(baseImg, 0, 0);
			for (let i = 0; i < allLayers.length; i++) {
				const img = layerImgs[i];
				if (img) {
					drawComposedLayer(ctx, img, allLayers[i] as ComposedLayerInput);
				}
			}
			return canvas.toDataURL("image/png");
		} catch (err) {
			console.warn("⚠️ [SurfaceManager] composeSurfaceElements エラー:", err);
			return baseImgSrc;
		}
	}

	async bindDressup(
		category: string,
		part = "",
		statusVal = "",
		scopeId = 0,
		raiseEvent = true,
	): Promise<void> {
		const key = dressupKey(scopeId, category, part);
		let newStatus: boolean;
		if (statusVal === "1" || statusVal === "true") {
			newStatus = true;
		} else if (statusVal === "0" || statusVal === "false") {
			newStatus = false;
		} else {
			newStatus = !(this.dressupState.get(key) ?? false);
		}

		this.dressupState.set(key, newStatus);
		this.planCache.clear();
		this.baseCanvasCache.clear();

		const app = this.app as AppSurfaceHost | null | undefined;
		if (app?.ghostController?.updateSurface) {
			await app.ghostController.updateSurface(
				this.currentSurfaceIdFor(scopeId),
				scopeId,
			);
		}
		if (raiseEvent && app?.ghostController?.sendShioriEvent) {
			await app.ghostController
				.sendShioriEvent("OnDressupChanged", [
					category,
					part,
					newStatus ? 1 : 0,
					scopeId,
				])
				.catch(() => {});
		}
	}

	setScale(scaleX: number, scaleY: number = scaleX, scopeId = 0): void {
		this.scales.set(scopeId, { scaleX, scaleY });
	}

	setAlpha(alpha: number, scopeId = 0): void {
		this.alphas.set(scopeId, alpha);
	}

	setPosition(x: number, y: number, scopeId = 0): void {
		this.positions.set(scopeId, { x, y });
	}

	setBaseMoveOffset(scopeId = 0, x = 0, y = 0): void {
		this.baseMoveOffsets.set(scopeId, { x, y });
	}

	getBaseMoveOffset(scopeId = 0): { x: number; y: number } {
		return this.baseMoveOffsets.get(scopeId) ?? { x: 0, y: 0 };
	}

	stopAnimations(_scopeId = 0): void {}

	startAnimations(_surfaceId: number | string, _scopeId = 0): void {}

	playAnimationById(
		_animId: number | string,
		_scopeId = 0,
		_waitForComplete = false,
	): void {}

	pauseAnimationById(_animId: number | string, _scopeId = 0): void {}

	resumeAnimationById(_animId: number | string, _scopeId = 0): void {}

	stopAnimationById(_animId: number | string, _scopeId = 0): void {}

	setAnimationOffset(
		_animId: number | string,
		_x = 0,
		_y = 0,
		_scopeId = 0,
	): void {}

	waitForAnimation(_animId: number | string, _scopeId = 0): Promise<void> {
		return Promise.resolve();
	}

	onTalkEnd(_scopeId = 0): void {}

	onScriptEnd(_scopeId = 0): void {}

	onCharSpoken(_scopeId = 0): void {}

	isBindAnimationActive(
		scopeId = 0,
		animId: number | string | null = null,
		_surfaceId: number | string | null = null,
	): boolean {
		if (animId == null) return false;
		const targetId = Number(animId);
		if (Number.isNaN(targetId)) return false;
		return this.activeBindAnimationIds(scopeId).includes(targetId);
	}
}

Object.assign(SurfaceManager.prototype, surfaceCollisionMethods);
