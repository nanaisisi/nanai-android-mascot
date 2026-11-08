/**
 * @file surface-collision.ts
 * @brief サーフィスエイリアス解決およびマウス・タッチ当たり判定モジュール
 */
import { collisionContains } from "./shell-manifest.js";

const aliasCaseCache = new WeakMap<object, Map<string, number[]>>();
const nameCaseCache = new WeakMap<object, Map<string, string>>();
const tooltipCaseCache = new WeakMap<object, Map<string, string>>();
const cursorCaseCache = new WeakMap<object, Map<string, string>>();

export const surfaceCollisionMethods = {
	resolveSurfaceNumber(
		surfaceId: number | string | null | undefined,
		scopeId: number = 0,
	): number | string {
		const rawName = String(surfaceId ?? "").trim();
		if (rawName === "" || /^-?\d+$/.test(rawName)) {
			return surfaceId as unknown;
		}
		const lowerTarget = rawName.toLowerCase();

		// 1. Defined surface name lookup (`name,定義名`)
		const namesMap = (this as unknown).names;
		if (namesMap) {
			let lowerNames = nameCaseCache.get(namesMap);
			if (!lowerNames) {
				lowerNames = new Map();
				for (const sid in namesMap) {
					const defName = String(namesMap[sid] ?? "").trim();
					if (defName) {
						const k = defName.toLowerCase();
						if (!lowerNames.has(k)) {
							lowerNames.set(k, String(sid));
						}
					}
				}
				nameCaseCache.set(namesMap, lowerNames);
			}
			const foundSid = lowerNames.get(lowerTarget);
			if (foundSid !== undefined) {
				return foundSid;
			}
		}

		// 2. Alias lookup (`surface.alias` / `kero.surface.alias` / `char<N>.surface.alias`)
		let map: Record<string, number[]> | undefined;
		if (scopeId === 0) {
			map = (this as unknown).aliases;
		} else if (scopeId === 1) {
			map =
				(this as unknown).keroAliases ??
				(this as unknown).charAliases?.[1] ??
				(this as unknown).aliases;
		} else {
			map =
				(this as unknown).charAliases?.[scopeId] ?? (this as unknown).aliases;
		}

		let list = Array.isArray(map?.[rawName]) ? map[rawName] : null;
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
			list = lowerMap.get(lowerTarget) ?? null;
		}

		// Fallback to default aliases if not found in custom scope and scope is non-zero
		if ((!list || list.length === 0) && scopeId !== 0) {
			const fallbackMap = (this as unknown).aliases;
			if (fallbackMap && fallbackMap !== map) {
				list = Array.isArray(fallbackMap[rawName])
					? fallbackMap[rawName]
					: null;
				if (!list) {
					let lowerFallback = aliasCaseCache.get(fallbackMap);
					if (!lowerFallback) {
						lowerFallback = new Map();
						for (const key in fallbackMap) {
							const val = fallbackMap[key];
							if (Array.isArray(val)) {
								const lowerKey = key.toLowerCase();
								if (!lowerFallback.has(lowerKey))
									lowerFallback.set(lowerKey, val);
							}
						}
						aliasCaseCache.set(fallbackMap, lowerFallback);
					}
					list = lowerFallback.get(lowerTarget) ?? null;
				}
			}
		}

		if (!list || list.length === 0) {
			return surfaceId as unknown;
		}
		return String(list[Math.floor(Math.random() * list.length)]);
	},

	detectCollision(
		clickX: number,
		clickY: number,
		targetRect: unknown,
		surfaceId: number | string | null = null,
		scopeId: number = 0,
	) {
		const sid =
			surfaceId !== null
				? String(surfaceId)
				: String((this as unknown).currentSurfaceIdFor(scopeId));

		const relX = (clickX - targetRect.left) / targetRect.width;
		const relY = (clickY - targetRect.top) / targetRect.height;

		const canvasX = Math.round(relX * (this as unknown).baseWidth);
		const canvasY = Math.round(relY * (this as unknown).baseHeight);

		const activeAnimationCols =
			(this as unknown).animationManager?.getActiveCollisions?.(scopeId) || [];
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
			(this as unknown).collisions[sid] ||
			(this as unknown).collisions.default ||
			[];
		if (colList.length === 0) {
			return { name: "", canvasX, canvasY };
		}

		const sortKind = String(
			(this as unknown).collisionSort || "none",
		).toLowerCase();

		let candidates: unknown[] = [];
		if (sortKind === "ascend" || sortKind === "id") {
			candidates = colList.slice().sort((a: unknown, b: unknown) => {
				const idA = a.id != null ? a.id : Number.MAX_SAFE_INTEGER;
				const idB = b.id != null ? b.id : Number.MAX_SAFE_INTEGER;
				return idA - idB;
			});
		} else if (sortKind === "descend") {
			candidates = colList.slice().sort((a: unknown, b: unknown) => {
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
		if (!(this as unknown).cursors || !collisionName) return null;
		const scopeKey =
			scopeId === 0 || scopeId === "0"
				? "sakura"
				: scopeId === 1 || scopeId === "1"
					? "kero"
					: String(scopeId).toLowerCase();

		const evLower = String(eventType || "").toLowerCase();
		const colLower = String(collisionName).toLowerCase();
		const cacheKey = `${evLower}\0${colLower}`;

		const lists = [
			(this as unknown).cursors[scopeKey],
			(this as unknown).cursors["*"],
		].filter(Boolean);

		for (const list of lists) {
			let lowerMap = cursorCaseCache.get(list);
			if (!lowerMap) {
				lowerMap = new Map();
				// Iterate forwards so that later matching items overwrite earlier ones
				// matching the backwards iteration of the original implementation.
				for (let i = 0; i < list.length; i++) {
					const entry = list[i];
					const entryKey = `${entry.event.toLowerCase()}\0${entry.collision.toLowerCase()}`;
					lowerMap.set(entryKey, entry.cursor);
				}
				cursorCaseCache.set(list, lowerMap);
			}

			const cursor = lowerMap.get(cacheKey);
			if (cursor !== undefined) {
				return cursor;
			}
		}

		return null;
	},

	getTooltipForCollision(
		scopeId: number | string,
		collisionName: string,
	): string | null {
		if (!(this as unknown).tooltips || !collisionName) return null;
		const scopeKey =
			scopeId === 0 || scopeId === "0"
				? "sakura"
				: scopeId === 1 || scopeId === "1"
					? "kero"
					: String(scopeId).toLowerCase();

		const colLower = String(collisionName).toLowerCase();

		const maps = [
			(this as unknown).tooltips[scopeKey],
			(this as unknown).tooltips["*"],
		].filter(Boolean);

		for (const map of maps) {
			let lowerMap = tooltipCaseCache.get(map);
			if (!lowerMap) {
				lowerMap = new Map();
				for (const key in map) {
					lowerMap.set(key.toLowerCase(), map[key]);
				}
				tooltipCaseCache.set(map, lowerMap);
			}

			const tooltip = lowerMap.get(colLower);
			if (tooltip !== undefined) {
				return tooltip;
			}
		}

		return null;
	},
};
