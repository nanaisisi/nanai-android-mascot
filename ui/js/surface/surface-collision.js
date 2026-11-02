/**
 * @file surface-collision.js
 * @brief サーフィスエイリアス解決およびマウス・タッチ当たり判定モジュール
 */
import { collisionContains } from "./shell-manifest.js";

/** @type {WeakMap<object, Map<string, number[]>>} */
const aliasCaseCache = new WeakMap();

export const surfaceCollisionMethods = {
	/**
	 * サーフィスエイリアス名（surface.alias ブロック）をサーフィス番号へ解決する
	 * (UKADOC準拠: 複数番号が設定されている場合はランダム抽選)
	 *
	 * 数値または未登録の名前はそのまま返す。
	 * @this {import('./surface-manager.js').SurfaceManager}
	 * @param {number|string|null|undefined} surfaceId
	 * @param {number} [scopeId] - 0 (さくら / 共通) または 1 (うにゅ)
	 * @returns {number|string} 解決済みサーフィス番号（文字列）または元の値
	 */
	resolveSurfaceNumber(surfaceId, scopeId = 0) {
		const name = String(surfaceId ?? "").trim();
		if (name === "" || /^-?\d+$/.test(name)) {
			return surfaceId;
		}
		const map = scopeId === 1 ? this.keroAliases : this.aliases;
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
			return surfaceId;
		}
		return String(list[Math.floor(Math.random() * list.length)]);
	},

	/**
	 * マウス・タッチ座標から当たり部位（head, bust等）を判定
	 * `collision-sort` (ascend, descend, id, none) を反映し、AABB事前判定による高速化を行う
	 * @this {import('./surface-manager.js').SurfaceManager}
	 */
	detectCollision(clickX, clickY, targetRect, surfaceId = null, scopeId = 0) {
		const sid =
			surfaceId !== null
				? String(surfaceId)
				: String(this.currentSurfaceIdFor(scopeId));

		const relX = (clickX - targetRect.left) / targetRect.width;
		const relY = (clickY - targetRect.top) / targetRect.height;

		const canvasX = Math.round(relX * this.baseWidth);
		const canvasY = Math.round(relY * this.baseHeight);

		const colList = this.collisions[sid] || this.collisions.default || [];
		if (colList.length === 0) {
			return { name: "", canvasX, canvasY };
		}

		const sortKind = String(this.collisionSort || "none").toLowerCase();

		let candidates;
		if (sortKind === "ascend" || sortKind === "id") {
			// ID昇順: 0, 1, 2... の順に手前として判定
			candidates = colList.slice().sort((a, b) => {
				const idA = a.id != null ? a.id : Number.MAX_SAFE_INTEGER;
				const idB = b.id != null ? b.id : Number.MAX_SAFE_INTEGER;
				return idA - idB;
			});
		} else if (sortKind === "descend") {
			// ID降順: 10, 9, 8... の順に手前として判定
			candidates = colList.slice().sort((a, b) => {
				const idA = a.id != null ? a.id : -1;
				const idB = b.id != null ? b.id : -1;
				return idB - idA;
			});
		} else {
			// none または未指定: surfaces.txt で後に定義されたものが手前（逆順探索）
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

	/**
	 * 当たり判定名・イベント種別に対応するカーソル定義を取得
	 * @this {import('./surface-manager.js').SurfaceManager}
	 * @param {number|string} scopeId - 0 / 1 または "sakura" / "kero" / "char*"
	 * @param {string} eventType - mouseup, mousedown, mouserightdown, mousewheel, mousehover
	 * @param {string} collisionName - 当たり判定名 (例: "Head", "Bust")
	 * @returns {string|null} カーソル識別子 (例: "system:hand", "system:finger") または画像ファイルパス
	 */
	getCursorForCollision(scopeId, eventType, collisionName) {
		if (!this.cursors || !collisionName) return null;
		const scopeKey =
			scopeId === 0 || scopeId === "0"
				? "sakura"
				: scopeId === 1 || scopeId === "1"
					? "kero"
					: String(scopeId).toLowerCase();

		const evLower = String(eventType || "").toLowerCase();
		const colLower = String(collisionName).toLowerCase();

		const lists = [this.cursors[scopeKey], this.cursors["*"]].filter(Boolean);
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

	/**
	 * 当たり判定名に対応するツールチップテキストを取得
	 * @this {import('./surface-manager.js').SurfaceManager}
	 * @param {number|string} scopeId - 0 / 1 または "sakura" / "kero" / "char*"
	 * @param {string} collisionName - 当たり判定名 (例: "Head", "Bust")
	 * @returns {string|null} ツールチップ本文
	 */
	getTooltipForCollision(scopeId, collisionName) {
		if (!this.tooltips || !collisionName) return null;
		const scopeKey =
			scopeId === 0 || scopeId === "0"
				? "sakura"
				: scopeId === 1 || scopeId === "1"
					? "kero"
					: String(scopeId).toLowerCase();

		const maps = [this.tooltips[scopeKey], this.tooltips["*"]].filter(Boolean);
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
