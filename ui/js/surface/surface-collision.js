/**
 * @file surface-collision.js
 * @brief サーフィスエイリアス解決およびマウス・タッチ当たり判定モジュール
 */
import { collisionContains } from "./shell-manifest.js";

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
			const lowerName = name.toLowerCase();
			for (const key in map) {
				if (key.toLowerCase() === lowerName) {
					const val = map[key];
					list = Array.isArray(val) ? val : null;
					break;
				}
			}
		}
		if (!list || list.length === 0) {
			return surfaceId;
		}
		return String(list[Math.floor(Math.random() * list.length)]);
	},

	/**
	 * マウス・タッチ座標から当たり部位（head, bust等）を判定
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

		for (let i = colList.length - 1; i >= 0; i--) {
			const col = colList[i];
			if (collisionContains(col, canvasX, canvasY)) {
				return {
					name: col.name,
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
};
