/**
 * @file surface-collision.ts
 * @brief サーフィスエイリアス解決、マウス・タッチ当たり判定、カーソル/ツールチップ検索モジュール
 */
import { wasmBridge } from "../core/wasm-bridge.js";
import { collisionContains, collisionRecord } from "./shell-manifest.js";

export interface CollisionTargetRect {
	left?: number;
	top?: number;
	width?: number;
	height?: number;
	naturalWidth?: number;
	naturalHeight?: number;
}

export interface CollisionAreaRecord {
	id?: number | null;
	name?: string;
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

export interface CollisionHitResult {
	name: string;
	id?: number;
	canvasX: number;
	canvasY: number;
}

export interface CursorDefinitionRecord {
	event: string;
	collision: string;
	cursor: string;
}

export interface SurfaceCollisionContext {
	collisions?: Record<string | number, CollisionAreaRecord[]>;
	aliases?: Record<string, number[]> | null;
	keroAliases?: Record<string, number[]> | null;
	charAliases?: Record<number | string, Record<string, number[]>> | null;
	names?: Record<string | number, string> | null;
	cursors?: Record<string, CursorDefinitionRecord[]> | null;
	tooltips?: Record<string, Record<string, string>> | null;
	collisionSort?: string;
	baseWidth?: number;
	baseHeight?: number;
	currentSurfaceIdFor?: (scopeId?: number) => number | string;
}

export function normalizeCollisionRecord(
	col: CollisionAreaRecord | Record<string, unknown> | null | undefined,
): CollisionAreaRecord | null {
	if (!col) return null;
	const record = col as CollisionAreaRecord;
	if (typeof record.shape === "string") {
		return record;
	}
	if (record.shape && typeof record.shape === "object") {
		const shapeObj = record.shape as Record<string, unknown>;
		if (
			"Rect" in shapeObj ||
			"Circle" in shapeObj ||
			"Ellipse" in shapeObj ||
			"Polygon" in shapeObj
		) {
			return collisionRecord(record) as CollisionAreaRecord;
		}
		if (typeof shapeObj.shape === "string") {
			const kind = shapeObj.shape.toLowerCase();
			if (kind === "rect") {
				return collisionRecord({
					id: record.id,
					name: record.name,
					shape: { Rect: shapeObj },
				}) as CollisionAreaRecord;
			}
			if (kind === "circle") {
				return collisionRecord({
					id: record.id,
					name: record.name,
					shape: { Circle: shapeObj },
				}) as CollisionAreaRecord;
			}
			if (kind === "ellipse") {
				return collisionRecord({
					id: record.id,
					name: record.name,
					shape: { Ellipse: shapeObj },
				}) as CollisionAreaRecord;
			}
			if (kind === "polygon") {
				return collisionRecord({
					id: record.id,
					name: record.name,
					shape: { Polygon: shapeObj },
				}) as CollisionAreaRecord;
			}
		}
	}
	return collisionRecord(record) as CollisionAreaRecord;
}

function toWasmCollisionArea(
	col: CollisionAreaRecord,
): Record<string, unknown> | null {
	const name = String(col.name ?? "");
	const id = col.id != null && Number.isInteger(col.id) ? col.id : null;

	if (col.shape && typeof col.shape === "object") {
		const shapeObj = col.shape as Record<string, unknown>;
		if (typeof shapeObj.shape === "string") {
			return { id, name, shape: shapeObj };
		}
		const normalized = normalizeCollisionRecord(col);
		if (!normalized || typeof normalized.shape !== "string") return null;
		return toWasmCollisionArea(normalized);
	}

	const shapeKind = String(col.shape ?? "rect").toLowerCase();
	if (shapeKind === "rect") {
		const x1 = Number(col.x1 ?? 0);
		const y1 = Number(col.y1 ?? 0);
		const x2 = Number(col.x2 ?? 0);
		const y2 = Number(col.y2 ?? 0);
		if (
			!Number.isInteger(x1) ||
			!Number.isInteger(y1) ||
			!Number.isInteger(x2) ||
			!Number.isInteger(y2)
		) {
			return null;
		}
		return { id, name, shape: { shape: "rect", x1, y1, x2, y2 } };
	}
	if (shapeKind === "circle") {
		const cx = Number(col.cx ?? 0);
		const cy = Number(col.cy ?? 0);
		const rx = Number(col.r ?? col.rx ?? 0);
		const ry = Number(col.r ?? col.ry ?? rx);
		if (!Number.isInteger(cx) || !Number.isInteger(cy)) return null;
		if (rx === ry) {
			if (!Number.isInteger(rx)) return null;
			return { id, name, shape: { shape: "circle", cx, cy, r: rx } };
		}
		if (!Number.isInteger(rx) || !Number.isInteger(ry)) return null;
		return { id, name, shape: { shape: "ellipse", cx, cy, rx, ry } };
	}
	if (shapeKind === "ellipse") {
		const cx = Number(col.cx ?? 0);
		const cy = Number(col.cy ?? 0);
		const rx = Number(col.rx ?? 0);
		const ry = Number(col.ry ?? 0);
		if (
			!Number.isInteger(cx) ||
			!Number.isInteger(cy) ||
			!Number.isInteger(rx) ||
			!Number.isInteger(ry)
		) {
			return null;
		}
		return { id, name, shape: { shape: "ellipse", cx, cy, rx, ry } };
	}
	if (shapeKind === "polygon") {
		const vertices: [number, number][] = [];
		for (const pt of col.vertices ?? []) {
			const vx = Array.isArray(pt) ? Number(pt[0]) : Number(pt?.x ?? 0);
			const vy = Array.isArray(pt) ? Number(pt[1]) : Number(pt?.y ?? 0);
			if (!Number.isInteger(vx) || !Number.isInteger(vy)) return null;
			vertices.push([vx, vy]);
		}
		return { id, name, shape: { shape: "polygon", vertices } };
	}
	return null;
}

function toWasmCollisionList(
	colList: CollisionAreaRecord[],
): Record<string, unknown>[] | null {
	const result: Record<string, unknown>[] = [];
	for (const col of colList) {
		const converted = toWasmCollisionArea(col);
		if (!converted) return null;
		result.push(converted);
	}
	return result;
}

function buildCollisionHitResult(
	col: CollisionAreaRecord | null | undefined,
	canvasX: number,
	canvasY: number,
	fallbackName = "",
): CollisionHitResult {
	const result: CollisionHitResult = {
		name: col?.name || fallbackName,
		canvasX,
		canvasY,
	};
	if (col?.id != null) {
		result.id = col.id;
	}
	return result;
}

function findFirstHit(
	candidates: CollisionAreaRecord[],
	canvasX: number,
	canvasY: number,
): CollisionHitResult {
	for (const col of candidates) {
		const normalized = normalizeCollisionRecord(col);
		if (collisionContains(normalized, canvasX, canvasY)) {
			return buildCollisionHitResult(col, canvasX, canvasY);
		}
	}
	return { name: "", canvasX, canvasY };
}

function findAliasList(
	map: Record<string, number[]> | null | undefined,
	rawName: string,
	lowerTarget: string,
): number[] | null {
	if (!map) return null;
	if (Array.isArray(map[rawName])) {
		return map[rawName];
	}
	for (const [key, val] of Object.entries(map)) {
		if (Array.isArray(val) && key.toLowerCase() === lowerTarget) {
			return val;
		}
	}
	return null;
}

function resolveScopeKeys(scopeId: number | string): string[] {
	const s = String(scopeId).toLowerCase();
	if (scopeId === 0 || s === "0" || s === "sakura" || s === "char0") {
		return ["sakura", "0", "char0", "*"];
	}
	if (scopeId === 1 || s === "1" || s === "kero" || s === "char1") {
		return ["kero", "1", "char1", "*"];
	}
	if (/^\d+$/.test(s)) {
		return [s, `char${s}`, "*"];
	}
	return [s, "*"];
}

export function findHitCollisionName(
	collisions: unknown[],
	x: number,
	y: number,
): string | null {
	return wasmBridge.findHitCollisionName(collisions, x, y);
}

export const surfaceCollisionMethods = {
	findHitCollisionName,

	renderCollisionOverlayCanvas(
		this: SurfaceCollisionContext,
		canvas: HTMLCanvasElement,
		surfaceId: number | string | null = null,
		scopeId = 0,
	): void {
		if (!canvas || typeof canvas.getContext !== "function") return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const width = canvas.width || 200;
		const height = canvas.height || 400;
		ctx.clearRect(0, 0, width, height);

		const sid =
			surfaceId !== null && surfaceId !== undefined
				? String(surfaceId)
				: String(
						this.currentSurfaceIdFor?.(scopeId) ?? (scopeId === 1 ? 10 : 0),
					);

		const colList = this.collisions?.[sid] || this.collisions?.default || [];
		if (colList.length === 0) return;

		const colors = [
			"rgba(255, 0, 0, 0.5)",
			"rgba(0, 120, 215, 0.5)",
			"rgba(46, 125, 50, 0.5)",
			"rgba(230, 81, 0, 0.5)",
		];

		colList.forEach((col, idx) => {
			const color = colors[idx % colors.length];
			ctx.strokeStyle = color;
			ctx.fillStyle = color.replace("0.5", "0.2");
			ctx.lineWidth = 2;

			const name = String(col.name || `col${idx}`);

			if (col.shape && typeof col.shape === "object") {
				const shapeObj = col.shape as Record<string, unknown>;
				if (shapeObj.Rect) {
					const r = shapeObj.Rect as {
						x1: number;
						y1: number;
						x2: number;
						y2: number;
					};
					const w = r.x2 - r.x1;
					const h = r.y2 - r.y1;
					ctx.fillRect(r.x1, r.y1, w, h);
					ctx.strokeRect(r.x1, r.y1, w, h);
					ctx.fillStyle = "#ff0000";
					ctx.font = "bold 11px sans-serif";
					ctx.fillText(name, r.x1 + 4, r.y1 + 14);
					return;
				}
				if (shapeObj.Circle) {
					const c = shapeObj.Circle as { cx: number; cy: number; r: number };
					ctx.beginPath();
					ctx.arc(c.cx, c.cy, c.r, 0, Math.PI * 2);
					ctx.fill();
					ctx.stroke();
					ctx.fillStyle = "#ff0000";
					ctx.font = "bold 11px sans-serif";
					ctx.fillText(name, c.cx - 10, c.cy);
					return;
				}
			}

			const shapeKind = String(col.shape || "rect").toLowerCase();
			if (shapeKind === "rect" || col.x1 !== undefined) {
				const x1 = col.x1 ?? 0;
				const y1 = col.y1 ?? 0;
				const w = (col.x2 ?? x1 + 40) - x1;
				const h = (col.y2 ?? y1 + 40) - y1;
				ctx.fillRect(x1, y1, w, h);
				ctx.strokeRect(x1, y1, w, h);
				ctx.fillStyle = "#ff0000";
				ctx.font = "bold 11px sans-serif";
				ctx.fillText(name, x1 + 4, y1 + 14);
			} else if (shapeKind === "circle" || shapeKind === "ellipse") {
				const cx = col.cx ?? 50;
				const cy = col.cy ?? 50;
				const rx = col.rx ?? col.r ?? 30;
				const ry = col.ry ?? col.r ?? 30;
				ctx.beginPath();
				ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
				ctx.fill();
				ctx.stroke();
				ctx.fillStyle = "#ff0000";
				ctx.font = "bold 11px sans-serif";
				ctx.fillText(name, cx - 10, cy);
			}
		});
	},

	resolveSurfaceNumber(
		this: SurfaceCollisionContext,
		surfaceId: number | string | null | undefined,
		scopeId = 0,
	): number | string {
		if (surfaceId === null || surfaceId === undefined) {
			return "";
		}
		const rawName = String(surfaceId).trim();
		if (rawName === "" || /^-?\d+$/.test(rawName)) {
			return surfaceId;
		}
		const lowerTarget = rawName.toLowerCase();

		// 1. Defined surface name lookup (`name,定義名`)
		const namesMap = this.names;
		if (namesMap) {
			for (const [sid, defName] of Object.entries(namesMap)) {
				const trimmed = String(defName ?? "").trim();
				if (trimmed && trimmed.toLowerCase() === lowerTarget) {
					return String(sid);
				}
			}
		}

		// 2. Scope-isolated alias lookup
		let list: number[] | null = null;
		if (scopeId === 0) {
			list =
				findAliasList(this.aliases, rawName, lowerTarget) ??
				findAliasList(
					this.charAliases?.[0] ?? this.charAliases?.["0"],
					rawName,
					lowerTarget,
				);
		} else if (scopeId === 1) {
			list =
				findAliasList(this.keroAliases, rawName, lowerTarget) ??
				findAliasList(
					this.charAliases?.[1] ?? this.charAliases?.["1"],
					rawName,
					lowerTarget,
				);
		} else {
			list = findAliasList(
				this.charAliases?.[scopeId] ?? this.charAliases?.[String(scopeId)],
				rawName,
				lowerTarget,
			);
		}

		if (!list || list.length === 0) {
			return surfaceId;
		}
		return String(list[Math.floor(Math.random() * list.length)]);
	},

	detectCollision(
		this: SurfaceCollisionContext,
		clickX: number,
		clickY: number,
		targetRect: unknown,
		surfaceId: number | string | null = null,
		scopeId = 0,
	): CollisionHitResult {
		const rect = targetRect as CollisionTargetRect | null | undefined;
		if (
			!rect?.width ||
			!rect.height ||
			rect.width <= 0 ||
			rect.height <= 0 ||
			!Number.isFinite(clickX) ||
			!Number.isFinite(clickY)
		) {
			return { name: "", canvasX: 0, canvasY: 0 };
		}

		const relX = (clickX - (rect.left ?? 0)) / rect.width;
		const relY = (clickY - (rect.top ?? 0)) / rect.height;

		const refW =
			rect.naturalWidth && rect.naturalWidth > 0
				? rect.naturalWidth
				: this.baseWidth && this.baseWidth > 0
					? this.baseWidth
					: 200;
		const refH =
			rect.naturalHeight && rect.naturalHeight > 0
				? rect.naturalHeight
				: this.baseHeight && this.baseHeight > 0
					? this.baseHeight
					: 400;

		const canvasX = Math.round(relX * refW);
		const canvasY = Math.round(relY * refH);

		const sid =
			surfaceId !== null && surfaceId !== undefined
				? String(surfaceId)
				: String(
						this.currentSurfaceIdFor?.(scopeId) ?? (scopeId === 1 ? 10 : 0),
					);

		const colList = this.collisions?.[sid] || this.collisions?.default || [];
		if (colList.length === 0) {
			return { name: "", canvasX, canvasY };
		}

		const sortKind = String(this.collisionSort || "none").toLowerCase();

		if (sortKind === "ascend" || sortKind === "id") {
			const sorted = colList.slice().sort((a, b) => {
				const idA = a.id ?? Number.MAX_SAFE_INTEGER;
				const idB = b.id ?? Number.MAX_SAFE_INTEGER;
				return idA - idB;
			});
			return findFirstHit(sorted, canvasX, canvasY);
		}

		if (sortKind === "descend") {
			const sorted = colList.slice().sort((a, b) => {
				const idA = a.id ?? -1;
				const idB = b.id ?? -1;
				return idB - idA;
			});
			return findFirstHit(sorted, canvasX, canvasY);
		}

		if (wasmBridge.isReady() && canvasX >= 0 && canvasY >= 0) {
			const wasmCols = toWasmCollisionList(colList);
			if (wasmCols) {
				const hitName = wasmBridge.findHitCollisionName(
					wasmCols,
					canvasX,
					canvasY,
				);
				if (hitName) {
					const hitLower = hitName.toLowerCase();
					const matched =
						colList.find((c) => c.name === hitName) ??
						colList.find(
							(c) => String(c.name ?? "").toLowerCase() === hitLower,
						);
					return buildCollisionHitResult(matched, canvasX, canvasY, hitName);
				}
			}
		}

		return findFirstHit(colList.slice().reverse(), canvasX, canvasY);
	},

	getCursorForCollision(
		this: SurfaceCollisionContext,
		scopeId: number | string,
		eventType: string,
		collisionName: string,
	): string | null {
		if (!this.cursors || !collisionName) return null;
		const evLower = String(eventType || "").toLowerCase();
		const colLower = String(collisionName).toLowerCase();

		for (const key of resolveScopeKeys(scopeId)) {
			const list = this.cursors[key];
			if (!Array.isArray(list)) continue;
			for (let i = list.length - 1; i >= 0; i--) {
				const entry = list[i];
				if (
					String(entry.event ?? "").toLowerCase() === evLower &&
					String(entry.collision ?? "").toLowerCase() === colLower
				) {
					return entry.cursor ?? null;
				}
			}
		}
		return null;
	},

	getTooltipForCollision(
		this: SurfaceCollisionContext,
		scopeId: number | string,
		collisionName: string,
	): string | null {
		if (!this.tooltips || !collisionName) return null;
		const colLower = String(collisionName).toLowerCase();

		for (const key of resolveScopeKeys(scopeId)) {
			const map = this.tooltips[key];
			if (!map || typeof map !== "object") continue;
			if (Object.hasOwn(map, collisionName)) {
				return map[collisionName];
			}
			for (const [k, v] of Object.entries(map)) {
				if (k.toLowerCase() === colLower) {
					return v;
				}
			}
		}
		return null;
	},
};
