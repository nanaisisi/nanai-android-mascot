/**
 * @file wasm-layout.ts
 * @brief バルーンテキスト折り返し・有効テキスト領域(validrect)レイアウト & descript検証バインディング (wasm-pack 統合)
 */

import { wasmMemory } from "./wasm-memory.js";
import type { BalloonLayoutResult, ValidRectLayoutResult } from "./wasm-types.js";

export function computeValidRectLayoutWasm(
	validrectLeft?: number,
	validrectTop?: number,
	validrectRight?: number,
	validrectBottom?: number,
	borderRepeat?: string,
	balloonImage?: string,
	bgImageUrl?: string,
	scopeId = 0,
): ValidRectLayoutResult | null {
	const core = wasmMemory.getWasmCore();
	if (!core?.wasm_compute_validrect_layout) return null;

	try {
		return core.wasm_compute_validrect_layout(
			validrectLeft,
			validrectTop,
			validrectRight,
			validrectBottom,
			borderRepeat,
			balloonImage,
			bgImageUrl,
			scopeId,
		) as ValidRectLayoutResult | null;
	} catch (err) {
		console.warn("⚠️ [WASM Layout] computeValidRectLayout エラー:", err);
		return null;
	}
}

export function computeBalloonTextLayoutWasm(
	text: string,
	maxWidth: number,
	fontSize: number,
	lineHeight: number,
	paddingX: number,
): BalloonLayoutResult | null {
	const core = wasmMemory.getWasmCore();
	if (!core?.wasm_compute_balloon_text_layout) return null;

	try {
		return core.wasm_compute_balloon_text_layout(
			text,
			maxWidth,
			fontSize,
			lineHeight,
			paddingX,
		) as BalloonLayoutResult | null;
	} catch (err) {
		console.warn("⚠️ [WASM Layout] computeBalloonTextLayout エラー:", err);
		return null;
	}
}

export function validateBalloonDescriptWasm(
	props: Record<string, string>,
	currentGhostName: string,
	currentGhostPath: string,
): { isRecommended: boolean; warningMessage?: string } | null {
	const core = wasmMemory.getWasmCore();
	if (!core?.wasm_validate_balloon_descript) return null;

	try {
		const res = core.wasm_validate_balloon_descript(
			props,
			currentGhostName,
			currentGhostPath,
		) as { is_recommended?: boolean; warning_message?: string };
		return {
			isRecommended: res.is_recommended ?? true,
			warningMessage: res.warning_message,
		};
	} catch (err) {
		console.warn("⚠️ [WASM Layout] validateBalloonDescript エラー:", err);
		return null;
	}
}
