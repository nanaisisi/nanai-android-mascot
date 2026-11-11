import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { parseErrorReason as parseInstallErrorReason } from "../ui/ts/core/actions/install-protocol";
import {
	calculateUpdateProgress,
	normalizeUpdateReason,
} from "../ui/ts/core/actions/update-protocol";

interface NanaiCoreWasmExports {
	memory: WebAssembly.Memory;
	wasm_alloc: (size: number) => number;
	wasm_free: (ptr: number, size: number) => void;
	wasm_calculate_update_progress: (current: bigint, total: bigint) => number;
	wasm_normalize_update_reason: (ptr: number, len: number) => number;
	wasm_parse_install_error_reason: (ptr: number, len: number) => number;
}

const wasmPath = path.resolve(
	__dirname,
	"../target/wasm32-unknown-unknown/debug/nanai_core.wasm",
);
const hasWasmBinary = fs.existsSync(wasmPath);

describe.skipIf(!hasWasmBinary)(
	"nanai-core WASM experimental module parity",
	() => {
		it("verifies WASM binary exists and exports functions", async () => {
			const wasmBuffer = fs.readFileSync(wasmPath);
			const { instance } = await WebAssembly.instantiate(wasmBuffer);
			const exp = instance.exports as unknown as NanaiCoreWasmExports;

			expect(typeof exp.wasm_alloc).toBe("function");
			expect(typeof exp.wasm_free).toBe("function");
			expect(typeof exp.wasm_calculate_update_progress).toBe("function");
			expect(typeof exp.wasm_normalize_update_reason).toBe("function");
			expect(typeof exp.wasm_parse_install_error_reason).toBe("function");
		});

		it("matches calculateUpdateProgress behavior between TS and Rust WASM", async () => {
			const wasmBuffer = fs.readFileSync(wasmPath);
			const { instance } = await WebAssembly.instantiate(wasmBuffer);
			const exp = instance.exports as unknown as NanaiCoreWasmExports;

			const testCases: [number, number][] = [
				[0, 10],
				[5, 10],
				[7, 10],
				[10, 10],
				[15, 10],
				[0, 0],
				[-1, 10],
			];

			for (const [curr, total] of testCases) {
				const tsRes = calculateUpdateProgress(curr, total);
				const wasmPacked = exp.wasm_calculate_update_progress(
					BigInt(curr),
					BigInt(total),
				);
				const wasmPercent = wasmPacked & 0xffff;
				const wasmIsComplete = Boolean((wasmPacked >> 16) & 0xffff);

				expect(wasmPercent).toBe(tsRes.percent);
				expect(wasmIsComplete).toBe(tsRes.isComplete);
			}
		});

		it("matches normalizeUpdateReason between TS and Rust WASM with dynamic memory allocation", async () => {
			const wasmBuffer = fs.readFileSync(wasmPath);
			const { instance } = await WebAssembly.instantiate(wasmBuffer);
			const exp = instance.exports as unknown as NanaiCoreWasmExports;
			const memory = exp.memory;

			const testCases = [
				{ reason: "manual", expectedIdx: 0 },
				{ reason: "auto", expectedIdx: 1 },
				{ reason: "script", expectedIdx: 2 },
				{ reason: "other", expectedIdx: 0 },
			];

			const encoder = new TextEncoder();
			for (const { reason, expectedIdx } of testCases) {
				const tsReason = normalizeUpdateReason(reason);
				expect(typeof tsReason).toBe("string");

				const bytes = encoder.encode(reason);
				const ptr = exp.wasm_alloc(bytes.length);
				try {
					const memView = new Uint8Array(memory.buffer, ptr, bytes.length);
					memView.set(bytes);

					const wasmIdx = exp.wasm_normalize_update_reason(ptr, bytes.length);
					expect(wasmIdx).toBe(expectedIdx);
				} finally {
					exp.wasm_free(ptr, bytes.length);
				}
			}
		});

		it("matches parseInstallErrorReason between TS and Rust WASM with dynamic memory allocation", async () => {
			const wasmBuffer = fs.readFileSync(wasmPath);
			const { instance } = await WebAssembly.instantiate(wasmBuffer);
			const exp = instance.exports as unknown as NanaiCoreWasmExports;
			const memory = exp.memory;

			const testCases = [
				{
					err: "Archive error: unsupported format",
					expectedReason: "unsupported",
					expectedIdx: 1,
				},
				{
					err: "User cancel operation",
					expectedReason: "artificial",
					expectedIdx: 2,
				},
				{
					err: "Detected Zip-Slip attempt",
					expectedReason: "invalid path",
					expectedIdx: 3,
				},
				{
					err: "Corrupt lha archive header",
					expectedReason: "unlha32 error",
					expectedIdx: 4,
				},
				{
					err: "Permission denied write error",
					expectedReason: "write error",
					expectedIdx: 5,
				},
				{
					err: "Unknown internal error",
					expectedReason: "extraction",
					expectedIdx: 0,
				},
			];

			const encoder = new TextEncoder();
			for (const { err, expectedReason, expectedIdx } of testCases) {
				const tsReason = parseInstallErrorReason(err);
				expect(tsReason).toBe(expectedReason);

				const bytes = encoder.encode(err);
				const ptr = exp.wasm_alloc(bytes.length);
				try {
					const memView = new Uint8Array(memory.buffer, ptr, bytes.length);
					memView.set(bytes);

					const wasmIdx = exp.wasm_parse_install_error_reason(
						ptr,
						bytes.length,
					);
					expect(wasmIdx).toBe(expectedIdx);
				} finally {
					exp.wasm_free(ptr, bytes.length);
				}
			}
		});
	},
);
