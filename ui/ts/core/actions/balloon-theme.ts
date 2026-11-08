/**
 * @file balloon-theme.js
 * @brief バルーンスキンテーマ切替およびスキャン・リセット処理 (BalloonThemeManager)
 */
import { emit, invoke, isTauriAvailable, listen } from "../tauri-helper.js";

export const BALLOON_THEMES = [
	"nam_default_plus",
	"nam_default_plus_overhead",
	"pixel",
	"comic",
	"dark",
];
export const THEME_LABELS = {
	nam_default_plus: "NAMデフォルト+",
	nam_default_plus_overhead: "NAMデフォルト+(頭上)",
	pixel: "ドット絵・ピクセル風（レトロゲーム）",
	comic: "ポップコミック（太枠丸み）",
	dark: "サイバーダーク（夜間・ハイコントラスト）",
};
export const BALLOON_SCALE_MAP = {
	"balloon-scale-50": "0.5",
	"balloon-scale-75": "0.75",
	"balloon-scale-100": "1",
	"balloon-scale-125": "1.25",
	"balloon-scale-150": "1.5",
	"balloon-scale-200": "2",
};

/** 許容されるバルーン倍率の境界値 */
export const MIN_BALLOON_SCALE = 0.1;
export const MAX_BALLOON_SCALE = 5.0;

/**
 * バルーンスキン・テーマ・9スライスおよびタイポグラフィ統合マネージャー
 */
export class BalloonThemeManager {
	app: any;
	currentTheme: any;
	userScale: any;
	dpiScale: any;
	availableBalloons: any;
	_nineSliceCache: Map<any, any>;
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
		const vl = parseInt(props["validrect.left"], 10);
		const vt = parseInt(props["validrect.top"], 10);
		const vr = parseInt(props["validrect.right"], 10);
		const vb = parseInt(props["validrect.bottom"], 10);

		const t = !Number.isNaN(vt) && vt >= 0 ? Math.max(8, vt) : 16;
		const r = !Number.isNaN(vr) && vr >= 0 ? Math.max(8, vr) : 16;
		const b = !Number.isNaN(vb) && vb >= 0 ? Math.max(8, vb) : 16;
		const l = !Number.isNaN(vl) && vl >= 0 ? Math.max(8, vl) : 16;

		const repeat = props["border.repeat"] || "repeat";
		const source = bgImageUrl || props["balloon.image"] || "";
		const cacheKey = `${t}_${r}_${b}_${l}_${repeat}_${source}`;

		if (this._nineSliceCache.has(cacheKey)) {
			return this._nineSliceCache.get(cacheKey);
		}

		const slice = `${t} ${r} ${b} ${l} fill`;
		const width = `${t}px ${r}px ${b}px ${l}px`;

		const cssBorderImage = source
			? `url("${source}") ${t} ${r} ${b} ${l} fill / ${width} ${repeat}`
			: "";

		const result = {
			source,
			slice,
			width,
			repeat,
			cssBorderImage,
		};
		this._nineSliceCache.set(cacheKey, result);
		return result;
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
				(/** @type {{ dir_name: unknown; }} */ b) => b.dir_name,
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
		const prevScale = this.userScale || 1;
		const prevPercent = Math.round(prevScale * 100);

		let rawScale = 1;
		if (typeof actionOrScale === "number") {
			rawScale = actionOrScale;
		} else if (BALLOON_SCALE_MAP[actionOrScale]) {
			rawScale = parseFloat(BALLOON_SCALE_MAP[actionOrScale]) || 1;
		} else {
			rawScale = parseFloat(actionOrScale) || 1;
		}

		if (Number.isNaN(rawScale) || !Number.isFinite(rawScale)) {
			rawScale = 1;
		}

		// 境界値安全クランプ [0.1, 5.0]
		const scale = Math.max(
			MIN_BALLOON_SCALE,
			Math.min(MAX_BALLOON_SCALE, rawScale),
		);

		this.userScale = scale;
		if (this.app) {
			this.app.balloonUserScale = scale;
		}
		const dpiScale = this.dpiScale || this.app?.balloonDpiScale || 1;
		const finalScale = +(scale * dpiScale).toFixed(4);
		const percent = Math.round(scale * 100);

		if (typeof document !== "undefined") {
			const root = document.documentElement;
			if (root) {
				root.style.setProperty("--balloon-user-scale", String(scale));
			}
			const balloonEl = document.querySelector(".balloon");
			if (balloonEl?.style) {
				balloonEl.style.transform = `scale(${finalScale})`;
				balloonEl.style.transformOrigin = "bottom left";
			}
		}

		if (isTauriAvailable()) {
			emit("balloon-scale-changed", {
				userScale: scale,
				dpiScale,
				finalScale,
			});
		}

		// UKADOC準拠: OnBalloonScaling SHIORIイベント送信 (Reference0: afterX, Reference1: beforeX, Reference2: afterY, Reference3: beforeY)
		if (percent !== prevPercent) {
			const gc = this.app?.ghostController;
			if (gc?.sendBalloonScalingNotify) {
				void gc.sendBalloonScalingNotify(
					percent,
					prevPercent,
					percent,
					prevPercent,
				);
			} else if (gc?.sendShioriEvent) {
				void gc.sendShioriEvent("OnBalloonScaling", [
					String(percent),
					String(prevPercent),
					String(percent),
					String(prevPercent),
				]);
			}
		}

		if (this.app?.showBalloon) {
			this.app.showBalloon(`バルーン倍率を ${percent}% に変更しました`);
			setTimeout(() => this.app?.hideBalloon?.(), 1500);
		}
		return { scale, finalScale, percent };
	}

	/**
	 * バルーンテーマを設定
	 * @param {string | undefined} themeName
	 */
	async setTheme(themeName) {
		if (!themeName || themeName === this.currentTheme) {
			return;
		}
		this.currentTheme = themeName;
		if (this.app) {
			this.app.currentBalloonTheme = themeName;
		}
		try {
			if (typeof localStorage !== "undefined") {
				localStorage.setItem("nanai_balloon_theme", themeName);
			}
		} catch (_) {
			// localStorage unavailable
		}

		if (typeof document !== "undefined") {
			const root = document.documentElement;
			if (root) {
				root.setAttribute("data-balloon-theme", themeName);
			}
			if (document.body) {
				document.body.className = `balloon-theme-${themeName}`;
			}
		}
		this.app?.elements?.balloonDisplay?.setAttribute(
			"data-balloon-theme",
			themeName,
		);

		if (isTauriAvailable()) {
			emit("sync-theme", themeName);
			if (themeName === "nam_default_plus_overhead") {
				void invoke("set_balloon_offset", {
					scopeId: 0,
					x: -40,
					y: -210,
				}).catch(() => {});
				void invoke("set_balloon_offset", {
					scopeId: 1,
					x: -40,
					y: -210,
				}).catch(() => {});
			} else if (themeName === "nam_default_plus") {
				void invoke("reset_balloon_positions").catch(() => {});
			}
		}

		this.clearNineSliceCache();
		this.resetDescript();
		if (isTauriAvailable()) {
			try {
				const props = await invoke("balloon_manifest", { name: themeName });
				if (props && typeof props === "object") {
					this.app?.applyBalloonDescript?.(props);
				}
			} catch (_e) {
				// スキン descript 未定義の場合は無視
			}
		}
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
		if (typeof document !== "undefined") {
			const root = document.documentElement;
			if (root) {
				for (const key of [
					"--balloon-dpi",
					"--balloon-dpi-scale",
					"--balloon-font-family",
					"--balloon-font-size",
					"--balloon-text-color",
					"--balloon-highlight-bg",
					"--balloon-highlight-text",
					"--balloon-border-image-source",
					"--balloon-border-image-slice",
					"--balloon-border-image-width",
					"--balloon-border-image-repeat",
					"--balloon-writing-mode",
					"--balloon-valign",
					"--balloon-halign",
					"--balloon-text-stroke",
					"--balloon-text-shadow",
					"--balloon-font-shadow-style",
					"--balloon-font-shadowstyle",
				]) {
					root.style.removeProperty(key);
				}
			}
			const balloonEl = document.querySelector(".balloon");
			if (balloonEl?.style) {
				balloonEl.style.padding = "";
				balloonEl.style.maxWidth = "";
				balloonEl.style.borderImage = "";
				const userScale = this.userScale || this.app?.balloonUserScale || 1;
				balloonEl.style.transform =
					userScale !== 1 ? `scale(${userScale})` : "";
			}
		}
		if (this.app?.elements?.balloonDisplay) {
			this.app.elements.balloonDisplay.style.left = "";
			this.app.elements.balloonDisplay.style.top = "";
		}
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
