import { calculateBlendMode } from "./blend-calc.js";
import {
	BAYER_MATRIX_4X4,
	blendColor,
	blendHue,
	blendLuminosity,
	blendSaturation,
} from "./blend-hsl.js";

/**
 * Perform composite blending between source buffer and destination buffer.
 */
export function blendBuffers(
	dst32: Uint32Array,
	dstWidth: number,
	dstHeight: number,
	src32: Uint32Array,
	srcWidth: number,
	srcHeight: number,
	dx: number,
	dy: number,
	method = "overlay",
): void {
	const m = (method || "overlay").toLowerCase();

	for (let sy = 0; sy < srcHeight; sy++) {
		const ty = dy + sy;
		if (ty < 0 || ty >= dstHeight) continue;

		for (let sx = 0; sx < srcWidth; sx++) {
			const tx = dx + sx;
			if (tx < 0 || tx >= dstWidth) continue;

			const srcIdx = sy * srcWidth + sx;
			const dstIdx = ty * dstWidth + tx;
			const srcPixel = src32[srcIdx];

			if (m === "replace" || m === "overlayfast" || m === "fast") {
				dst32[dstIdx] = srcPixel;
			} else if (m === "interpolate") {
				// 下の絵と同一色または完全透明の場合は透過
				if ((srcPixel & 0xff000000) === 0) continue;
				if ((srcPixel & 0x00ffffff) === (dst32[dstIdx] & 0x00ffffff)) {
					continue;
				}
				dst32[dstIdx] = srcPixel;
			} else if (m === "reduce") {
				// ベースレイヤと新規レイヤの不透明度（アルファ）を乗算合成 (UKADOC準拠)
				const sa = (srcPixel >>> 24) & 0xff;
				const da = (dst32[dstIdx] >>> 24) & 0xff;
				const outA = Math.round((da * sa) / 255);
				dst32[dstIdx] = (dst32[dstIdx] & 0x00ffffff) | (outA << 24);
			} else if (
				m.startsWith("blend-") ||
				m.endsWith("-fast") ||
				m === "multiply" ||
				m === "screen" ||
				m === "add" ||
				m === "lighter" ||
				m === "darken" ||
				m === "lighten" ||
				m === "difference" ||
				m === "exclusion" ||
				m === "subtract" ||
				m === "divide" ||
				m === "softlight" ||
				m === "soft-light" ||
				m === "hue" ||
				m === "saturation" ||
				m === "color" ||
				m === "luminosity" ||
				m === "dither" ||
				m === "overlaymultiply" ||
				m === "overlayscreen"
			) {
				const sa = (srcPixel >>> 24) & 0xff;
				if (sa === 0) continue;

				const isFast =
					m.endsWith("-fast") ||
					m === "overlaymultiply" ||
					m === "overlayscreen";

				const baseMode = m
					.replace(/^blend-/, "")
					.replace(/-fast$/, "")
					.replace(/^overlay(?=multiply|screen)/, "");

				const sr = srcPixel & 0xff;
				const sg = (srcPixel >>> 8) & 0xff;
				const sb = (srcPixel >>> 16) & 0xff;

				const dr = dst32[dstIdx] & 0xff;
				const dg = (dst32[dstIdx] >>> 8) & 0xff;
				const db = (dst32[dstIdx] >>> 16) & 0xff;
				const da = (dst32[dstIdx] >>> 24) & 0xff;

				let br = sr;
				let bg = sg;
				let bb = sb;

				if (baseMode === "hue") {
					[br, bg, bb] = blendHue(dr, dg, db, sr, sg, sb);
				} else if (baseMode === "saturation") {
					[br, bg, bb] = blendSaturation(dr, dg, db, sr, sg, sb);
				} else if (baseMode === "color") {
					[br, bg, bb] = blendColor(dr, dg, db, sr, sg, sb);
				} else if (baseMode === "luminosity") {
					[br, bg, bb] = blendLuminosity(dr, dg, db, sr, sg, sb);
				} else if (baseMode === "dither") {
					const bayerVal = BAYER_MATRIX_4X4[((ty & 3) << 2) | (tx & 3)];
					const threshold = (((bayerVal * 2 + 1) * 255) / 32) | 0;
					if (sa > threshold) {
						dst32[dstIdx] = ((255 << 24) | (sb << 16) | (sg << 8) | sr) >>> 0;
					}
					continue;
				} else {
					[br, bg, bb] = calculateBlendMode(baseMode, sr, sg, sb, dr, dg, db);
				}

				if (isFast) {
					dst32[dstIdx] = ((sa << 24) | (bb << 16) | (bg << 8) | br) >>> 0;
				} else {
					const alphaNorm = sa / 255;
					const invAlpha = 1 - alphaNorm;
					const outR = Math.min(255, (br * alphaNorm + dr * invAlpha) | 0);
					const outG = Math.min(255, (bg * alphaNorm + dg * invAlpha) | 0);
					const outB = Math.min(255, (bb * alphaNorm + db * invAlpha) | 0);
					const outA = Math.min(255, (sa + da * invAlpha) | 0);
					dst32[dstIdx] =
						((outA << 24) | (outB << 16) | (outG << 8) | outR) >>> 0;
				}
			} else {
				// 標準 overlay (完全透明はスキップ、完全不透明はダイレクト代入、半透明はブレンド)
				const sa = (srcPixel >>> 24) & 0xff;
				if (sa === 0) continue;
				if (sa === 255) {
					dst32[dstIdx] = srcPixel;
				} else {
					const da = (dst32[dstIdx] >>> 24) & 0xff;
					const invAlpha = 1 - sa / 255;
					const alphaNorm = sa / 255;

					const sr = srcPixel & 0xff;
					const sg = (srcPixel >>> 8) & 0xff;
					const sb = (srcPixel >>> 16) & 0xff;

					const dr = dst32[dstIdx] & 0xff;
					const dg = (dst32[dstIdx] >>> 8) & 0xff;
					const db = (dst32[dstIdx] >>> 16) & 0xff;

					const outR = Math.min(255, (sr * alphaNorm + dr * invAlpha) | 0);
					const outG = Math.min(255, (sg * alphaNorm + dg * invAlpha) | 0);
					const outB = Math.min(255, (sb * alphaNorm + db * invAlpha) | 0);
					const outA = Math.min(255, (sa + da * invAlpha) | 0);

					dst32[dstIdx] =
						((outA << 24) | (outB << 16) | (outG << 8) | outR) >>> 0;
				}
			}
		}
	}
}
