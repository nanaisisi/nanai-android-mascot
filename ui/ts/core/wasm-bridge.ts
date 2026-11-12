/**
 * @file wasm-bridge.ts
 * @brief WASM モジュールバインディングの統合ファサード (モジュール構成: ui/ts/core/wasm/)
 */

import { computeBalloonTextLayoutWasm } from "./wasm/wasm-layout.js";
import { wasmMemory } from "./wasm/wasm-memory.js";
import {
	calculateUpdateProgressWasm,
	parseDescriptTextWasm,
	parseInstallErrorReasonWasm,
	parseSstpRequestWasm,
} from "./wasm/wasm-protocol.js";
import { parseSakuraScriptWasm } from "./wasm/wasm-sakura.js";
import {
	advanceAnimationFrameWasm,
	computeSurfaceCompositionPlanWasm,
	findHitCollisionNameWasm,
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
}

export const wasmBridge = new WasmBridgeFacade();
