/**
 * @file surface-collision.ts
 * @brief サーフィスエイリアス解決およびマウス・タッチ当たり判定モジュール
 */
import { collisionContains } from "./shell-manifest.js";

const aliasCaseCache = new WeakMap<object, Map<string, number[]>>();

export const surfaceCollisionMethods = {
	resolveSurfaceNumber(
		surfaceId: number | string | null | undefined,
		scopeId: number = 0,
	): number | string {
		const name = String(surfaceId ?? "").trim();
		if (name === "" || /^-?\d+$/.test(name)) {
			return surfaceId as any;
		}
		const map =
			scopeId === 1 ? (this as any).keroAliases : (this as any).aliases;
		let list = Array.isArray(map?.[name]) ? map[name] : null;
		if (!list && map) {
			let lowerMap = aliasCaseCache.get(map);
			if (!lowerMap) {
				lowerMap = new Map();
				for (const key in map) {
					const val = map[key];
					if (Array.isArray(val)) {
						const lowerKey = key.toLowerCase();
						if (!lowerMap.has(lowerKey)) lowerMap.set(lowerKey, val);
					}
				}
				aliasCaseCache.set(map, lowerMap);
			}
			list = lowerMap.get(name.toLowerCase()) ?? null;
		}
		if (!list || list.length === 0) {
			return surfaceId as any;
		}
		return String(list[Math.floor(Math.random() * list.length)]);
	},

	detectCollision(
		clickX: number,
		clickY: number,
		targetRect: any,
		surfaceId: number | string | null = null,
		scopeId: number = 0,
	) {
		const sid =
			surfaceId !== null
				? String(surfaceId)
				: String((this as any).currentSurfaceIdFor(scopeId));

		const relX = (clickX - targetRect.left) / targetRect.width;
		const relY = (clickY - targetRect.top) / targetRect.height;

		const canvasX = Math.round(relX * (this as any).baseWidth);
		const canvasY = Math.round(relY * (this as any).baseHeight);

		const activeAnimationCols =
			(this as any).animationManager?.getActiveCollisions?.(scopeId) || [];
		for (let i = activeAnimationCols.length - 1; i >= 0; i--) {
			const col = activeAnimationCols[i];
			if (collisionContains(col, canvasX, canvasY)) {
				return {
					name: col.name,
					id: col.id,
					canvasX,
					canvasY,
				};
			}
		}

		const colList =
			(this as any).collisions[sid] || (this as any).collisions.default || [];
		if (colList.length === 0) {
			return { name: "", canvasX, canvasY };
		}

		const sortKind = String(
			(this as any).collisionSort || "none",
		).toLowerCase();

		let candidates;
		if (sortKind === "ascend" || sortKind === "id") {
			candidates = colList.slice().sort((a: any, b: any) => {
				const idA = a.id != null ? a.id : Number.MAX_SAFE_INTEGER;
				const idB = b.id != null ? b.id : Number.MAX_SAFE_INTEGER;
				return idA - idB;
			});
		} else if (sortKind === "descend") {
			candidates = colList.slice().sort((a: any, b: any) => {
				const idA = a.id != null ? a.id : -1;
				const idB = b.id != null ? b.id : -1;
				return idB - idA;
			});
		} else {
			for (let i = colList.length - 1; i >= 0; i--) {
				const col = colList[i];
				if (collisionContains(col, canvasX, canvasY)) {
					return {
						name: col.name,
						id: col.id,
						canvasX,
						canvasY,
					};
				}
			}
			return { name: "", canvasX, canvasY };
		}

		for (let i = 0; i < candidates.length; i++) {
			const col = candidates[i];
			if (collisionContains(col, canvasX, canvasY)) {
				return {
					name: col.name,
					id: col.id,
					canvasX,
					canvasY,
				};
			}
		}

		return {
			name: "",
			canvasX,
			canvasY,
		};
	},

	getCursorForCollision(
		scopeId: number | string,
		eventType: string,
		collisionName: string,
	): string | null {
		if (!(this as any).cursors || !collisionName) return null;
		const scopeKey =
			scopeId === 0 || scopeId === "0"
				? "sakura"
				: scopeId === 1 || scopeId === "1"
					? "kero"
					: String(scopeId).toLowerCase();

		const evLower = String(eventType || "").toLowerCase();
		const colLower = String(collisionName).toLowerCase();

		const lists = [
			(this as any).cursors[scopeKey],
			(this as any).cursors["*"],
		].filter(Boolean);
		for (const list of lists) {
			for (let i = list.length - 1; i >= 0; i--) {
				const entry = list[i];
				if (
					entry.event.toLowerCase() === evLower &&
					entry.collision.toLowerCase() === colLower
				) {
					return entry.cursor;
				}
			}
		}

		return null;
	},

	getTooltipForCollision(
		scopeId: number | string,
		collisionName: string,
	): string | null {
		if (!(this as any).tooltips || !collisionName) return null;
		const scopeKey =
			scopeId === 0 || scopeId === "0"
				? "sakura"
				: scopeId === 1 || scopeId === "1"
					? "kero"
					: String(scopeId).toLowerCase();

		const maps = [
			(this as any).tooltips[scopeKey],
			(this as any).tooltips["*"],
		].filter(Boolean);
		const colLower = String(collisionName).toLowerCase();
		for (const map of maps) {
			for (const key in map) {
				if (key.toLowerCase() === colLower) {
					return map[key];
				}
			}
		}

		return null;
	},
};
