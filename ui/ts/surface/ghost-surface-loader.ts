/**
 * @file ghost-surface-loader.ts
 * @brief サーフィスアセット（画像 / PNA）の読み込みキャッシュ管理モジュール
 */
import { invoke } from "../core/tauri-helper.js";

export interface GhostSurfaceLoaderHost {
	_surfaceAssetCache?: Map<string, Promise<string>>;
	app?: {
		surfaceManager?: {
			chromaKeyCache?: Map<string, string>;
			baseCanvasCache?: Map<string, HTMLCanvasElement>;
		};
	};
}

export const ghostSurfaceLoaderMethods = {
	/**
	 * サーフィス画像 / PNA の読み込み（ゴースト・シェル・ID 単位でキャッシュ）
	 */
	loadSurfaceAsset(
		this: GhostSurfaceLoaderHost,
		cmd: "load_surface_image" | "load_surface_pna",
		ghostPath: string,
		shellName: string,
		surfaceId: number | string,
	): Promise<string> {
		this._surfaceAssetCache ??= new Map();
		const key = `${cmd}|${ghostPath}|${shellName}|${surfaceId}`;
		let pending = this._surfaceAssetCache.get(key);
		if (!pending) {
			pending = invoke<string>(cmd, {
				ghostPath,
				shellName,
				surfaceId: String(surfaceId),
			});
			this._surfaceAssetCache.set(key, pending);
			if (this._surfaceAssetCache.size > 64) {
				const oldestKey = this._surfaceAssetCache.keys().next().value;
				if (oldestKey !== undefined) {
					this._surfaceAssetCache.delete(oldestKey);
				}
			}
		}
		return pending;
	},

	/** ゴースト・シェル切り替え時などに画像キャッシュを破棄 */
	clearSurfaceAssetCache(this: GhostSurfaceLoaderHost) {
		this._surfaceAssetCache?.clear();
		this.app?.surfaceManager?.chromaKeyCache?.clear();
		this.app?.surfaceManager?.baseCanvasCache?.clear();
	},
};
