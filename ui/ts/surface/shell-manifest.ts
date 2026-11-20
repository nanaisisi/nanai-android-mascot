/**
 * Rust パース済みシェルマニフェスト（`shell_manifest` Tauri コマンド）の消費モジュール
 */
import { invoke } from "../core/tauri-helper.js";
import type {
	CollisionArea,
	CollisionShape,
} from "../core/wasm/pkg/nanai_core.js";

export type EnumVariantInput =
	| string
	| number
	| Record<string, string | number | boolean | null | undefined>
	| null
	| undefined;

export type RawPolygonVertex = [number, number] | { x?: number; y?: number };

export type RawCollisionShape =
	| CollisionShape
	| { Rect: { x1?: number; y1?: number; x2?: number; y2?: number } }
	| { Circle: { cx?: number; cy?: number; r?: number } }
	| { Ellipse: { cx?: number; cy?: number; rx?: number; ry?: number } }
	| { Polygon: { vertices?: RawPolygonVertex[] } }
	| Record<string, unknown>;

export interface RawCollisionArea {
	id?: number | null;
	name?: string;
	shape?: RawCollisionShape | string;
}

export interface CollisionRectRecord {
	id?: number;
	name: string;
	shape: "rect";
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	minX: number;
	minY: number;
	maxX: number;
	maxY: number;
}

export interface CollisionCircleOrEllipseRecord {
	id?: number;
	name: string;
	shape: "circle" | "ellipse";
	cx: number;
	cy: number;
	rx: number;
	ry: number;
	minX: number;
	minY: number;
	maxX: number;
	maxY: number;
}

export interface CollisionPolygonRecord {
	id?: number;
	name: string;
	shape: "polygon";
	vertices: Array<[number, number]>;
	minX: number;
	minY: number;
	maxX: number;
	maxY: number;
}

export type NormalizedCollisionRecord =
	| CollisionRectRecord
	| CollisionCircleOrEllipseRecord
	| CollisionPolygonRecord;

export interface CollisionContainsInput {
	shape?: string | Record<string, unknown>;
	x1?: number;
	y1?: number;
	x2?: number;
	y2?: number;
	cx?: number;
	cy?: number;
	rx?: number;
	ry?: number;
	r?: number;
	vertices?: Array<[number, number] | { x?: number; y?: number }>;
	minX?: number;
	minY?: number;
	maxX?: number;
	maxY?: number;
}

export interface RawSurfaceElement {
	id?: number;
	method?: EnumVariantInput;
	file?: string;
	x?: number;
	y?: number;
	options?: string[];
}

export interface RawAnimationPattern {
	index?: number;
	surface?: number | string;
	wait?: number;
	wait_max?: number | null;
	method?: EnumVariantInput;
	x?: number;
	y?: number;
	options?: string[];
}

export interface RawSerikoAnimation {
	id?: number;
	interval?: EnumVariantInput;
	name?: string | null;
	collisions?: RawCollisionArea[];
	patterns?: RawAnimationPattern[];
	options?: string[][];
}

export interface RawSurfaceDefinition {
	name?: string | null;
	icon_rect?: number[] | null;
	collisions?: RawCollisionArea[];
	elements?: RawSurfaceElement[];
	animations?: Record<string | number, RawSerikoAnimation>;
	points?: Record<string, unknown>;
	balloon_offsets?: Record<string, unknown>;
	properties?: Record<string, string>;
}

export interface RawSurfaceManifestEntry {
	number: number;
	name?: string | null;
	definition?: RawSurfaceDefinition;
}

export interface RawBindGroup {
	number: number;
	category: string;
	part: string;
	thumbnail?: string | null;
	default?: boolean;
	add_ids?: number[];
}

export interface RawCursorDefinition {
	event: string;
	collision: string;
	cursor: string;
}

export interface RawSurfTableEntry {
	surface_id?: number;
	name?: string;
}

export interface RawSurfTableGroup {
	name?: string;
	entries?: RawSurfTableEntry[];
}

export interface RawSurfaceTable {
	charset?: string | null;
	version?: number;
	scope?: number | null;
	options?: string[][];
	groups?: RawSurfTableGroup[];
	properties?: Record<string, string>;
}

export interface RawShellManifest {
	name?: string;
	craftman?: string | null;
	directory?: string;
	descript?: { properties?: Record<string, string>; [key: string]: unknown };
	surfaces?: RawSurfaceManifestEntry[];
	aliases?: Record<string, number[]>;
	kero_aliases?: Record<string, number[]>;
	char_aliases?: Record<string | number, Record<string, number[]>>;
	surface_table?: RawSurfaceTable | null;
	sakura_bind_groups?: RawBindGroup[];
	kero_bind_groups?: RawBindGroup[];
	collision_sort?: EnumVariantInput;
	animation_sort?: EnumVariantInput;
	cursors?: Record<string, RawCursorDefinition[]>;
	tooltips?: Record<string, Record<string, string>>;
	[key: string]: unknown;
}

export interface ManifestSurfaceElement {
	id: number;
	type: string;
	file: string;
	x: number;
	y: number;
}

export interface ManifestAnimationPattern {
	surface: string;
	wait: number;
	waitMax: number | null;
	type: string;
	x: number;
	y: number;
}

export interface ManifestSurfaceAnimation {
	id: number;
	interval: string;
	collisions: NormalizedCollisionRecord[];
	patterns: ManifestAnimationPattern[];
}

export interface ManifestSurfaceData {
	collisions: Record<string, NormalizedCollisionRecord[]>;
	elements: Record<string, ManifestSurfaceElement[]>;
	animations: Record<string, ManifestSurfaceAnimation[]>;
	points: Record<string, Record<string, unknown>>;
	balloonOffsets: Record<string, Record<string, unknown>>;
	aliases: Record<string, number[]>;
	keroAliases: Record<string, number[]>;
	charAliases: Record<string | number, Record<string, number[]>>;
	collisionSort: string;
	animationSort: string;
	cursors: Record<string, RawCursorDefinition[]>;
	tooltips: Record<string, Record<string, string>>;
	names: Record<string, string>;
	iconRects: Record<string, number[]>;
}

const sortedElementsCache = new WeakMap<
	RawSurfaceElement[],
	RawSurfaceElement[]
>();
const sortedAnimationsCache = new WeakMap<
	RawSerikoAnimation[],
	RawSerikoAnimation[]
>();
const sortedPatternsCache = new WeakMap<
	RawAnimationPattern[],
	RawAnimationPattern[]
>();

export function enumToString(value: unknown): string {
	if (value == null) return "";
	if (typeof value === "string") return value.toLowerCase();
	if (typeof value === "object") {
		const [variant, val] = Object.entries(
			value as Record<string, unknown>,
		)[0] ?? ["", ""];
		const lower = variant.toLowerCase();
		if (val == null) return lower;
		return lower === "custom" ? String(val).toLowerCase() : `${lower},${val}`;
	}
	return String(value).toLowerCase();
}

export function intervalToString(value: unknown): string {
	const s = enumToString(value);
	return s === "yene" ? "\\e" : s;
}

export function methodToString(value: unknown): string {
	const s = enumToString(value);
	return s.startsWith("blend,") ? s.replace("blend,", "blend-") : s;
}

interface CollisionShapeCoords {
	vertices?: RawPolygonVertex[];
	cx?: number;
	cy?: number;
	rx?: number;
	ry?: number;
	r?: number;
	x1?: number;
	y1?: number;
	x2?: number;
	y2?: number;
}

function asShapeCoords(val: unknown): CollisionShapeCoords {
	return val && typeof val === "object" ? (val as CollisionShapeCoords) : {};
}

function parsePolygonVertex(p: RawPolygonVertex): [number, number] {
	if (Array.isArray(p)) {
		return [Number(p[0] ?? 0), Number(p[1] ?? 0)];
	}
	return [Number(p?.x ?? 0), Number(p?.y ?? 0)];
}

export function collisionRecord(area: {
	id?: number | null;
	name?: string;
	shape: { Polygon: { vertices?: RawPolygonVertex[] } };
}): CollisionPolygonRecord;
export function collisionRecord(area: {
	id?: number | null;
	name?: string;
	shape:
		| { Circle: { cx?: number; cy?: number; r?: number } }
		| { Ellipse: { cx?: number; cy?: number; rx?: number; ry?: number } };
}): CollisionCircleOrEllipseRecord;
export function collisionRecord(area: {
	id?: number | null;
	name?: string;
	shape: { Rect: { x1?: number; y1?: number; x2?: number; y2?: number } };
}): CollisionRectRecord;
export function collisionRecord(
	area: RawCollisionArea | CollisionArea | null | undefined,
): NormalizedCollisionRecord;
export function collisionRecord(
	area: RawCollisionArea | CollisionArea | null | undefined,
): NormalizedCollisionRecord {
	const shape = area?.shape;
	const id = area?.id != null ? Number(area.id) : undefined;
	const name = String(area?.name ?? "").toLowerCase();
	let kind = "rect";
	let coords: CollisionShapeCoords = {};

	if (shape && typeof shape === "object") {
		const shapeObj = shape as Record<string, unknown>;
		if ("Polygon" in shapeObj) {
			kind = "polygon";
			coords = asShapeCoords(shapeObj.Polygon);
		} else if ("Circle" in shapeObj) {
			kind = "circle";
			coords = asShapeCoords(shapeObj.Circle);
		} else if ("Ellipse" in shapeObj) {
			kind = "ellipse";
			coords = asShapeCoords(shapeObj.Ellipse);
		} else if ("Rect" in shapeObj) {
			coords = asShapeCoords(shapeObj.Rect);
		} else if (typeof shapeObj.shape === "string") {
			kind = shapeObj.shape.toLowerCase();
			coords = asShapeCoords(shapeObj);
		}
	}

	if (kind === "polygon") {
		const vertices = (coords.vertices ?? []).map(parsePolygonVertex);
		let minX = Infinity;
		let maxX = -Infinity;
		let minY = Infinity;
		let maxY = -Infinity;
		for (const [vx, vy] of vertices) {
			if (vx < minX) minX = vx;
			if (vx > maxX) maxX = vx;
			if (vy < minY) minY = vy;
			if (vy > maxY) maxY = vy;
		}
		return {
			id,
			name,
			shape: "polygon",
			vertices,
			minX: Number.isFinite(minX) ? minX : 0,
			minY: Number.isFinite(minY) ? minY : 0,
			maxX: Number.isFinite(maxX) ? maxX : 0,
			maxY: Number.isFinite(maxY) ? maxY : 0,
		};
	}
	if (kind === "circle" || kind === "ellipse") {
		const cx = Number(coords.cx ?? 0);
		const cy = Number(coords.cy ?? 0);
		const rx = Number(coords.rx ?? coords.r ?? 0);
		const ry = Number(coords.ry ?? coords.r ?? 0);
		return {
			id,
			name,
			shape: kind,
			cx,
			cy,
			rx,
			ry,
			minX: cx - rx,
			minY: cy - ry,
			maxX: cx + rx,
			maxY: cy + ry,
		};
	}
	const x1 = Number(coords.x1 ?? 0);
	const y1 = Number(coords.y1 ?? 0);
	const x2 = Number(coords.x2 ?? 0);
	const y2 = Number(coords.y2 ?? 0);
	return {
		id,
		name,
		shape: "rect",
		x1,
		y1,
		x2,
		y2,
		minX: Math.min(x1, x2),
		minY: Math.min(y1, y2),
		maxX: Math.max(x1, x2),
		maxY: Math.max(y1, y2),
	};
}

export function collisionContains(
	col: CollisionContainsInput | NormalizedCollisionRecord | null | undefined,
	x: number,
	y: number,
): boolean {
	if (!col) return false;

	if (
		col.minX != null &&
		col.maxX != null &&
		col.minY != null &&
		col.maxY != null
	) {
		if (x < col.minX || x > col.maxX || y < col.minY || y > col.maxY) {
			return false;
		}
	}

	if (col.shape === "polygon") {
		const rawVertices = col.vertices ?? [];
		if (rawVertices.length < 3) return false;
		const vertices = rawVertices.map(parsePolygonVertex);
		let inside = false;
		const n = vertices.length;
		for (let i = 0, j = n - 1; i < n; j = i++) {
			const [xi, yi] = vertices[i];
			const [xj, yj] = vertices[j];
			if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
				inside = !inside;
			}
		}
		return inside;
	}
	if (col.shape === "circle" || col.shape === "ellipse") {
		const cx = col.cx ?? 0;
		const cy = col.cy ?? 0;
		const rx = col.rx ?? ("r" in col ? col.r : undefined) ?? 0;
		const ry = col.ry ?? ("r" in col ? col.r : undefined) ?? 0;
		const dx = (x - cx) / (rx || 0);
		const dy = (y - cy) / (ry || 0);
		return rx > 0 && ry > 0 && dx * dx + dy * dy <= 1;
	}
	const rect = col as CollisionContainsInput;
	const x1 = rect.x1 ?? 0;
	const x2 = rect.x2 ?? 0;
	const y1 = rect.y1 ?? 0;
	const y2 = rect.y2 ?? 0;
	return (
		x >= Math.min(x1, x2) &&
		x <= Math.max(x1, x2) &&
		y >= Math.min(y1, y2) &&
		y <= Math.max(y1, y2)
	);
}

export function manifestToSurfaceData(
	manifest: RawShellManifest | null | undefined,
): ManifestSurfaceData {
	const collisions: Record<string, NormalizedCollisionRecord[]> = {};
	const elements: Record<string, ManifestSurfaceElement[]> = {};
	const animations: Record<string, ManifestSurfaceAnimation[]> = {};
	const points: Record<string, Record<string, unknown>> = {};
	const balloonOffsets: Record<string, Record<string, unknown>> = {};
	const aliases = manifest?.aliases ?? {};
	const keroAliases = manifest?.kero_aliases ?? {};
	const charAliases = manifest?.char_aliases ?? {};
	const cursors = manifest?.cursors ?? {};
	const tooltips = manifest?.tooltips ?? {};
	const collisionSort = enumToString(manifest?.collision_sort) || "none";
	const animationSort = enumToString(manifest?.animation_sort) || "none";
	const names: Record<string, string> = {};
	const iconRects: Record<string, number[]> = {};

	for (const surfaceEntry of manifest?.surfaces ?? []) {
		const sid = String(surfaceEntry.number);
		const def = surfaceEntry.definition ?? {};

		collisions[sid] = (def.collisions ?? []).map((area) =>
			collisionRecord(area),
		);
		if (def.name) {
			names[sid] = String(def.name);
		}
		if (def.icon_rect) {
			iconRects[sid] = [...def.icon_rect];
		}

		if (def.points) {
			points[sid] = { ...def.points };
		}
		if (def.balloon_offsets) {
			balloonOffsets[sid] = { ...def.balloon_offsets };
		}

		const rawElements = def.elements ?? [];
		let sortedElements = sortedElementsCache.get(rawElements);
		if (!sortedElements && rawElements.length > 0) {
			sortedElements = rawElements
				.slice()
				.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
			sortedElementsCache.set(rawElements, sortedElements);
		} else if (!sortedElements) {
			sortedElements = [];
		}

		elements[sid] = sortedElements.map((e) => ({
			id: e.id ?? 0,
			type: methodToString(e.method) || "overlay",
			file: e.file ?? "",
			x: e.x ?? 0,
			y: e.y ?? 0,
		}));

		const rawAnimations = Object.values(def.animations ?? {});
		let sortedAnimations = sortedAnimationsCache.get(rawAnimations);
		if (!sortedAnimations && rawAnimations.length > 0) {
			sortedAnimations = rawAnimations
				.slice()
				.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
			sortedAnimationsCache.set(rawAnimations, sortedAnimations);
		} else if (!sortedAnimations) {
			sortedAnimations = [];
		}

		animations[sid] = sortedAnimations.map((anim) => ({
			id: anim.id ?? 0,
			interval: intervalToString(anim.interval) || "never",
			collisions: (anim.collisions ?? []).map((area) => collisionRecord(area)),
			patterns: (() => {
				const rawPatterns = anim.patterns ?? [];
				let sortedPatterns = sortedPatternsCache.get(rawPatterns);
				if (!sortedPatterns && rawPatterns.length > 0) {
					sortedPatterns = rawPatterns
						.slice()
						.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
					sortedPatternsCache.set(rawPatterns, sortedPatterns);
				} else if (!sortedPatterns) {
					sortedPatterns = [];
				}
				return sortedPatterns.map((p) => ({
					surface: String(p.surface ?? -1),
					wait: p.wait ?? 100,
					waitMax: p.wait_max ?? null,
					type: methodToString(p.method) || "overlay",
					x: p.x ?? 0,
					y: p.y ?? 0,
				}));
			})(),
		}));
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
		collisionSort,
		animationSort,
		cursors,
		tooltips,
		names,
		iconRects,
	};
}

export async function getShellManifest(
	ghostName: string,
	shellName: string,
): Promise<RawShellManifest | null> {
	try {
		return await invoke<RawShellManifest | null>("shell_manifest", {
			ghostName,
			shellName,
		});
	} catch (err) {
		console.warn(
			`⚠️ shell_manifest 失敗 (ghost=${ghostName}, shell=${shellName}):`,
			err,
		);
		return null;
	}
}

export interface ParsedSurfacesTextResult {
	collisions: Record<string, NormalizedCollisionRecord[]>;
	elements: Record<string, ManifestSurfaceElement[]>;
	animations: Record<string, ManifestSurfaceAnimation[]>;
	points: Record<string, Record<string, unknown>>;
	balloonOffsets: Record<string, Record<string, unknown>>;
}

export async function parseSurfacesTextWithRust(
	content: string,
): Promise<ParsedSurfacesTextResult | null> {
	try {
		const rawMap = await invoke<Record<string, RawSurfaceManifestEntry> | null>(
			"parse_surfaces_text",
			{ content },
		);
		if (!rawMap || typeof rawMap !== "object") return null;

		const surfaces = Object.values(rawMap);
		const data = manifestToSurfaceData({ surfaces });
		return {
			collisions: data.collisions,
			elements: data.elements,
			animations: data.animations,
			points: data.points,
			balloonOffsets: data.balloonOffsets,
		};
	} catch (err) {
		console.warn("⚠️ Rust parse_surfaces_text 失敗:", err);
		return null;
	}
}

/**
 * `surfacetable.txt` から `__disabled` グループを除外した表示用グループ一覧を返す
 */
export function getVisibleSurfaceTableGroups(
	table: RawSurfaceTable | null | undefined,
): RawSurfTableGroup[] {
	if (!table?.groups) return [];
	return table.groups.filter((g) => g.name !== "__disabled");
}

/**
 * マニフェストの `surface_table` または `surfaces` からサーフィス番号の表示名を解決する
 */
export function getSurfaceDisplayName(
	manifest: RawShellManifest | null | undefined,
	surfaceId: number,
): string | null {
	if (!manifest) return null;
	if (manifest.surface_table?.groups) {
		for (const group of manifest.surface_table.groups) {
			if (group.name === "__disabled") continue;
			for (const entry of group.entries ?? []) {
				if (entry.surface_id === surfaceId && entry.name) {
					return entry.name;
				}
			}
		}
	}
	return null;
}

export const DEFAULT_SERIKO_DPI = 96;

function parseScopeIdList(raw: string | undefined): number[] {
	if (!raw) return [];
	const ids: number[] = [];
	for (const part of raw.split(",")) {
		const trimmed = part.trim();
		if (!trimmed) continue;
		const parsed = Number.parseInt(trimmed, 10);
		if (Number.isInteger(parsed) && parsed >= 0 && !ids.includes(parsed)) {
			ids.push(parsed);
		}
	}
	return ids;
}

/**
 * `seriko.dpi` を取得する（未設定・不正値の場合は 96）
 */
export function getSerikoDpi(
	manifest: RawShellManifest | null | undefined,
): number {
	const raw = manifest?.descript?.properties?.["seriko.dpi"];
	if (!raw) return DEFAULT_SERIKO_DPI;
	const parsed = Number.parseInt(raw.trim(), 10);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_SERIKO_DPI;
}

/**
 * `seriko.dpi` に基づく描画スケール倍率（`96 / dpi`）を返す
 */
export function getSerikoDpiScale(
	manifest: RawShellManifest | null | undefined,
): number {
	return DEFAULT_SERIKO_DPI / getSerikoDpi(manifest);
}

/**
 * `seriko.force_disable_crossfade` が有効（`1` または `true`）か判定する
 */
export function isSerikoCrossfadeDisabled(
	manifest: RawShellManifest | null | undefined,
): boolean {
	const raw =
		manifest?.descript?.properties?.["seriko.force_disable_crossfade"];
	if (!raw) return false;
	const trimmed = raw.trim().toLowerCase();
	return trimmed === "1" || trimmed === "true";
}

/**
 * `seriko.zorder` のスコープ ID 列を返す
 */
export function getSerikoZOrder(
	manifest: RawShellManifest | null | undefined,
): number[] {
	return parseScopeIdList(manifest?.descript?.properties?.["seriko.zorder"]);
}

/**
 * `seriko.sticky-window` のスコープ ID 列を返す
 */
export function getSerikoStickyWindows(
	manifest: RawShellManifest | null | undefined,
): number[] {
	return parseScopeIdList(
		manifest?.descript?.properties?.["seriko.sticky-window"],
	);
}

/**
 * スコープ別の `alignmenttodesktop` 設定を取得する
 */
export function getAlignmentToDesktop(
	manifest: RawShellManifest | null | undefined,
	scopeId: number,
): string | undefined {
	const props = manifest?.descript?.properties;
	if (!props) return undefined;
	const scopeKey =
		scopeId === 0
			? "sakura.seriko.alignmenttodesktop"
			: scopeId === 1
				? "kero.seriko.alignmenttodesktop"
				: `char${scopeId}.seriko.alignmenttodesktop`;
	const raw = props[scopeKey] ?? props["seriko.alignmenttodesktop"];
	const trimmed = raw?.trim();
	return trimmed ? trimmed : undefined;
}
