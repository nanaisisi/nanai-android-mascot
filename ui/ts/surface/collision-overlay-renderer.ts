/**
 * @file collision-overlay-renderer.ts
 * @brief 仕様追加へ追随可能な、レジストリ駆動の当たり判定・ウィンドウ境界オーバーレイ描画モジュール
 */

export type CollisionDisplayMode = "full" | "rect";

export interface CollisionOverlayRenderOptions {
	collisions?: Array<Record<string, unknown>>;
	scale?: number;
	mode?: CollisionDisplayMode;
	showWindowBounds?: boolean;
	iconRect?: number[] | null;
	points?: Record<string, unknown> | null;
	metadata?: Record<string, unknown>;
}

export interface LabelAnchor {
	x: number;
	y: number;
}

export interface CollisionShapeSpec<TNorm = unknown> {
	kind: string;
	aliases?: string[];
	matches?: (kind: string, coords: Record<string, unknown>) => boolean;
	normalize: (coords: Record<string, unknown>) => TNorm | null;
	stroke: (ctx: CanvasRenderingContext2D, norm: TNorm, scale: number) => void;
	getLabelAnchor: (norm: TNorm, scale: number) => LabelAnchor | null;
}

export interface CollisionOverlayLayerContext {
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	width: number;
	height: number;
	scale: number;
	showLabels: boolean;
	collisions: Array<Record<string, unknown>>;
	options: CollisionOverlayRenderOptions;
}

export interface CollisionOverlayLayerSpec {
	id: string;
	order: number;
	strokeColor: string;
	isEnabled?: (context: CollisionOverlayLayerContext) => boolean;
	render: (context: CollisionOverlayLayerContext) => void;
}

export const WINDOW_COLLISION_STROKE_COLOR = "#0078d7";
export const ICON_RECT_STROKE_COLOR = "#00897b";
export const SURFACE_POINT_STROKE_COLOR = "#d81b60";
export const PART_COLLISION_STROKE_COLOR = "#ff0000";

const shapeSpecByKind = new Map<string, CollisionShapeSpec<unknown>>();
const registeredShapeSpecs: CollisionShapeSpec<unknown>[] = [];
const overlayLayersById = new Map<string, CollisionOverlayLayerSpec>();

export function registerCollisionShapeSpec<TNorm>(
	spec: CollisionShapeSpec<TNorm>,
): void {
	const canonical = spec.kind.toLowerCase();
	const typedSpec = spec as CollisionShapeSpec<unknown>;
	const existingIdx = registeredShapeSpecs.findIndex(
		(s) => s.kind.toLowerCase() === canonical,
	);
	if (existingIdx >= 0) {
		registeredShapeSpecs[existingIdx] = typedSpec;
	} else {
		registeredShapeSpecs.push(typedSpec);
	}
	shapeSpecByKind.set(canonical, typedSpec);
	for (const alias of spec.aliases ?? []) {
		shapeSpecByKind.set(alias.toLowerCase(), typedSpec);
	}
}

export function unregisterCollisionShapeSpec(kind: string): void {
	const canonical = kind.toLowerCase();
	const target = shapeSpecByKind.get(canonical);
	if (!target) return;
	for (const [key, value] of shapeSpecByKind.entries()) {
		if (value === target) {
			shapeSpecByKind.delete(key);
		}
	}
	const idx = registeredShapeSpecs.indexOf(target);
	if (idx >= 0) {
		registeredShapeSpecs.splice(idx, 1);
	}
}

export function getCollisionShapeSpec(
	kind: string,
	coords: Record<string, unknown> = {},
): CollisionShapeSpec<unknown> | null {
	const normalizedKind = kind.toLowerCase();
	const exact = shapeSpecByKind.get(normalizedKind);
	if (exact) return exact;
	for (const spec of registeredShapeSpecs) {
		if (spec.matches?.(normalizedKind, coords)) {
			return spec;
		}
	}
	return null;
}

export function registerCollisionOverlayLayer(
	layer: CollisionOverlayLayerSpec,
): void {
	overlayLayersById.set(layer.id, layer);
}

export function unregisterCollisionOverlayLayer(id: string): void {
	overlayLayersById.delete(id);
}

export function getCollisionOverlayLayers(): CollisionOverlayLayerSpec[] {
	return Array.from(overlayLayersById.values()).sort(
		(a, b) => a.order - b.order,
	);
}

export function resolveCollisionShape(col: Record<string, unknown>): {
	kind: string;
	coords: Record<string, unknown>;
} {
	const rawShape = col.shape;
	if (rawShape && typeof rawShape === "object") {
		const s = rawShape as Record<string, unknown>;
		const explicitType = s.type ?? s.shape;
		if (typeof explicitType === "string") {
			return { kind: explicitType.toLowerCase(), coords: s };
		}
		for (const key of Object.keys(s)) {
			const lowerKey = key.toLowerCase();
			if (
				shapeSpecByKind.has(lowerKey) &&
				s[key] &&
				typeof s[key] === "object"
			) {
				return { kind: lowerKey, coords: s[key] as Record<string, unknown> };
			}
		}
		return { kind: "rect", coords: s };
	}
	return {
		kind: String(rawShape ?? "rect").toLowerCase(),
		coords: col,
	};
}

function drawWireframeLabel(
	ctx: CanvasRenderingContext2D,
	text: string,
	anchor: LabelAnchor | null,
	color: string,
): void {
	if (!text || !anchor || typeof ctx.fillText !== "function") return;
	ctx.font = "bold 11px sans-serif";
	ctx.fillStyle = color;
	ctx.fillText(text, anchor.x, Math.max(11, anchor.y));
}

function toFiniteNumber(val: unknown): number | null {
	if (typeof val === "number" && Number.isFinite(val)) return val;
	if (typeof val === "string" && val.trim() !== "") {
		const parsed = Number(val);
		if (Number.isFinite(parsed)) return parsed;
	}
	return null;
}

interface NormalizedRect {
	x: number;
	y: number;
	w: number;
	h: number;
}

registerCollisionShapeSpec<NormalizedRect>({
	kind: "rect",
	aliases: ["box"],
	matches: (_kind, coords) => coords.x1 !== undefined,
	normalize: (coords) => {
		const rawX1 = toFiniteNumber(coords.x1) ?? 0;
		const rawY1 = toFiniteNumber(coords.y1) ?? 0;
		const rawX2 = toFiniteNumber(coords.x2) ?? rawX1 + 40;
		const rawY2 = toFiniteNumber(coords.y2) ?? rawY1 + 40;
		return {
			x: Math.min(rawX1, rawX2),
			y: Math.min(rawY1, rawY2),
			w: Math.abs(rawX2 - rawX1),
			h: Math.abs(rawY2 - rawY1),
		};
	},
	stroke: (ctx, norm, scale) => {
		ctx.strokeRect?.(
			norm.x * scale,
			norm.y * scale,
			norm.w * scale,
			norm.h * scale,
		);
	},
	getLabelAnchor: (norm, scale) => ({
		x: norm.x * scale + 4,
		y: norm.y * scale + 14,
	}),
});

interface NormalizedEllipse {
	cx: number;
	cy: number;
	rx: number;
	ry: number;
}

registerCollisionShapeSpec<NormalizedEllipse>({
	kind: "circle",
	normalize: (coords) => {
		const r = toFiniteNumber(coords.r) ?? 30;
		return {
			cx: toFiniteNumber(coords.cx) ?? 50,
			cy: toFiniteNumber(coords.cy) ?? 50,
			rx: Math.max(0, toFiniteNumber(coords.rx) ?? r),
			ry: Math.max(0, toFiniteNumber(coords.ry) ?? r),
		};
	},
	stroke: (ctx, norm, scale) => {
		const cx = norm.cx * scale;
		const cy = norm.cy * scale;
		const rx = norm.rx * scale;
		const ry = norm.ry * scale;
		ctx.beginPath?.();
		if (typeof ctx.ellipse === "function") {
			ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
		} else {
			ctx.arc?.(cx, cy, rx, 0, Math.PI * 2);
		}
		ctx.stroke?.();
	},
	getLabelAnchor: (norm, scale) => ({
		x: Math.max(0, norm.cx * scale - 10),
		y: norm.cy * scale,
	}),
});

registerCollisionShapeSpec<NormalizedEllipse>({
	kind: "ellipse",
	normalize: (coords) => {
		const cxExplicit = toFiniteNumber(coords.cx);
		const cyExplicit = toFiniteNumber(coords.cy);
		if (cxExplicit !== null && cyExplicit !== null) {
			const fallbackR = toFiniteNumber(coords.r) ?? 30;
			return {
				cx: cxExplicit,
				cy: cyExplicit,
				rx: Math.max(0, toFiniteNumber(coords.rx) ?? fallbackR),
				ry: Math.max(0, toFiniteNumber(coords.ry) ?? fallbackR),
			};
		}
		const x1 = toFiniteNumber(coords.x1);
		const y1 = toFiniteNumber(coords.y1);
		const x2 = toFiniteNumber(coords.x2);
		const y2 = toFiniteNumber(coords.y2);
		if (x1 !== null && y1 !== null && x2 !== null && y2 !== null) {
			return {
				cx: (x1 + x2) / 2,
				cy: (y1 + y2) / 2,
				rx: Math.abs(x2 - x1) / 2,
				ry: Math.abs(y2 - y1) / 2,
			};
		}
		return {
			cx: 50,
			cy: 50,
			rx: Math.max(0, toFiniteNumber(coords.rx ?? coords.r) ?? 30),
			ry: Math.max(0, toFiniteNumber(coords.ry ?? coords.r) ?? 30),
		};
	},
	stroke: (ctx, norm, scale) => {
		const cx = norm.cx * scale;
		const cy = norm.cy * scale;
		const rx = norm.rx * scale;
		const ry = norm.ry * scale;
		ctx.beginPath?.();
		if (typeof ctx.ellipse === "function") {
			ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
		} else {
			ctx.arc?.(cx, cy, rx, 0, Math.PI * 2);
		}
		ctx.stroke?.();
	},
	getLabelAnchor: (norm, scale) => ({
		x: Math.max(0, norm.cx * scale - 10),
		y: norm.cy * scale,
	}),
});

interface NormalizedPolygon {
	vertices: Array<[number, number]>;
}

registerCollisionShapeSpec<NormalizedPolygon>({
	kind: "polygon",
	normalize: (coords) => {
		if (!Array.isArray(coords.vertices)) return null;
		const vertices = coords.vertices
			.map((pt): [number, number] | null => {
				if (Array.isArray(pt)) {
					const x = toFiniteNumber(pt[0]);
					const y = toFiniteNumber(pt[1]);
					return x !== null && y !== null ? [x, y] : null;
				}
				if (pt && typeof pt === "object") {
					const pObj = pt as { x?: unknown; y?: unknown };
					const x = toFiniteNumber(pObj.x);
					const y = toFiniteNumber(pObj.y);
					return x !== null && y !== null ? [x, y] : null;
				}
				return null;
			})
			.filter((pt): pt is [number, number] => pt !== null);
		return vertices.length >= 2 ? { vertices } : null;
	},
	stroke: (ctx, norm, scale) => {
		const [first, ...rest] = norm.vertices;
		ctx.beginPath?.();
		ctx.moveTo?.(first[0] * scale, first[1] * scale);
		for (const [vx, vy] of rest) {
			ctx.lineTo?.(vx * scale, vy * scale);
		}
		ctx.closePath?.();
		ctx.stroke?.();
	},
	getLabelAnchor: (norm, scale) => ({
		x: norm.vertices[0][0] * scale + 4,
		y: norm.vertices[0][1] * scale + 14,
	}),
});

interface NormalizedRegion {
	bounds: NormalizedRect | null;
}

registerCollisionShapeSpec<NormalizedRegion>({
	kind: "region",
	normalize: (coords) => {
		const x1 = toFiniteNumber(coords.x1);
		const y1 = toFiniteNumber(coords.y1);
		const x2 = toFiniteNumber(coords.x2);
		const y2 = toFiniteNumber(coords.y2);
		if (x1 !== null && y1 !== null && x2 !== null && y2 !== null) {
			return {
				bounds: {
					x: Math.min(x1, x2),
					y: Math.min(y1, y2),
					w: Math.abs(x2 - x1),
					h: Math.abs(y2 - y1),
				},
			};
		}
		return { bounds: null };
	},
	stroke: (ctx, norm, scale) => {
		if (!norm.bounds) return;
		const canDash = typeof ctx.setLineDash === "function";
		if (canDash) ctx.setLineDash([4, 3]);
		try {
			ctx.strokeRect?.(
				norm.bounds.x * scale,
				norm.bounds.y * scale,
				norm.bounds.w * scale,
				norm.bounds.h * scale,
			);
		} finally {
			if (canDash) ctx.setLineDash([]);
		}
	},
	getLabelAnchor: (norm, scale) =>
		norm.bounds
			? { x: norm.bounds.x * scale + 4, y: norm.bounds.y * scale + 14 }
			: { x: 6, y: 18 },
});

const POINT_PAIR_SPECS: Array<{ label: string; keys: [string[], string[]] }> = [
	{
		label: "point.center",
		keys: [
			["center_x", "centerx", "center.x"],
			["center_y", "centery", "center.y"],
		],
	},
	{
		label: "point.basepos",
		keys: [
			["basepos_x", "basepos.x", "baseposx"],
			["basepos_y", "basepos.y", "baseposy"],
		],
	},
	{
		label: "point.kinoko.center",
		keys: [
			["kinoko_center_x", "kinoko.centerx", "kinoko.center.x"],
			["kinoko_center_y", "kinoko.centery", "kinoko.center.y"],
		],
	},
	{
		label: "point.osuwaripos",
		keys: [
			["osuwaripos_x", "osuwaripos.x", "osuwariposx"],
			["osuwaripos_y", "osuwaripos.y", "osuwariposy"],
		],
	},
];

function extractSurfacePoints(
	points: Record<string, unknown>,
): Array<{ label: string; x: number; y: number }> {
	const lowered = new Map<string, number>();
	for (const [k, v] of Object.entries(points)) {
		const num = toFiniteNumber(v);
		if (num !== null) lowered.set(k.toLowerCase(), num);
	}

	const matchedKeys = new Set<string>();
	const result: Array<{ label: string; x: number; y: number }> = [];

	for (const spec of POINT_PAIR_SPECS) {
		let x: number | undefined;
		let y: number | undefined;
		for (const xk of spec.keys[0]) {
			const val = lowered.get(xk);
			if (val !== undefined) {
				x = val;
				matchedKeys.add(xk);
				break;
			}
		}
		for (const yk of spec.keys[1]) {
			const val = lowered.get(yk);
			if (val !== undefined) {
				y = val;
				matchedKeys.add(yk);
				break;
			}
		}
		if (x !== undefined && y !== undefined) {
			result.push({ label: spec.label, x, y });
		}
	}

	// 将来の point.<name>.x / .y 追加仕様も自動で拾う
	for (const [key, xVal] of lowered.entries()) {
		if (matchedKeys.has(key)) continue;
		const xMatch = key.match(/^(.+?)(?:\.x|_x)$/);
		if (!xMatch) continue;
		const prefix = xMatch[1];
		const yKey = lowered.has(`${prefix}.y`)
			? `${prefix}.y`
			: lowered.has(`${prefix}_y`)
				? `${prefix}_y`
				: null;
		if (yKey) {
			const yVal = lowered.get(yKey);
			if (yVal !== undefined) {
				matchedKeys.add(key);
				matchedKeys.add(yKey);
				result.push({
					label: prefix.startsWith("point.") ? prefix : `point.${prefix}`,
					x: xVal,
					y: yVal,
				});
			}
		}
	}

	return result;
}

// 1. ウィンドウ／サーフィス外枠境界レイヤー
registerCollisionOverlayLayer({
	id: "window-bounds",
	order: 10,
	strokeColor: WINDOW_COLLISION_STROKE_COLOR,
	isEnabled: ({ options, width, height }) =>
		options.showWindowBounds !== false && width > 2 && height > 2,
	render: ({ ctx, width, height }) => {
		ctx.strokeStyle = WINDOW_COLLISION_STROKE_COLOR;
		ctx.lineWidth = 2;
		ctx.strokeRect?.(1, 1, width - 2, height - 2);
	},
});

// 2. icon.rect 領域レイヤー
registerCollisionOverlayLayer({
	id: "icon-rect",
	order: 20,
	strokeColor: ICON_RECT_STROKE_COLOR,
	isEnabled: ({ options }) =>
		Array.isArray(options.iconRect) && options.iconRect.length >= 4,
	render: ({ ctx, options, scale, showLabels }) => {
		const raw = options.iconRect as number[];
		const x1 = toFiniteNumber(raw[0]);
		const y1 = toFiniteNumber(raw[1]);
		const x2 = toFiniteNumber(raw[2]);
		const y2 = toFiniteNumber(raw[3]);
		if (x1 === null || y1 === null || x2 === null || y2 === null) return;
		const x = Math.min(x1, x2) * scale;
		const y = Math.min(y1, y2) * scale;
		const w = Math.abs(x2 - x1) * scale;
		const h = Math.abs(y2 - y1) * scale;
		ctx.strokeStyle = ICON_RECT_STROKE_COLOR;
		ctx.lineWidth = 2;
		ctx.strokeRect?.(x, y, w, h);
		if (showLabels) {
			drawWireframeLabel(
				ctx,
				"icon.rect",
				{ x: x + 4, y: y + 14 },
				ICON_RECT_STROKE_COLOR,
			);
		}
	},
});

// 3. point.* 基準点マーカーレイヤー
registerCollisionOverlayLayer({
	id: "surface-points",
	order: 30,
	strokeColor: SURFACE_POINT_STROKE_COLOR,
	isEnabled: ({ options }) =>
		Boolean(options.points && typeof options.points === "object"),
	render: ({ ctx, options, scale, showLabels }) => {
		const pointList = extractSurfacePoints(
			options.points as Record<string, unknown>,
		);
		if (pointList.length === 0) return;
		ctx.strokeStyle = SURFACE_POINT_STROKE_COLOR;
		ctx.lineWidth = 2;
		for (const pt of pointList) {
			const px = pt.x * scale;
			const py = pt.y * scale;
			ctx.beginPath?.();
			ctx.moveTo?.(px - 6, py);
			ctx.lineTo?.(px + 6, py);
			ctx.moveTo?.(px, py - 6);
			ctx.lineTo?.(px, py + 6);
			ctx.stroke?.();
			if (showLabels) {
				drawWireframeLabel(
					ctx,
					pt.label,
					{ x: px + 6, y: py + 4 },
					SURFACE_POINT_STROKE_COLOR,
				);
			}
		}
	},
});

// 4. 部位当たり判定（collision / collisionex / animation*.collision*）レイヤー
registerCollisionOverlayLayer({
	id: "part-collisions",
	order: 40,
	strokeColor: PART_COLLISION_STROKE_COLOR,
	isEnabled: ({ collisions }) => collisions.length > 0,
	render: ({ ctx, collisions, scale, showLabels }) => {
		collisions.forEach((col, idx) => {
			ctx.strokeStyle = PART_COLLISION_STROKE_COLOR;
			ctx.lineWidth = 2;

			const name = String(col.name ?? `col${idx}`);
			const { kind, coords } = resolveCollisionShape(col);
			const spec = getCollisionShapeSpec(kind, coords);
			if (!spec) return;

			const norm = spec.normalize(coords);
			if (norm === null) return;

			spec.stroke(ctx, norm, scale);
			if (showLabels) {
				drawWireframeLabel(
					ctx,
					name,
					spec.getLabelAnchor(norm, scale),
					PART_COLLISION_STROKE_COLOR,
				);
			}
		});
	},
});

export function renderCollisionOverlay(
	canvas: HTMLCanvasElement,
	options: CollisionOverlayRenderOptions = {},
): void {
	if (!canvas || typeof canvas.getContext !== "function") return;
	const ctx = canvas.getContext("2d");
	if (!ctx) return;

	const width = canvas.width || 200;
	const height = canvas.height || 400;
	const scale =
		typeof options.scale === "number" &&
		Number.isFinite(options.scale) &&
		options.scale > 0
			? options.scale
			: 1;
	const showLabels = options.mode !== "rect";
	const collisions = Array.isArray(options.collisions)
		? options.collisions
		: [];

	if (typeof ctx.clearRect === "function") {
		ctx.clearRect(0, 0, width, height);
	}

	const layerContext: CollisionOverlayLayerContext = {
		canvas,
		ctx,
		width,
		height,
		scale,
		showLabels,
		collisions,
		options,
	};

	for (const layer of getCollisionOverlayLayers()) {
		if (layer.isEnabled && !layer.isEnabled(layerContext)) {
			continue;
		}
		layer.render(layerContext);
	}
}
