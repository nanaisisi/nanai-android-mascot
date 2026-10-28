/**
 * @file balloon-theme.js
 * @brief バルーンスキンテーマ切替およびスキャン・リセット処理
 */
import { emit, invoke, isTauriAvailable } from "../tauri-helper.js";

const BALLOON_THEMES = ["ivory", "pixel", "comic", "dark"];
const THEME_LABELS = {
	ivory: "アイボリー（象牙色レトロ）",
	pixel: "ドット絵・ピクセル風（レトロゲーム）",
	comic: "ポップコミック（太枠丸み）",
	dark: "サイバーダーク（夜間・ハイコントラスト）",
};
const BALLOON_SCALE_MAP = {
	"balloon-scale-50": "0.5",
	"balloon-scale-75": "0.75",
	"balloon-scale-100": "1",
	"balloon-scale-125": "1.25",
	"balloon-scale-150": "1.5",
	"balloon-scale-200": "2",
};

export const balloonThemeActions = {
	cycleBalloonTheme() {
		let themes = BALLOON_THEMES;
		if (this.availableBalloons && this.availableBalloons.length > 0) {
			themes = this.availableBalloons.map(
				(/** @type {{ dir_name: any; }} */ b) => b.dir_name,
			);
		}
		const idx = themes.indexOf(this.currentBalloonTheme);
		const next = themes[(idx + 1) % themes.length];
		this.setBalloonTheme(next);

		let label = THEME_LABELS[next] || next;
		if (this.availableBalloons) {
			const bInfo = this.availableBalloons.find(
				(/** @type {{ dir_name: string | undefined; }} */ b) =>
					b.dir_name === next,
			);
			if (bInfo) label = bInfo.name;
		}
		this.showBalloon(`バルーンスキンを「${label}」に変更しました`);
		setTimeout(() => this.hideBalloon(), 2000);
	},

	/**
	 * @param {string} action
	 */
	applyBalloonScaleAction(action) {
		const userScale = parseFloat(BALLOON_SCALE_MAP[action] || "1") || 1;
		this.balloonUserScale = userScale;
		const dpiScale = this.balloonDpiScale || 1;
		const finalScale = +(userScale * dpiScale).toFixed(4);
		const percent = Math.round(userScale * 100);
		document.documentElement.style.setProperty(
			"--balloon-user-scale",
			String(userScale),
		);
		const balloonEl = document.querySelector(".balloon");
		if (balloonEl) {
			balloonEl.style.transform = `scale(${finalScale})`;
			balloonEl.style.transformOrigin = "bottom left";
		}
		if (isTauriAvailable()) {
			emit("balloon-scale-changed", { userScale, dpiScale, finalScale });
		}
		this.showBalloon(`バルーン倍率を ${percent}% に変更しました`);
		setTimeout(() => this.hideBalloon(), 1500);
	},

	/**
	 * @param {string | undefined} themeName
	 */
	async setBalloonTheme(themeName) {
		if (!themeName || themeName === this.currentBalloonTheme) {
			return;
		}
		this.currentBalloonTheme = themeName;
		localStorage.setItem("nanai_balloon_theme", themeName);
		document.documentElement.setAttribute("data-balloon-theme", themeName);
		document.body.className = `balloon-theme-${themeName}`;
		this.elements.balloonDisplay?.setAttribute("data-balloon-theme", themeName);
		if (isTauriAvailable()) {
			emit("sync-theme", themeName);
		}

		this.resetBalloonDescript();
		if (isTauriAvailable()) {
			try {
				const props = await invoke("balloon_manifest", { name: themeName });
				if (props && typeof props === "object") {
					this.applyBalloonDescript(props);
				}
			} catch (_e) {
				// スキン descript 未定義の場合は無視
			}
		}
	},

	async scanBalloons() {
		if (isTauriAvailable()) {
			try {
				const balloons = await invoke("scan_balloons");
				if (balloons && balloons.length > 0) {
					this.availableBalloons = balloons;
					emit("sync-balloons", balloons);
				}
			} catch (e) {
				console.error("Failed to scan balloons:", e);
			}
		}
	},

	resetBalloonDescript() {
		const root = document.documentElement;
		this.balloonDpiScale = 1;
		for (const key of [
			"--balloon-dpi",
			"--balloon-dpi-scale",
			"--balloon-font-family",
			"--balloon-font-size",
			"--balloon-text-color",
			"--balloon-highlight-bg",
			"--balloon-highlight-text",
		]) {
			root.style.removeProperty(key);
		}
		const balloonEl = document.querySelector(".balloon");
		if (balloonEl) {
			balloonEl.style.padding = "";
			balloonEl.style.maxWidth = "";
			const userScale = this.balloonUserScale || 1;
			balloonEl.style.transform = userScale !== 1 ? `scale(${userScale})` : "";
		}
		if (this.elements.balloonDisplay) {
			this.elements.balloonDisplay.style.left = "";
			this.elements.balloonDisplay.style.top = "";
		}
	},
};
