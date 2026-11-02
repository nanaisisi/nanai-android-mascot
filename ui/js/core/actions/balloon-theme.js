/**
 * @file balloon-theme.js
 * @brief バルーンスキンテーマ切替およびスキャン・リセット処理 (BalloonThemeManager)
 */
import { emit, invoke, isTauriAvailable } from "../tauri-helper.js";

export const BALLOON_THEMES = ["ivory", "pixel", "comic", "dark"];
export const THEME_LABELS = {
	ivory: "アイボリー（象牙色レトロ）",
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

/**
 * バルーンスキン・テーマ・9スライスおよびタイポグラフィ統合マネージャー
 */
export class BalloonThemeManager {
	/**
	 * @param {any} [app]
	 */
	constructor(app = null) {
		this.app = app;
		this.currentTheme = app?.currentBalloonTheme || "ivory";
		this.userScale = app?.balloonUserScale || 1;
		this.dpiScale = app?.balloonDpiScale || 1;
		this.availableBalloons = app?.availableBalloons || [];
		/** @type {Map<string, { source: string, slice: string, width: string, repeat: string, cssBorderImage: string }>} */
		this._nineSliceCache = new Map();
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
		let scale = 1;
		if (typeof actionOrScale === "number") {
			scale = actionOrScale;
		} else if (BALLOON_SCALE_MAP[actionOrScale]) {
			scale = parseFloat(BALLOON_SCALE_MAP[actionOrScale]) || 1;
		} else {
			scale = parseFloat(actionOrScale) || 1;
		}

		this.userScale = scale;
		if (this.app) {
			this.app.balloonUserScale = scale;
		}
		const dpiScale = this.dpiScale || this.app?.balloonDpiScale || 1;
		const finalScale = +(scale * dpiScale).toFixed(4);
		const percent = Math.round(scale * 100);

		const root = document.documentElement;
		if (root) {
			root.style.setProperty("--balloon-user-scale", String(scale));
		}
		const balloonEl = document.querySelector(".balloon");
		if (balloonEl?.style) {
			balloonEl.style.transform = `scale(${finalScale})`;
			balloonEl.style.transformOrigin = "bottom left";
		}
		if (isTauriAvailable()) {
			emit("balloon-scale-changed", {
				userScale: scale,
				dpiScale,
				finalScale,
			});
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
			localStorage.setItem("nanai_balloon_theme", themeName);
		} catch (_) {
			// localStorage unavailable
		}

		const root = document.documentElement;
		if (root) {
			root.setAttribute("data-balloon-theme", themeName);
		}
		if (document.body) {
			document.body.className = `balloon-theme-${themeName}`;
		}
		this.app?.elements?.balloonDisplay?.setAttribute(
			"data-balloon-theme",
			themeName,
		);

		if (isTauriAvailable()) {
			emit("sync-theme", themeName);
		}

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
		const root = document.documentElement;
		this.dpiScale = 1;
		if (this.app) {
			this.app.balloonDpiScale = 1;
		}
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
			balloonEl.style.transform = userScale !== 1 ? `scale(${userScale})` : "";
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
		this.balloonThemeManager.currentTheme = this.currentBalloonTheme || "ivory";
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
		this.balloonThemeManager.currentTheme = this.currentBalloonTheme || "ivory";
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
