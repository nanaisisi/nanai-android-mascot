/**
 * SakuraScript parser wrapper (powered by Pure Rust / WASM core via wasmBridge)
 */
import { wasmBridge } from "../core/wasm-bridge.js";

export function parseSakuraScript(script: string) {
	return wasmBridge.parseSakuraScript(script) || [];
}
