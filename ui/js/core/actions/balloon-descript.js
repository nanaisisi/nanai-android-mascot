/**
 * @file balloon-descript.js
 * @brief バルーンの descript.txt プロパティ（DPI, フォント, 描画領域, マウスカーソル等）の動的反映処理
 */
export const balloonDescriptActions = {
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

		const anchorNotSelect =
			this.rgbFromComponents(props, "anchor.notselect.font.color") ||
			props["anchor.notselect.font.color"];
		if (anchorNotSelect)
			root.style.setProperty("--balloon-anchor-notselect-color", anchorNotSelect);

		const useSelfAlpha = props["use_self_alpha"] === "1" || props["use_self_alpha"]?.toLowerCase() === "true";
		root.style.setProperty("--balloon-use-self-alpha", useSelfAlpha ? "1" : "0");

		const useInputAlpha = props["use_input_alpha"] === "1" || props["use_input_alpha"]?.toLowerCase() === "true";
		root.style.setProperty("--balloon-use-input-alpha", useInputAlpha ? "1" : "0");

		const overlayOutside = props["overlay_outside_balloon"] === "1" || props["overlay_outside_balloon"]?.toLowerCase() === "true";
		root.style.setProperty("--balloon-overlay-outside", overlayOutside ? "1" : "0");

		const cbWidth = props["communicatebox.width"];
		const cbHeight = props["communicatebox.height"];
		const cbX = props["communicatebox.x"];
		const cbY = props["communicatebox.y"];
		const cbFontName = props["communicatebox.font.name"];
		const cbFontHeight = parseInt(props["communicatebox.font.height"], 10);
		const cbFontColor =
			this.rgbFromComponents(props, "communicatebox.font.color") ||
			props["communicatebox.font.color"];
		const cbBgColor =
			this.rgbFromComponents(props, "communicatebox.background.color") ||
			props["communicatebox.background.color"];
		const cbPlaceholder =
			this.rgbFromComponents(props, "communicatebox.placeholder.color") ||
			props["communicatebox.placeholder.color"];
		if (cbWidth || cbHeight || cbX || cbY || cbFontName || !Number.isNaN(cbFontHeight) || cbFontColor || cbBgColor || cbPlaceholder) {
			const cbEl = document.querySelector(".communicate-box");
			if (cbEl) {
				if (cbWidth) cbEl.style.width = `${cbWidth}px`;
				if (cbHeight) cbEl.style.height = `${cbHeight}px`;
				if (cbX) cbEl.style.left = `${cbX}px`;
				if (cbY) cbEl.style.top = `${cbY}px`;
				if (cbFontName) cbEl.style.fontFamily = `"${cbFontName}", sans-serif`;
				if (!Number.isNaN(cbFontHeight)) cbEl.style.fontSize = `${cbFontHeight}px`;
				if (cbFontColor) cbEl.style.color = cbFontColor;
				if (cbBgColor) cbEl.style.backgroundColor = cbBgColor;
				if (cbPlaceholder) cbEl.style.setProperty("--communicatebox-placeholder-color", cbPlaceholder);
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

		// 未対応だったプロパティ群（arrow0/1, clickwaitmarker, vertical, windowposition）の対応追加
		const arrow0x = parseInt(props["arrow0.x"], 10);
		const arrow0y = parseInt(props["arrow0.y"], 10);
		if (!Number.isNaN(arrow0x)) root.style.setProperty("--balloon-arrow0-x", `${arrow0x}px`);
		if (!Number.isNaN(arrow0y)) root.style.setProperty("--balloon-arrow0-y", `${arrow0y}px`);

		const arrow1x = parseInt(props["arrow1.x"], 10);
		const arrow1y = parseInt(props["arrow1.y"], 10);
		if (!Number.isNaN(arrow1x)) root.style.setProperty("--balloon-arrow1-x", `${arrow1x}px`);
		if (!Number.isNaN(arrow1y)) root.style.setProperty("--balloon-arrow1-y", `${arrow1y}px`);

		const cwX = parseInt(props["clickwaitmarker.x"], 10);
		const cwY = parseInt(props["clickwaitmarker.y"], 10);
		if (!Number.isNaN(cwX)) root.style.setProperty("--balloon-clickwait-x", `${cwX}px`);
		if (!Number.isNaN(cwY)) root.style.setProperty("--balloon-clickwait-y", `${cwY}px`);

		const isVertical = props["vertical"] === "1" || props["vertical"]?.toLowerCase() === "true";
		root.style.setProperty("--balloon-writing-mode", isVertical ? "vertical-rl" : "horizontal-tb");

		const wpX = parseInt(props["windowposition.x"], 10);
		const wpY = parseInt(props["windowposition.y"], 10);
		if (!Number.isNaN(wpX)) root.style.setProperty("--balloon-windowpos-x", `${wpX}px`);
		if (!Number.isNaN(wpY)) root.style.setProperty("--balloon-windowpos-y", `${wpY}px`);

		// さらなる未実装プロパティ群（number.font, onlinemarker, sstpmessage）の追加実装
		const numFontName = props["number.font.name"];
		if (numFontName) root.style.setProperty("--balloon-number-font-family", `"${numFontName}", sans-serif`);
		const numFontHeight = parseInt(props["number.font.height"], 10);
		if (!Number.isNaN(numFontHeight)) root.style.setProperty("--balloon-number-font-size", `${numFontHeight}px`);
		const numColor = this.rgbFromComponents(props, "number.font.color");
		if (numColor) root.style.setProperty("--balloon-number-color", numColor);

		const onlineInterval = parseInt(props["onlinemarker.interval"], 10);
		if (!Number.isNaN(onlineInterval)) this.onlineMarkerInterval = onlineInterval;
		const onlineX = parseInt(props["onlinemarker.x"], 10);
		const onlineY = parseInt(props["onlinemarker.y"], 10);
		if (!Number.isNaN(onlineX)) root.style.setProperty("--balloon-online-x", `${onlineX}px`);
		if (!Number.isNaN(onlineY)) root.style.setProperty("--balloon-online-y", `${onlineY}px`);

		const sstpMsgX = parseInt(props["sstpmessage.x"], 10);
		const sstpMsgY = parseInt(props["sstpmessage.y"], 10);
		if (!Number.isNaN(sstpMsgX)) root.style.setProperty("--balloon-sstpmessage-x", `${sstpMsgX}px`);
		if (!Number.isNaN(sstpMsgY)) root.style.setProperty("--balloon-sstpmessage-y", `${sstpMsgY}px`);

		const paintBlack = props["paint_transparent_region_black"] === "1" || props["paint_transparent_region_black"]?.toLowerCase() === "true";
		root.style.setProperty("--balloon-paint-black", paintBlack ? "1" : "0");

		const wwY = parseInt(props["wordwrappoint.y"], 10);
		if (!Number.isNaN(wwY) && wwY > 20) {
			const balloonEl = document.querySelector(".balloon");
			if (balloonEl) {
				balloonEl.style.maxHeight = `${wwY}px`;
			}
		}

		const disableFont = props["disable.font"];
		if (disableFont) {
			root.style.setProperty("--balloon-disable-font", disableFont);
		}
	},
};
