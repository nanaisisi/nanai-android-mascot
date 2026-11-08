// @ts-nocheck
/**
 * @file balloon-theme.js
 * @brief バルーンスキンテーマ切替およびスキャン・リセット処理 (BalloonThemeManager)
 */
import { emit, invoke, isTauriAvailable, listen } from "../tauri-helper.js";
import {
	applyBalloonScale,
	setBalloonThemeImpl,
} from "./balloon-theme-apply.js";
import {
	BALLOON_SCALE_MAP,
	BALLOON_THEMES,
	MAX_BALLOON_SCALE,
	MIN_BALLOON_SCALE,
	THEME_LABELS,
} from "./balloon-theme-constants.js";
import {
	computeNineSliceLayout,
	resetBalloonDescriptDom,
} from "./balloon-theme-dom.js";

export {
	BALLOON_SCALE_MAP,
	BALLOON_THEMES,
	MAX_BALLOON_SCALE,
	MIN_BALLOON_SCALE,
	THEME_LABELS,
} from "./balloon-theme-constants.js";
export {
	applyBalloonScale,
	setBalloonThemeImpl,
} from "./balloon-theme-apply.js";

/**
 * バルーンスキン・テーマ・9スライスおよびタイポグラフィ統合マネージャー
 */
export class BalloonThemeManager {
	/**
	 * @param {any} [app]
	 */
	constructor(app = null) {
		this.app = app;
		this.currentTheme = app?.currentBalloonTheme || "default";
		this.userScale = app?.balloonUserScale || 1;
		this.dpiScale = app?.balloonDpiScale || 1;
		this.availableBalloons = app?.availableBalloons || [];
		/** @type {Map<string, { source: string, slice: string, width: string, repeat: string, cssBorderImage: string }>} */
		this._nineSliceCache = new Map();

		if (isTauriAvailable()) {
			void listen("request-balloon-scale-change", (event) => {
				const userScale = Number(event.payload?.userScale);
				if (!Number.isNaN(userScale) && userScale > 0) {
					this.applyScale(userScale);
				}
			});
		}
	}

	/**
	 * 9スライス分割設定 (border-image) を有効矩形 (validrect) 等から算出 (キャッシュ対応)
	 * @param {Record<string, string>} props
	 * @param {string | null} [bgImageUrl]
	 * @returns {{ source: string, slice: string, width: string, repeat: string, cssBorderImage: string } | null}
	 */
	computeNineSlice(props = {}, bgImageUrl = null) {
		return computeNineSliceLayout(this._nineSliceCache, props, bgImageUrl);
	}

	/**
	 * 9スライスキャッシュの明示的クリア
	 */
	clearNineSliceCache() {
		this._nineSliceCache.clear();
	}

	/**
	 * 9スライスキャッシュのサイズ取得
	 * @returns {number}
	 */
	get nineSliceCacheSize() {
		return this._nineSliceCache.size;
	}

	/**
	 * 9スライスキャッシュ内に特定キーが存在するか確認
	 * @param {string} key
	 * @returns {boolean}
	 */
	hasNineSliceCache(key) {
		return this._nineSliceCache.has(key);
	}

	/**
	 * バルーンテーマを順繰りに切り替え
	 */
	cycleTheme() {
		let themes = BALLOON_THEMES;
		if (this.availableBalloons && this.availableBalloons.length > 0) {
			themes = this.availableBalloons.map(
				(/** @type {{ dir_name: any; }} */ b) => b.dir_name,
			);
		}
		const idx = themes.indexOf(this.currentTheme);
		const next = themes[(idx + 1) % themes.length];
		this.setTheme(next);

		let label = THEME_LABELS[next] || next;
		if (this.availableBalloons) {
			const bInfo = this.availableBalloons.find(
				(/** @type {{ dir_name: string | undefined; }} */ b) =>
					b.dir_name === next,
			);
			if (bInfo) label = bInfo.name;
		}
		if (this.app?.showBalloon) {
			this.app.showBalloon(`バルーンスキンを「${label}」に変更しました`);
			setTimeout(() => this.app?.hideBalloon?.(), 2000);
		}
		return next;
	}

	/**
	 * バルーン拡大率の反映
	 * @param {string | number} actionOrScale
	 */
	applyScale(actionOrScale) {
		return applyBalloonScale(this, actionOrScale);
	}

	/**
	 * バルーンテーマを設定
	 * @param {string | undefined} themeName
	 */
	async setTheme(themeName) {
		return setBalloonThemeImpl(this, themeName);
	}

	/**
	 * インストール済みバルーンスキンをスキャン
	 */
	async scanBalloons() {
		if (isTauriAvailable()) {
			try {
				const balloons = await invoke("scan_balloons");
				if (balloons && balloons.length > 0) {
					this.availableBalloons = balloons;
					if (this.app) {
						this.app.availableBalloons = balloons;
					}
					emit("sync-balloons", balloons);
					return balloons;
				}
			} catch (e) {
				console.error("Failed to scan balloons:", e);
			}
		}
		return [];
	}

	/**
	 * バルーン descript スタイルを初期化
	 */
	resetDescript() {
		this.clearNineSliceCache();
		this.dpiScale = 1;
		if (this.app) {
			this.app.balloonDpiScale = 1;
		}
		resetBalloonDescriptDom(this.userScale, this.app);
	}
}

/**
 * 既存の Mixin 用アクションオブジェクト (下位互換性確保)
 */
export const balloonThemeActions = {
	cycleBalloonTheme() {
		if (!this.balloonThemeManager) {
			this.balloonThemeManager = new BalloonThemeManager(this);
		}
		this.balloonThemeManager.availableBalloons = this.availableBalloons || [];
		this.balloonThemeManager.currentTheme =
			this.currentBalloonTheme || "default";
		return this.balloonThemeManager.cycleTheme();
	},

	/**
	 * @param {string} action
	 */
	applyBalloonScaleAction(action) {
		if (!this.balloonThemeManager) {
			this.balloonThemeManager = new BalloonThemeManager(this);
		}
		this.balloonThemeManager.dpiScale = this.balloonDpiScale || 1;
		return this.balloonThemeManager.applyScale(action);
	},

	/**
	 * @param {string | undefined} themeName
	 */
	async setBalloonTheme(themeName) {
		if (!this.balloonThemeManager) {
			this.balloonThemeManager = new BalloonThemeManager(this);
		}
		this.balloonThemeManager.currentTheme =
			this.currentBalloonTheme || "default";
		await this.balloonThemeManager.setTheme(themeName);
		this.currentBalloonTheme = this.balloonThemeManager.currentTheme;
	},

	async scanBalloons() {
		if (!this.balloonThemeManager) {
			this.balloonThemeManager = new BalloonThemeManager(this);
		}
		const result = await this.balloonThemeManager.scanBalloons();
		this.availableBalloons = this.balloonThemeManager.availableBalloons;
		return result;
	},

	resetBalloonDescript() {
		if (!this.balloonThemeManager) {
			this.balloonThemeManager = new BalloonThemeManager(this);
		}
		this.balloonThemeManager.userScale = this.balloonUserScale || 1;
		this.balloonThemeManager.resetDescript();
		this.balloonDpiScale = this.balloonThemeManager.dpiScale;
	},
};
