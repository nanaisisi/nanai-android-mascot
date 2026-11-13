/**
 * @file wasm-types.ts
 * @brief WASM C-ABI 輸出関数および各種ドメインオブジェクトの型定義
 */

export interface SakuraToken {
	type:
		| "Text"
		| "Scope"
		| "Surface"
		| "Balloon"
		| "Animation"
		| "Newline"
		| "Clear"
		| "Wait"
		| "Choice"
		| "Anchor"
		| "Font"
		| "Halt";
	value?: unknown;
}

export interface SstpRequest {
	command: string;
	version: string;
	headers: Record<string, string>;
}

export interface TextLayoutLine {
	line_number: number;
	text: string;
	width_px: number;
}

export interface BalloonLayoutResult {
	lines: TextLayoutLine[];
	total_height_px: number;
	max_width_px: number;
	line_count: number;
}

export interface SurfaceElement {
	id: number;
	file: string;
	method: string;
	x: number;
	y: number;
}

export interface SurfaceCompositionPlan {
	surface_id: number;
	base_file: string;
	layers: SurfaceElement[];
}

export interface DescriptManifest {
	properties: Record<string, string>;
}

export interface AnimationPattern {
	surface_id: number;
	wait_ms: number;
	method: string;
	x: number;
	y: number;
}

export interface AnimationDefinition {
	id: number;
	interval: string;
	patterns: AnimationPattern[];
}

export interface AnimationState {
	animation_id: number;
	current_pattern_index: number;
	elapsed_ms: number;
	is_running: boolean;
}

export interface NanaiCoreWasmExports {
	memory: WebAssembly.Memory;
	wasm_alloc: (size: number) => number;
	wasm_free: (ptr: number, size: number) => void;
	wasm_calculate_update_progress: (current: bigint, total: bigint) => number;
	wasm_normalize_update_reason: (ptr: number, len: number) => number;
	wasm_parse_install_error_reason: (ptr: number, len: number) => number;
	wasm_is_no_update_path?: (
		pathPtr: number,
		pathLen: number,
		patternsPtr: number,
		patternsLen: number,
	) => number;
	wasm_parse_sakura_script_json: (ptr: number, len: number) => bigint;
	wasm_parse_sstp_request_json: (ptr: number, len: number) => bigint;
	wasm_parse_descript_json?: (ptr: number, len: number) => bigint;
	wasm_compute_balloon_text_layout_json?: (
		ptr: number,
		len: number,
		maxWidth: number,
		fontSize: number,
		lineHeight: number,
		paddingX: number,
	) => bigint;
	wasm_find_hit_collision_name_json?: (
		ptr: number,
		len: number,
		x: number,
		y: number,
	) => bigint;
	wasm_compute_surface_composition_plan_json?: (
		surfaceId: number,
		elementsPtr: number,
		elementsLen: number,
		bindsPtr: number,
		bindsLen: number,
	) => bigint;
	wasm_advance_animation_frame_json?: (
		defPtr: number,
		defLen: number,
		statePtr: number,
		stateLen: number,
		deltaMs: number,
	) => bigint;
	wasm_create_player?: (ptr: number, len: number) => number;
	wasm_player_step?: (enginePtr: number) => bigint;
	wasm_free_player?: (enginePtr: number) => void;
}
