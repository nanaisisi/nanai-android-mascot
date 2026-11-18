import { type ValidRectLayoutResult, wasmBridge } from "../wasm-bridge.js";
import { BALLOON_CSS_VARS } from "./balloon-theme-constants.js";

export type { ValidRectLayoutResult };

export interface BalloonAppInterface {
	balloonUserScale?: number;
	elements?: {
		balloonDisplay?: HTMLElement | null;
		[key: string]: HTMLElement | null | undefined;
	};
	[key: string]: unknown;
}

/**
 * UKADOC/SSP 規格準拠 validrect (テキスト描画範囲) プロパティパース
 */
export function parseValidRect(
	props: Record<string, string> = {},
	imageWidth?: number,
	imageHeight?: number,
) {
	const getProp = (key: string) =>
		props[key] || props[`sakura.${key}`] || props[`kero.${key}`];

	let vl = parseInt(getProp("validrect.left"), 10);
	let vt = parseInt(getProp("validrect.top"), 10);
	let vr = parseInt(getProp("validrect.right"), 10);
	let vb = parseInt(getProp("validrect.bottom"), 10);

	if (Number.isNaN(vl) && props.validrect) {
		const parts = props.validrect.split(",").map((s) => parseInt(s.trim(), 10));
		if (parts.length >= 4) {
			[vl, vt, vr, vb] = parts;
		}
	}

	const ox = parseInt(props["origin.x"], 10);
	const oy = parseInt(props["origin.y"], 10);
	if (!Number.isNaN(ox)) vl = ox;
	if (!Number.isNaN(oy)) vt = oy;

	const bw =
		imageWidth && imageWidth > 0
			? imageWidth
			: parseInt(props["balloon.width"] || "280", 10) || 280;
	const bh =
		imageHeight && imageHeight > 0
			? imageHeight
			: parseInt(props["balloon.height"] || "180", 10) || 180;

	const l = !Number.isNaN(vl) ? Math.max(0, vl) : 16;
	const t = !Number.isNaN(vt) ? Math.max(0, vt) : 16;

	let r = 16;
	if (!Number.isNaN(vr)) {
		if (vr < 0) {
			r = Math.abs(vr);
		} else if (vr === 0) {
			const ww = parseInt(getProp("wordwrappoint.x") || "", 10);
			if (!Number.isNaN(ww) && ww < 0) {
				r = Math.abs(ww);
			} else {
				r = Math.max(12, l);
			}
		} else if (vr <= 60) {
			r = vr;
		} else {
			r = Math.max(8, bw - vr);
		}
	}

	let b = 16;
	if (!Number.isNaN(vb)) {
		if (vb < 0) {
			b = Math.abs(vb);
		} else if (vb === 0) {
			b = Math.max(12, t);
		} else if (vb <= 60) {
			b = vb;
		} else {
			b = Math.max(8, bh - vb);
		}
	}

	return { top: t, right: r, bottom: b, left: l };
}

/**
 * 有効テキスト表示領域 (validrect) 設定からスタイルを算出 (キャッシュ対応・WASM駆動)
 */
export function computeValidRectLayout(
	cache: Map<string, ValidRectLayoutResult>,
	props: Record<string, string> = {},
	bgImageUrl: string | null = null,
	scopeId: number = 0,
): ValidRectLayoutResult {
	const { top: t, right: r, bottom: b, left: l } = parseValidRect(props);

	const source = bgImageUrl || props["balloon.image"] || "";
	const cacheKey =
		scopeId > 0
			? `scope${scopeId}_${t}_${r}_${b}_${l}_${source}`
			: `${t}_${r}_${b}_${l}_${source}`;

	if (cache.has(cacheKey)) {
		return cache.get(cacheKey) as ValidRectLayoutResult;
	}

	const result: ValidRectLayoutResult = {
		source,
		top: t,
		right: r,
		bottom: b,
		left: l,
		scopeId,
		cacheKey,
	};
	cache.set(cacheKey, result);
	return result;
}

/**
 * WASM 駆動によるバルーンテキスト折り返し・レイアウト最適化計算
 */
export function computeWasmBalloonTextLayout(
	text: string,
	maxWidth = 200,
	fontSize = 14,
	lineHeight = 18,
	paddingX = 12,
) {
	if (wasmBridge.isReady()) {
		const result = wasmBridge.computeBalloonTextLayout(
			text,
			maxWidth,
			fontSize,
			lineHeight,
			paddingX,
		);
		if (result) return result;
	}
	return null;
}

/**
 * DOM上のバルーン descript スタイルを初期化
 */
export function resetBalloonDescriptDom(
	userScale: number,
	app?: BalloonAppInterface,
) {
	if (typeof document !== "undefined") {
		const root = document.documentElement;
		if (root) {
			for (const key of BALLOON_CSS_VARS) {
				root.style.removeProperty(key);
			}
		}
		if (typeof document.querySelectorAll === "function") {
			const balloonEls = document.querySelectorAll(".balloon");
			balloonEls.forEach((el) => {
				const bEl = el as HTMLElement;
				if (bEl?.style) {
					bEl.style.padding = "";
					bEl.style.maxWidth = "";
					bEl.style.maxHeight = "";
					const scale = userScale || app?.balloonUserScale || 1;
					bEl.style.transform = scale !== 1 ? `scale(${scale})` : "";
				}
			});
		} else if (typeof document.querySelector === "function") {
			const bEl = document.querySelector(".balloon") as HTMLElement | null;
			if (bEl?.style) {
				bEl.style.padding = "";
				bEl.style.maxWidth = "";
				bEl.style.maxHeight = "";
				const scale = userScale || app?.balloonUserScale || 1;
				bEl.style.transform = scale !== 1 ? `scale(${scale})` : "";
			}
		}
	}
	if (app?.elements?.balloonDisplay) {
		app.elements.balloonDisplay.style.left = "";
		app.elements.balloonDisplay.style.top = "";
	}
}
