/**
 * @file wasm-bridge.ts
 * @brief WASM モジュールバインディングの統合ファサード (モジュール構成: ui/ts/core/wasm/)
 */

import {
	computeBalloonTextLayoutWasm,
	computeValidRectLayoutWasm,
} from "./wasm/wasm-layout.js";
import { wasmMemory } from "./wasm/wasm-memory.js";
import {
	buildSaoriRequestWasm,
	calculateUpdateProgressWasm,
	isNoUpdatePathWasm,
	normalizeUpdateReasonWasm,
	parseBalloonOptionsWasm,
	parseDeleteTxtWasm,
	parseDescriptTextWasm,
	parseDeveloperOptionsTxtWasm,
	parseFmoStringWasm,
	parseInstallErrorReasonWasm,
	parseSaoriResponseWasm,
	parseSstpRequestWasm,
	validateBalloonDescriptWasm,
} from "./wasm/wasm-protocol.js";
import { parseSakuraScriptWasm } from "./wasm/wasm-sakura.js";
import {
	advanceAnimationFrameWasm,
	computeSurfaceCompositionPlanWasm,
	findHitCollisionNameWasm,
	parseSurfacesTxtWasm,
} from "./wasm/wasm-surface.js";
import type {
	BalloonLayoutResult,
	DescriptManifest,
	SakuraToken,
	SstpRequest,
	SurfaceCompositionPlan,
} from "./wasm/wasm-types.js";

export type {
	AnimationDefinition,
	AnimationPattern,
	AnimationState,
	BalloonLayoutResult,
	DescriptManifest,
	SakuraToken,
	SstpRequest,
	SurfaceCompositionPlan,
	SurfaceElement,
	TextLayoutLine,
	ValidRectLayoutResult,
} from "./wasm/wasm-types.js";

class WasmBridgeFacade {
	public async init(bufferOrUrl?: ArrayBuffer | string): Promise<boolean> {
		return wasmMemory.init(bufferOrUrl);
	}

	public isReady(): boolean {
		return wasmMemory.isReady();
	}

	public parseSakuraScript(script: string): SakuraToken[] | null {
		return parseSakuraScriptWasm(script);
	}

	public parseSstpRequest(rawSstp: string): SstpRequest | null {
		return parseSstpRequestWasm(rawSstp);
	}

	public parseDescriptText(content: string): DescriptManifest | null {
		return parseDescriptTextWasm(content);
	}

	public calculateUpdateProgress(
		current: number,
		total: number,
	): { percent: number; isComplete: boolean } {
		return calculateUpdateProgressWasm(current, total);
	}

	public parseInstallErrorReason(errMessage: string): string {
		return parseInstallErrorReasonWasm(errMessage);
	}

	public isNoUpdatePath(path: string, patterns: string[]): boolean {
		return isNoUpdatePathWasm(path, patterns);
	}

	public computeBalloonTextLayout(
		text: string,
		maxWidth: number,
		fontSize: number,
		lineHeight: number,
		paddingX: number,
	): BalloonLayoutResult | null {
		return computeBalloonTextLayoutWasm(
			text,
			maxWidth,
			fontSize,
			lineHeight,
			paddingX,
		);
	}

	public computeValidRectLayout(
		validrectLeft?: number,
		validrectTop?: number,
		validrectRight?: number,
		validrectBottom?: number,
		borderRepeat?: string,
		balloonImage?: string,
		bgImageUrl?: string,
		scopeId = 0,
	) {
		return computeValidRectLayoutWasm(
			validrectLeft,
			validrectTop,
			validrectRight,
			validrectBottom,
			borderRepeat,
			balloonImage,
			bgImageUrl,
			scopeId,
		);
	}

	public findHitCollisionName(
		collisions: unknown[],
		x: number,
		y: number,
	): string | null {
		return findHitCollisionNameWasm(collisions, x, y);
	}

	public computeSurfaceCompositionPlan(
		surfaceId: number,
		elements: unknown[],
		activeBinds: number[] = [],
	): SurfaceCompositionPlan | null {
		return computeSurfaceCompositionPlanWasm(surfaceId, elements, activeBinds);
	}

	public advanceAnimationFrame(
		def: unknown,
		state: unknown,
		deltaMs: number,
	): [unknown, unknown] | null {
		return advanceAnimationFrameWasm(def, state, deltaMs);
	}

	public validateBalloonDescript(
		props: Record<string, string>,
		ghostName: string,
		ghostPath: string,
	) {
		return validateBalloonDescriptWasm(props, ghostName, ghostPath);
	}

	public parseBalloonOptions(content: string) {
		return parseBalloonOptionsWasm(content);
	}

	public parseSurfacesTxt(text: string) {
		return parseSurfacesTxtWasm(text);
	}

	public buildSaoriRequest(modulePath: string, args: string[] = []) {
		return buildSaoriRequestWasm(modulePath, args);
	}

	public parseSaoriResponse(raw: string) {
		return parseSaoriResponseWasm(raw);
	}

	public parseFmoString(rawFmo: string) {
		return parseFmoStringWasm(rawFmo);
	}

	public parseDeleteTxt(content: string) {
		return parseDeleteTxtWasm(content);
	}

	public parseDeveloperOptionsTxt(content: string) {
		return parseDeveloperOptionsTxtWasm(content);
	}

	public normalizeUpdateReason(reason?: string) {
		return normalizeUpdateReasonWasm(reason);
	}

	public allocBuffer(size: number): number | null {
		return wasmMemory.alloc(size);
	}

	public freeBuffer(ptr: number, size: number): void {
		wasmMemory.free(ptr, size);
	}

	public createMascotEngine(): any | null {
		const core = wasmMemory.getWasmCore() as any;
		if (!core?.MascotEngine) return null;
		try {
			return new core.MascotEngine();
		} catch (err) {
			console.warn("⚠️ [WASM Bridge] MascotEngine 作成エラー:", err);
			return null;
		}
	}
}

export const wasmBridge = new WasmBridgeFacade();
