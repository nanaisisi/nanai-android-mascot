// @ts-nocheck
import { wasmBridge } from "../wasm-bridge.js";
import { BALLOON_CSS_VARS } from "./balloon-theme-constants.js";

export interface NineSliceLayoutResult {
	source: string;
	slice: string;
	width: string;
	repeat: string;
	cssBorderImage: string;
	scopeId: number;
	cacheKey: string;
}

export interface BalloonAppInterface {
	balloonUserScale?: number;
	elements?: {
		balloonDisplay?: HTMLElement | null;
		[key: string]: HTMLElement | null | undefined;
	};
	[key: string]: unknown;
}

/**
 * 9スライス分割設定 (border-image) を有効矩形 (validrect) 等から算出 (キャッシュ対応)
 */
export function computeNineSliceLayout(
	cache: Map<string, NineSliceLayoutResult>,
	props: Record<string, string> = {},
	bgImageUrl: string | null = null,
	scopeId: number = 0,
): NineSliceLayoutResult {
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
	// scopeId > 0 の場合はスコープ別プレフィックス、scopeId === 0 の場合は既存互換キー
	const cacheKey =
		scopeId > 0
			? `scope${scopeId}_${t}_${r}_${b}_${l}_${repeat}_${source}`
			: `${t}_${r}_${b}_${l}_${repeat}_${source}`;

	if (cache.has(cacheKey)) {
		return cache.get(cacheKey) as NineSliceLayoutResult;
	}

	const slice = `${t} ${r} ${b} ${l} fill`;
	const width = `${t}px ${r}px ${b}px ${l}px`;

	const cssBorderImage = source
		? `url("${source}") ${t} ${r} ${b} ${l} fill / ${width} ${repeat}`
		: "";

	const result: NineSliceLayoutResult = {
		source,
		slice,
		width,
		repeat,
		cssBorderImage,
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
					bEl.style.borderImage = "";
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
				bEl.style.borderImage = "";
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
