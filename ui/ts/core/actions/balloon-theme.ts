// @ts-nocheck
/**
 * @file balloon-theme.js
 * @brief バルーンスキンテーマ切替およびスキャン・リセット処理 (BalloonThemeManager)
 */
import { invoke, isTauriAvailable, listen } from "../tauri-helper.js";
import {
	applyBalloonScale,
	setBalloonThemeImpl,
} from "./balloon-theme-apply.js";
import { BALLOON_THEMES } from "./balloon-theme-constants.js";
import {
	computeValidRectLayout,
	resetBalloonDescriptDom,
} from "./balloon-theme-dom.js";

export {
	applyBalloonScale,
	setBalloonThemeImpl,
} from "./balloon-theme-apply.js";
export {
	BALLOON_SCALE_MAP,
	BALLOON_THEMES,
	MAX_BALLOON_SCALE,
	MIN_BALLOON_SCALE,
	THEME_LABELS,
} from "./balloon-theme-constants.js";
export {
	computeValidRectLayout,
	resetBalloonDescriptDom,
} from "./balloon-theme-dom.js";

/**
 * バルーンスキン・テーマ・有効テキスト領域(validrect)およびタイポグラフィ統合マネージャー
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
		/** @type {Map<string, import("./balloon-theme-dom.js").ValidRectLayoutResult>} */
		this._validRectCache = new Map();

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
	 * 有効テキスト領域 (validrect) レイアウト設定を算出 (キャッシュ対応)
	 */
	computeValidRect(props = {}, bgImageUrl = null, scopeId = 0) {
		return computeValidRectLayout(
			this._validRectCache,
			props,
			bgImageUrl,
			scopeId,
		);
	}

	/**
	 * validrect キャッシュの明示的クリア（オプションで特定scopeIdのみクリア可能）
	 */
	clearValidRectCache(targetScopeId = null) {
		if (targetScopeId !== null && typeof targetScopeId === "number") {
			if (targetScopeId === 0) {
				for (const key of Array.from(this._validRectCache.keys())) {
					if (!key.startsWith("scope")) {
						this._validRectCache.delete(key);
					}
				}
			} else {
				const prefix = `scope${targetScopeId}_`;
				for (const key of Array.from(this._validRectCache.keys())) {
					if (key.startsWith(prefix)) {
						this._validRectCache.delete(key);
					}
				}
			}
			return;
		}
		this._validRectCache.clear();
	}

	getValidRectCache(key) {
		return this._validRectCache.get(key);
	}

	get validRectCacheSize() {
		return this._validRectCache.size;
	}

	hasValidRectCache(key) {
		return this._validRectCache.has(key);
	}

	/**
	 * バルーンアライメント表示位置の左右反転切り替え
	 */
	toggleBalloonSide(scopeId: number = 0) {
		this._currentSide = this._currentSide === "left" ? "right" : "left";
		const nextSide = this._currentSide;

		if (typeof document !== "undefined") {
			const balloonDisplays = document.querySelectorAll(".balloon-display");
			balloonDisplays.forEach((el) => {
				const bEl = el as HTMLElement;
				bEl.setAttribute("data-balloon-side", nextSide);
				bEl.classList.toggle("balloon-side-left", nextSide === "left");
				bEl.classList.toggle("balloon-side-right", nextSide === "right");
			});
		}

		if (isTauriAvailable()) {
			const offsetX = nextSide === "left" ? -240 : 40;
			void invoke("set_balloon_offset", {
				scopeId,
				x: offsetX,
				y: -120,
			}).catch(() => {});
		}
	}

	/**
	 * バルーンテーマを順繰りに切り替え
	 */
	cycleTheme() {
		let themes = BALLOON_THEMES;
		if (this.availableBalloons.length > 0) {
			themes = this.availableBalloons.map(
				(b) => b.dir_name || b.name || b.id || b,
			);
		}
		const idx = themes.indexOf(this.currentTheme);
		const nextIdx = (idx + 1) % themes.length;
		const nextTheme = themes[nextIdx];
		void this.setTheme(nextTheme);
		return nextTheme;
	}

	/**
	 * バルーンテーマの設定
	 */
	async setTheme(themeName) {
		return setBalloonThemeImpl(this, themeName);
	}

	/**
	 * スケール率変更の反映
	 */
	applyScale(scale) {
		return applyBalloonScale(this, scale);
	}

	/**
	 * 利用可能なバルーン一覧を取得
	 */
	async scanAvailableBalloons() {
		if (isTauriAvailable()) {
			try {
				let res = await invoke("list_balloons").catch(() => null);
				if (!res) {
					res = await invoke("scan_balloons").catch(() => null);
				}
				if (Array.isArray(res)) {
					this.availableBalloons = res;
					return res;
				}
			} catch (e) {
				console.error("Failed to scan balloons:", e);
			}
		}
		return [];
	}

	async scanBalloons() {
		return this.scanAvailableBalloons();
	}

	/**
	 * バルーン descript スタイルを初期化
	 */
	resetDescript() {
		this.clearValidRectCache();
		this.dpiScale = 1;
		if (this.app) {
			this.app.balloonDpiScale = 1;
		}
		resetBalloonDescriptDom(this.userScale, this.app);
	}
}

function getOrInitBalloonThemeManager(context: {
	balloonThemeManager?: BalloonThemeManager;
	[key: string]: unknown;
}) {
	if (!context.balloonThemeManager) {
		context.balloonThemeManager = new BalloonThemeManager(context);
	}
	return context.balloonThemeManager;
}

/**
 * 既存の Mixin 用アクションオブジェクト
 */
export const balloonThemeActions = {
	get balloonThemeManager() {
		return this._balloonThemeManager;
	},
	set balloonThemeManager(mgr) {
		this._balloonThemeManager = mgr;
	},

	async setTheme(themeName: string) {
		const mgr = getOrInitBalloonThemeManager(this);
		return mgr.setTheme(themeName);
	},

	async setBalloonTheme(themeName: string) {
		return this.setTheme(themeName);
	},

	cycleTheme() {
		const mgr = getOrInitBalloonThemeManager(this);
		return mgr.cycleTheme();
	},

	cycleBalloonTheme() {
		return this.cycleTheme();
	},

	applyBalloonScale(scale: number | string) {
		const mgr = getOrInitBalloonThemeManager(this);
		return mgr.applyScale(scale);
	},

	applyBalloonScaleAction(scale: number | string) {
		return this.applyBalloonScale(scale);
	},

	resetBalloonDescript() {
		const mgr = getOrInitBalloonThemeManager(this);
		mgr.resetDescript();
	},

	async scanAvailableBalloons() {
		const mgr = getOrInitBalloonThemeManager(this);
		return mgr.scanAvailableBalloons();
	},

	async scanBalloons() {
		const mgr = getOrInitBalloonThemeManager(this);
		return mgr.scanBalloons();
	},

	toggleBalloonSide(scopeId: number = 0) {
		const mgr = getOrInitBalloonThemeManager(this);
		return mgr.toggleBalloonSide(scopeId);
	},
};
