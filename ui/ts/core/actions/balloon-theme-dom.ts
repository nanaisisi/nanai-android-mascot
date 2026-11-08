// @ts-nocheck
import { BALLOON_CSS_VARS } from "./balloon-theme-constants.js";

/**
 * 9スライス分割設定 (border-image) を有効矩形 (validrect) 等から算出 (キャッシュ対応)
 */
export function computeNineSliceLayout(
	cache: Map<string, any>,
	props = {},
	bgImageUrl = null,
) {
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

	if (cache.has(cacheKey)) {
		return cache.get(cacheKey);
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
	cache.set(cacheKey, result);
	return result;
}

/**
 * DOM上のバルーン descript スタイルを初期化
 */
export function resetBalloonDescriptDom(userScale: number, app: any) {
	if (typeof document !== "undefined") {
		const root = document.documentElement;
		if (root) {
			for (const key of BALLOON_CSS_VARS) {
				root.style.removeProperty(key);
			}
		}
		const balloonEl = document.querySelector(".balloon");
		if (balloonEl?.style) {
			balloonEl.style.padding = "";
			balloonEl.style.maxWidth = "";
			balloonEl.style.borderImage = "";
			const scale = userScale || app?.balloonUserScale || 1;
			balloonEl.style.transform = scale !== 1 ? `scale(${scale})` : "";
		}
	}
	if (app?.elements?.balloonDisplay) {
		app.elements.balloonDisplay.style.left = "";
		app.elements.balloonDisplay.style.top = "";
	}
}

