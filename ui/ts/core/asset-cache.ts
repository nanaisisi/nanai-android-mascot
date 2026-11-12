/**
 * @file asset-cache.ts
 * @brief Nanai アプリ全体の三層アセットキャッシュ・プリロード統合マネージャー
 *
 * キャッシュ構造規定:
 * 1. CharacterCache: アプリ起動・表示ウィンドウ常時保持系 (Scope 0 / Scope 1+)
 * 2. BalloonCache: アクティブバルーン初期プリロード + スキン切り替えロード系
 * 3. MenuCache: メイン/サブキャラ/各種サブメニュー用の初期一括プリロード系
 */

export interface CacheEntry {
	url: string;
	image: HTMLImageElement;
	category: "character" | "balloon" | "menu";
	timestamp: number;
}

class AssetCacheManager {
	private characterCache = new Map<string, CacheEntry>();
	private balloonCache = new Map<string, CacheEntry>();
	private menuCache = new Map<string, CacheEntry>();

	/**
	 * 単一画像を非同期デコード & メモリ/GPUヘロード
	 */
	public async preload(
		url: string | null,
		category: "character" | "balloon" | "menu",
	): Promise<HTMLImageElement | null> {
		if (!url) return null;

		const targetMap = this.getCategoryMap(category);
		if (targetMap.has(url)) {
			return targetMap.get(url)?.image;
		}

		if (typeof Image === "undefined") return null;

		return new Promise((resolve) => {
			const img = new Image();
			img.onload = () => {
				const entry: CacheEntry = {
					url,
					image: img,
					category,
					timestamp: Date.now(),
				};
				targetMap.set(url, entry);

				if (img.decode) {
					img
						.decode()
						.then(() => resolve(img))
						.catch(() => resolve(img));
				} else {
					resolve(img);
				}
			};
			img.onerror = () => resolve(null);
			img.src = url;
		});
	}

	/**
	 * メニュー系アセット（メインメニュー、サブキャラメニュー、サブメニュー）の一括初期プリロード
	 */
	public async preloadMenuTheme(theme: {
		background_bitmap?: string;
		sidebar_bitmap?: string;
		foreground_bitmap?: string;
	}): Promise<void> {
		const tasks: Promise<unknown>[] = [];
		if (theme.background_bitmap)
			tasks.push(this.preload(theme.background_bitmap, "menu"));
		if (theme.sidebar_bitmap)
			tasks.push(this.preload(theme.sidebar_bitmap, "menu"));
		if (theme.foreground_bitmap)
			tasks.push(this.preload(theme.foreground_bitmap, "menu"));
		await Promise.all(tasks);
	}

	/**
	 * キャッシュされているか確認
	 */
	public has(url: string, category: "character" | "balloon" | "menu"): boolean {
		return this.getCategoryMap(category).has(url);
	}

	/**
	 * キャッシュから取得
	 */
	public get(
		url: string,
		category: "character" | "balloon" | "menu",
	): HTMLImageElement | null {
		return this.getCategoryMap(category).get(url)?.image ?? null;
	}

	private getCategoryMap(category: "character" | "balloon" | "menu") {
		switch (category) {
			case "character":
				return this.characterCache;
			case "balloon":
				return this.balloonCache;
			case "menu":
				return this.menuCache;
		}
	}
}

export const assetCache = new AssetCacheManager();
