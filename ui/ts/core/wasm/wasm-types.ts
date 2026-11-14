/**
 * @file wasm-types.ts
 * @brief WASM C-ABI 輸出関数および各種ドメインオブジェクトの型定義（自動生成された nanai_core.d.ts から再エクスポート）
 */

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
} from "./pkg/nanai_core.js";

export type NanaiCoreWasmExports = import("./pkg/nanai_core.js").InitOutput;
