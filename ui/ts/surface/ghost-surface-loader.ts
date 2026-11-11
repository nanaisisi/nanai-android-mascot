/**
 * @file ghost-surface-loader.ts
 * @brief サーフィスアセット（画像 / PNA）の読み込みキャッシュ管理モジュール
 */
import { invoke } from "../core/tauri-helper.js";

export const ghostSurfaceLoaderMethods = {
	/**
	 * サーフィス画像 / PNA の読み込み（ゴースト・シェル・ID 単位でキャッシュ）
	 */
	loadSurfaceAsset(
		cmd: "load_surface_image" | "load_surface_pna",
		ghostPath: string,
		shellName: string,
		surfaceId: number | string,
	): Promise<string> {
		(this as unknown)._surfaceAssetCache ??= new Map();
		const key = `${cmd}|${ghostPath}|${shellName}|${surfaceId}`;
		let pending = (this as unknown)._surfaceAssetCache.get(key);
		if (!pending) {
			pending = invoke(cmd, {
				ghostPath,
				shellName,
				surfaceId: String(surfaceId),
			});
			(this as unknown)._surfaceAssetCache.set(key, pending);
			if ((this as unknown)._surfaceAssetCache.size > 64) {
				(this as unknown)._surfaceAssetCache.delete(
					(this as unknown)._surfaceAssetCache.keys().next().value,
				);
			}
		}
		return pending;
	},

	/** ゴースト・シェル切り替え時などに画像キャッシュを破棄 */
	clearSurfaceAssetCache(this: unknown) {
		this._surfaceAssetCache?.clear();
		this.app?.surfaceManager?.chromaKeyCache?.clear();
		this.app?.surfaceManager?.baseCanvasCache?.clear();
	},
};
