/**
 * @file balloon-theme.ts
 * @brief バルーンスキンテーマ切替およびスキャン・リセット処理 (BalloonThemeManager)
 */
import {
	applyBalloonDescript,
	loadBalloonSkinImages,
} from "../../ghost/balloon-window/theme.js";
import { emit, invoke, isTauriAvailable, listen } from "../tauri-helper.js";
import {
	applyBalloonScale,
	type BalloonThemeManagerInterface,
	setBalloonThemeImpl,
} from "./balloon-theme-apply.js";
import { BALLOON_THEMES } from "./balloon-theme-constants.js";
import {
	computeValidRectLayout,
	resetBalloonDescriptDom,
	type ValidRectLayoutResult,
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

export interface BalloonInfoItem {
	dir_name?: string;
	name?: string;
	id?: string;
	[key: string]: unknown;
}

export type BalloonThemeApp = NonNullable<BalloonThemeManagerInterface["app"]>;

interface BalloonThemeActionContext {
	_balloonThemeManager?: BalloonThemeManager;
	balloonThemeManager?: BalloonThemeManager;
	[key: string]: unknown;
}

/**
 * バルーンスキン・テーマ・有効テキスト領域(validrect)およびタイポグラフィ統合マネージャー
 */
export class BalloonThemeManager implements BalloonThemeManagerInterface {
	[key: string]: unknown;
	app: BalloonThemeApp | null;
	currentTheme: string;
	userScale: number;
	dpiScale: number;
	availableBalloons: Array<BalloonInfoItem | string>;
	_validRectCache: Map<string, ValidRectLayoutResult>;
	_currentSide?: "left" | "right";

	constructor(app: BalloonThemeApp | null = null) {
		this.app = app;
		this.currentTheme = app?.currentBalloonTheme || "default";
		this.userScale = app?.balloonUserScale || 1;
		this.dpiScale = app?.balloonDpiScale || 1;
		this.availableBalloons = app?.availableBalloons || [];
		this._validRectCache = new Map();

		if (isTauriAvailable()) {
			void listen("request-balloon-scale-change", (event) => {
				const payload = (
					event as { payload?: { userScale?: unknown } } | null | undefined
				)?.payload;
				const userScale = Number(payload?.userScale);
				if (!Number.isNaN(userScale) && userScale > 0) {
					this.applyScale(userScale);
				}
			});
		}
	}

	/**
	 * 有効テキスト領域 (validrect) レイアウト設定を算出 (キャッシュ対応)
	 */
	computeValidRect(
		props: Record<string, string> = {},
		bgImageUrl: string | null = null,
		scopeId = 0,
	): ValidRectLayoutResult {
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
	clearValidRectCache(targetScopeId: number | null = null): void {
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

	getValidRectCache(key: string): ValidRectLayoutResult | undefined {
		return this._validRectCache.get(key);
	}

	get validRectCacheSize(): number {
		return this._validRectCache.size;
	}

	hasValidRectCache(key: string): boolean {
		return this._validRectCache.has(key);
	}

	/**
	 * バルーンアライメント表示位置の左右反転切り替え
	 */
	toggleBalloonSide(scopeId: number = 0): void {
		this._currentSide = this._currentSide === "left" ? "right" : "left";
		const nextSide = this._currentSide;
		const activeTheme =
			this.currentTheme || this.app?.currentBalloonTheme || "default";

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
			void emit("balloon-state-changed", {
				scopeId,
				side: nextSide,
				theme: activeTheme,
			});
		}

		void Promise.resolve(this.loadSkinImages(activeTheme, scopeId, nextSide))
			.then((dataUrl) => {
				if (!dataUrl || typeof document === "undefined") return;
				const cssUrl = `url("${dataUrl}")`;
				document.documentElement?.style?.setProperty?.(
					"--balloon-bg-image",
					cssUrl,
				);
				const balloonDisplays = document.querySelectorAll(".balloon-display");
				balloonDisplays.forEach((el) => {
					const bEl = el as HTMLElement;
					bEl.style?.setProperty?.("--balloon-bg-image", cssUrl);
				});
			})
			.catch(() => {});
	}

	/**
	 * バルーンテーマを順繰りに切り替え
	 */
	cycleTheme(): string {
		let themes: string[] = BALLOON_THEMES;
		if (this.availableBalloons.length > 0) {
			themes = this.availableBalloons.map((b) =>
				typeof b === "string" ? b : b.dir_name || b.name || b.id || "",
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
	async setTheme(themeName?: string): Promise<void> {
		return setBalloonThemeImpl(this, themeName);
	}

	async loadSkinImages(
		theme = "default",
		scopeId = 0,
		side: "left" | "right" | "top" | "auto" = "auto",
		balloonId: number | null = null,
	): Promise<string | null> {
		return loadBalloonSkinImages(theme, scopeId, side, balloonId);
	}

	async applyDescript(
		params: Parameters<typeof applyBalloonDescript>[0],
	): ReturnType<typeof applyBalloonDescript> {
		return applyBalloonDescript(params);
	}

	/**
	 * スケール率変更の反映
	 */
	applyScale(scale: number | string) {
		return applyBalloonScale(this, scale);
	}

	/**
	 * 利用可能なバルーン一覧を取得
	 */
	async scanAvailableBalloons(): Promise<Array<BalloonInfoItem | string>> {
		if (isTauriAvailable()) {
			try {
				let res = await invoke("list_balloons").catch(() => null);
				if (!res) {
					res = await invoke("scan_balloons").catch(() => null);
				}
				if (Array.isArray(res)) {
					this.availableBalloons = res as Array<BalloonInfoItem | string>;
					return this.availableBalloons;
				}
			} catch (e) {
				console.error("Failed to scan balloons:", e);
			}
		}
		return [];
	}

	async scanBalloons(): Promise<Array<BalloonInfoItem | string>> {
		return this.scanAvailableBalloons();
	}

	/**
	 * バルーン descript スタイルを初期化
	 */
	resetDescript(): void {
		this.clearValidRectCache();
		this.dpiScale = 1;
		if (this.app) {
			this.app.balloonDpiScale = 1;
		}
		resetBalloonDescriptDom(this.userScale, this.app ?? undefined);
	}
}

function getOrInitBalloonThemeManager(context: BalloonThemeActionContext) {
	if (!context.balloonThemeManager) {
		context.balloonThemeManager = new BalloonThemeManager(context);
	}
	return context.balloonThemeManager;
}

/**
 * 既存の Mixin 用アクションオブジェクト
 */
export const balloonThemeActions = {
	get balloonThemeManager(): BalloonThemeManager | undefined {
		return (this as unknown as BalloonThemeActionContext)._balloonThemeManager;
	},
	set balloonThemeManager(mgr: BalloonThemeManager | undefined) {
		(this as unknown as BalloonThemeActionContext)._balloonThemeManager = mgr;
	},

	async setTheme(this: BalloonThemeActionContext, themeName?: string) {
		const mgr = getOrInitBalloonThemeManager(this);
		return mgr.setTheme(themeName);
	},

	async setBalloonTheme(this: BalloonThemeActionContext, themeName?: string) {
		const mgr = getOrInitBalloonThemeManager(this);
		return mgr.setTheme(themeName);
	},

	cycleTheme(this: BalloonThemeActionContext) {
		const mgr = getOrInitBalloonThemeManager(this);
		return mgr.cycleTheme();
	},

	cycleBalloonTheme(this: BalloonThemeActionContext) {
		const mgr = getOrInitBalloonThemeManager(this);
		return mgr.cycleTheme();
	},

	applyBalloonScale(this: BalloonThemeActionContext, scale: number | string) {
		const mgr = getOrInitBalloonThemeManager(this);
		return mgr.applyScale(scale);
	},

	applyBalloonScaleAction(
		this: BalloonThemeActionContext,
		scale: number | string,
	) {
		const mgr = getOrInitBalloonThemeManager(this);
		return mgr.applyScale(scale);
	},

	resetBalloonDescript(this: BalloonThemeActionContext) {
		const mgr = getOrInitBalloonThemeManager(this);
		mgr.resetDescript();
	},

	async scanAvailableBalloons(this: BalloonThemeActionContext) {
		const mgr = getOrInitBalloonThemeManager(this);
		return mgr.scanAvailableBalloons();
	},

	async scanBalloons(this: BalloonThemeActionContext) {
		const mgr = getOrInitBalloonThemeManager(this);
		return mgr.scanBalloons();
	},

	toggleBalloonSide(this: BalloonThemeActionContext, scopeId: number = 0) {
		const mgr = getOrInitBalloonThemeManager(this);
		return mgr.toggleBalloonSide(scopeId);
	},
};
