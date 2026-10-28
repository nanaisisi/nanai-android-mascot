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

export const balloonActions = {
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

	/**
	 * @param {Record<string, string>} props
	 * @param {string} base
	 * @returns {string|null}
	 */
	rgbFromComponents(props, base) {
		const r = parseInt(props[`${base}.r`], 10);
		const g = parseInt(props[`${base}.g`], 10);
		const b = parseInt(props[`${base}.b`], 10);
		if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
		return `rgb(${r}, ${g}, ${b})`;
	},

	/**
	 * @param {Record<string, string>} props
	 */
	applyBalloonDescript(props = {}) {
		if (!props) return;
		const root = document.documentElement;

		const parsedDpi = parseInt(props.dpi, 10);
		const balloonDpi =
			!Number.isNaN(parsedDpi) && parsedDpi > 0 ? parsedDpi : 96;
		const dpiScale = +(96 / balloonDpi).toFixed(4);
		this.balloonDpiScale = dpiScale;
		root.style.setProperty("--balloon-dpi", String(balloonDpi));
		root.style.setProperty("--balloon-dpi-scale", String(dpiScale));

		const userScale = this.balloonUserScale || 1;
		const finalScale = +(userScale * dpiScale).toFixed(4);
		const balloonScaleEl = document.querySelector(".balloon");
		if (balloonScaleEl) {
			balloonScaleEl.style.transform =
				finalScale !== 1 ? `scale(${finalScale})` : "";
			balloonScaleEl.style.transformOrigin = "bottom left";
		}

		if (props["font.name"]) {
			root.style.setProperty(
				"--balloon-font-family",
				`"${props["font.name"]}", Meiryo, sans-serif`,
			);
		}

		if (props["font.height"]) {
			const fh = parseInt(props["font.height"], 10);
			if (!Number.isNaN(fh) && fh > 0) {
				root.style.setProperty("--balloon-font-size", `${fh}px`);
			}
		}

		if (
			props["font.bold"] === "1" ||
			props["font.bold"]?.toLowerCase() === "true"
		) {
			root.style.setProperty("--balloon-font-weight", "bold");
		}
		if (
			props["font.italic"] === "1" ||
			props["font.italic"]?.toLowerCase() === "true"
		) {
			root.style.setProperty("--balloon-font-style", "italic");
		}
		const decorations = [];
		if (
			props["font.underline"] === "1" ||
			props["font.underline"]?.toLowerCase() === "true"
		)
			decorations.push("underline");
		if (
			props["font.strike"] === "1" ||
			props["font.strike"]?.toLowerCase() === "true"
		)
			decorations.push("line-through");
		if (decorations.length > 0) {
			root.style.setProperty(
				"--balloon-text-decoration",
				decorations.join(" "),
			);
		}

		const anchorCol =
			this.rgbFromComponents(props, "anchor.font.color") ||
			props["anchor.font.color"];
		if (anchorCol) root.style.setProperty("--balloon-anchor-color", anchorCol);
		const anchorVisited =
			this.rgbFromComponents(props, "anchor.visited.font.color") ||
			props["anchor.visited.font.color"];
		if (anchorVisited)
			root.style.setProperty("--balloon-anchor-visited-color", anchorVisited);

		const cbWidth = props["communicatebox.width"];
		const cbHeight = props["communicatebox.height"];
		const cbX = props["communicatebox.x"];
		const cbY = props["communicatebox.y"];
		const cbFontColor =
			this.rgbFromComponents(props, "communicatebox.font.color") ||
			props["communicatebox.font.color"];
		const cbBgColor =
			this.rgbFromComponents(props, "communicatebox.background.color") ||
			props["communicatebox.background.color"];
		if (cbWidth || cbHeight || cbX || cbY || cbFontColor || cbBgColor) {
			const cbEl = document.querySelector(".communicate-box");
			if (cbEl) {
				if (cbWidth) cbEl.style.width = `${cbWidth}px`;
				if (cbHeight) cbEl.style.height = `${cbHeight}px`;
				if (cbX) cbEl.style.left = `${cbX}px`;
				if (cbY) cbEl.style.top = `${cbY}px`;
				if (cbFontColor) cbEl.style.color = cbFontColor;
				if (cbBgColor) cbEl.style.backgroundColor = cbBgColor;
			}
		}

		const fontColor = this.rgbFromComponents(props, "font.color");
		if (props["font.color"]) {
			root.style.setProperty("--balloon-text-color", props["font.color"]);
		} else if (fontColor) {
			root.style.setProperty("--balloon-text-color", fontColor);
		}

		const cursorBg =
			this.rgbFromComponents(props, "cursor.font.color") ||
			props["cursor.font.color"];
		if (cursorBg) {
			root.style.setProperty("--balloon-highlight-bg", cursorBg);
		}
		const cursorText =
			this.rgbFromComponents(props, "cursor.color.font") ||
			props["cursor.color.font"];
		if (cursorText) {
			root.style.setProperty("--balloon-highlight-text", cursorText);
		}

		const vl = parseInt(props["validrect.left"], 10);
		const vt = parseInt(props["validrect.top"], 10);
		const vr = parseInt(props["validrect.right"], 10);
		const vb = parseInt(props["validrect.bottom"], 10);
		if (
			!Number.isNaN(vl) &&
			!Number.isNaN(vt) &&
			!Number.isNaN(vr) &&
			!Number.isNaN(vb)
		) {
			const padTop = `${Math.max(8, vt)}px`;
			const padRight = `${Math.max(8, vr)}px`;
			const padBottom = `${Math.max(8, vb)}px`;
			const padLeft = `${Math.max(8, vl)}px`;
			const balloonEl = document.querySelector(".balloon");
			if (balloonEl) {
				balloonEl.style.padding = `${padTop} ${padRight} ${padBottom} ${padLeft}`;
			}
		}

		if (props["wordwrappoint.x"]) {
			const ww = parseInt(props["wordwrappoint.x"], 10);
			if (!Number.isNaN(ww) && ww > 50) {
				const balloonEl = document.querySelector(".balloon");
				if (balloonEl) {
					balloonEl.style.maxWidth = `${ww}px`;
				}
			}
		}

		const ox = parseInt(props["origin.x"], 10);
		const oy = parseInt(props["origin.y"], 10);
		if (!Number.isNaN(ox) || !Number.isNaN(oy)) {
			if (this.elements.balloonDisplay) {
				if (!Number.isNaN(ox))
					this.elements.balloonDisplay.style.left = `calc(50% + ${ox}px)`;
				if (!Number.isNaN(oy))
					this.elements.balloonDisplay.style.top = `calc(2rem + ${oy}px)`;
			}
		}

		const setBalloonImage = (propName, cssVarName) => {
			const filename = props[propName];
			if (filename) {
				const themeName = this.currentBalloonTheme || "default";
				const fullPath = `assets/balloon/${themeName}/${filename}`;
				const url = globalThis.__TAURI__?.core?.convertFileSrc
					? globalThis.__TAURI__.core.convertFileSrc(fullPath)
					: fullPath;
				root.style.setProperty(cssVarName, `url("${url}")`);
			}
		};
		setBalloonImage("arrow.filename", "--balloon-arrow-image");
		setBalloonImage("clickwaitmarker.filename", "--balloon-clickwait-image");
		setBalloonImage("marker.filename", "--balloon-marker-image");
		setBalloonImage("onlinemarker.filename", "--balloon-online-image");
		setBalloonImage("sstpmarker.filename", "--balloon-sstpmarker-image");

		const setMouseCursor = (propName, varName) => {
			const filename = props[propName];
			if (filename) {
				const themeName = this.currentBalloonTheme || "default";
				const fullPath = `assets/balloon/${themeName}/${filename}`;
				const url = globalThis.__TAURI__?.core?.convertFileSrc
					? globalThis.__TAURI__.core.convertFileSrc(fullPath)
					: fullPath;
				root.style.setProperty(varName, `url("${url}"), auto`);
			}
		};
		setMouseCursor("mousecursor.arrow", "--balloon-cursor-arrow");
		setMouseCursor("mousecursor.text", "--balloon-cursor-text");
		setMouseCursor("mousecursor.wait", "--balloon-cursor-wait");
		setBalloonImage("marker.filename", "--balloon-marker-image");
		setBalloonImage("onlinemarker.filename", "--balloon-online-image");
		setBalloonImage("sstpmarker.filename", "--balloon-sstp-image");
	},
};
