/**
 * @file rust-bridge.ts
 * @brief Rust 側のサーフィスフレームバッファ・合成エンジン (nanai_android_mascot_ui::surfaces) との Tauri IPC ブリッジ
 */

import { invoke, isTauriAvailable } from "../../core/tauri-helper.js";

export interface SurfaceFrameBufferDto {
	width: number;
	height: number;
	data: number[]; // RGBA8888 byte array
}

export async function createSurfaceFrameBufferViaRust(width: number, height: number): Promise<SurfaceFrameBufferDto | null> {
	if (!isTauriAvailable()) return null;
	try {
		return await invoke<SurfaceFrameBufferDto>("create_surface_frame_buffer", { width, height });
	} catch (err) {
		console.warn("create_surface_frame_buffer failed:", err);
		return null;
	}
}

export async function clearFrameBufferRectViaRust(
	fb: SurfaceFrameBufferDto,
	x: number,
	y: number,
	w: number,
	h: number,
): Promise<SurfaceFrameBufferDto | null> {
	if (!isTauriAvailable()) return null;
	try {
		return await invoke<SurfaceFrameBufferDto>("clear_frame_buffer_rect", { fb, x, y, w, h });
	} catch (err) {
		console.warn("clear_frame_buffer_rect failed:", err);
		return null;
	}
}
