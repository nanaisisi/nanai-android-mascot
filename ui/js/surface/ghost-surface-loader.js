/**
 * @file ghost-surface-loader.js
 * @brief サーフィスアセット（画像 / PNA）の読み込みキャッシュ管理モジュール
 */
import { invoke } from "../core/tauri-helper.js";

export const ghostSurfaceLoaderMethods = {
	/**
	 * サーフィス画像 / PNA の読み込み（ゴースト・シェル・ID 単位でキャッシュ）
	 * アニメーションの毎フレームで同じファイルを Rust から読み直さないようにする
	 * @this {import('../ghost/ghost.js').GhostController}
	 * @param {"load_surface_image"|"load_surface_pna"} cmd
	 * @param {string} ghostPath
	 * @param {string} shellName
	 * @param {number|string} surfaceId
	 * @returns {Promise<string>}
	 */
	loadSurfaceAsset(cmd, ghostPath, shellName, surfaceId) {
		this._surfaceAssetCache ??= new Map();
		const key = `${cmd}|${ghostPath}|${shellName}|${surfaceId}`;
		let pending = this._surfaceAssetCache.get(key);
		if (!pending) {
			pending = invoke(cmd, {
				ghostPath,
				shellName,
				surfaceId: String(surfaceId),
			});
			this._surfaceAssetCache.set(key, pending);
			if (this._surfaceAssetCache.size > 64) {
				this._surfaceAssetCache.delete(
					this._surfaceAssetCache.keys().next().value,
				);
			}
		}
		return pending;
	},

	/** ゴースト・シェル切り替え時などに画像キャッシュを破棄 */
	clearSurfaceAssetCache() {
		this._surfaceAssetCache?.clear();
		this.app?.surfaceManager?.chromaKeyCache?.clear();
		this.app?.surfaceManager?.baseCanvasCache?.clear();
	},
};
