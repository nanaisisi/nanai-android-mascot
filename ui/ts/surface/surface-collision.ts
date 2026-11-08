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
<<<<<<< HEAD
			return surfaceId as unknown;
=======
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			return surfaceId as any;
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
		}
		const lowerTarget = rawName.toLowerCase();

		// 1. Defined surface name lookup (`name,定義名`)
<<<<<<< HEAD
		const namesMap = (this as unknown).names;
=======
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const namesMap = (this as any).names;
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
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

		// 2. Alias lookup (`surface.alias` / `kero.surface.alias`)
		const map =
<<<<<<< HEAD
			scopeId === 1 ? (this as unknown).keroAliases : (this as unknown).aliases;
=======
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			scopeId === 1 ? (this as any).keroAliases : (this as any).aliases;
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
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
		if (!list || list.length === 0) {
<<<<<<< HEAD
			return surfaceId as unknown;
=======
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			return surfaceId as any;
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
		}
		return String(list[Math.floor(Math.random() * list.length)]);
	},

	detectCollision(
		clickX: number,
		clickY: number,
<<<<<<< HEAD
		targetRect: unknown,
=======
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		targetRect: any,
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
		surfaceId: number | string | null = null,
		scopeId: number = 0,
	) {
		const sid =
			surfaceId !== null
				? String(surfaceId)
<<<<<<< HEAD
				: String((this as unknown).currentSurfaceIdFor(scopeId));
=======
				: // biome-ignore lint/suspicious/noExplicitAny: automated fix
					String((this as any).currentSurfaceIdFor(scopeId));
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad

		const relX = (clickX - targetRect.left) / targetRect.width;
		const relY = (clickY - targetRect.top) / targetRect.height;

<<<<<<< HEAD
		const canvasX = Math.round(relX * (this as unknown).baseWidth);
		const canvasY = Math.round(relY * (this as unknown).baseHeight);

		const activeAnimationCols =
			(this as unknown).animationManager?.getActiveCollisions?.(scopeId) || [];
=======
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const canvasX = Math.round(relX * (this as any).baseWidth);
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const canvasY = Math.round(relY * (this as any).baseHeight);

		const activeAnimationCols =
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).animationManager?.getActiveCollisions?.(scopeId) || [];
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
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
<<<<<<< HEAD
			(this as unknown).collisions[sid] ||
			(this as unknown).collisions.default ||
			[];
=======
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).collisions[sid] || (this as any).collisions.default || [];
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
		if (colList.length === 0) {
			return { name: "", canvasX, canvasY };
		}

		const sortKind = String(
<<<<<<< HEAD
			(this as unknown).collisionSort || "none",
		).toLowerCase();

		let candidates: unknown[] = [];
		if (sortKind === "ascend" || sortKind === "id") {
			candidates = colList.slice().sort((a: unknown, b: unknown) => {
=======
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).collisionSort || "none",
		).toLowerCase();

		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		let candidates: any[] = [];
		if (sortKind === "ascend" || sortKind === "id") {
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			candidates = colList.slice().sort((a: any, b: any) => {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
				const idA = a.id != null ? a.id : Number.MAX_SAFE_INTEGER;
				const idB = b.id != null ? b.id : Number.MAX_SAFE_INTEGER;
				return idA - idB;
			});
		} else if (sortKind === "descend") {
<<<<<<< HEAD
			candidates = colList.slice().sort((a: unknown, b: unknown) => {
=======
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			candidates = colList.slice().sort((a: any, b: any) => {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
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
<<<<<<< HEAD
		if (!(this as unknown).cursors || !collisionName) return null;
=======
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		if (!(this as any).cursors || !collisionName) return null;
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
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
<<<<<<< HEAD
			(this as unknown).cursors[scopeKey],
			(this as unknown).cursors["*"],
=======
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).cursors[scopeKey],
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).cursors["*"],
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
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
<<<<<<< HEAD
		if (!(this as unknown).tooltips || !collisionName) return null;
=======
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		if (!(this as any).tooltips || !collisionName) return null;
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
		const scopeKey =
			scopeId === 0 || scopeId === "0"
				? "sakura"
				: scopeId === 1 || scopeId === "1"
					? "kero"
					: String(scopeId).toLowerCase();

		const colLower = String(collisionName).toLowerCase();

		const maps = [
<<<<<<< HEAD
			(this as unknown).tooltips[scopeKey],
			(this as unknown).tooltips["*"],
=======
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).tooltips[scopeKey],
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).tooltips["*"],
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
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
