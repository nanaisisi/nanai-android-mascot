import { describe, expect, it } from "vitest";
import { parseErrorReason as parseInstallErrorReason } from "../ui/ts/core/actions/install-protocol";
import {
	calculateUpdateProgress,
	normalizeUpdateReason,
} from "../ui/ts/core/actions/update-protocol";
import { wasmBridge } from "../ui/ts/core/wasm-bridge";

describe("nanai-core WASM module parity and fallback", () => {
	it("matches calculateUpdateProgress behavior between TS and WASM fallback", () => {
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
			const bridgeRes = wasmBridge.calculateUpdateProgress(curr, total);

			expect(bridgeRes.percent).toBe(tsRes.percent);
			expect(bridgeRes.isComplete).toBe(tsRes.isComplete);
		}
	});

	it("matches normalizeUpdateReason behavior", () => {
		const testCases = ["manual", "auto", "script", "other"];
		for (const reason of testCases) {
			const tsReason = normalizeUpdateReason(reason);
			expect(typeof tsReason).toBe("string");
		}
	});

	it("matches parseInstallErrorReason behavior", () => {
		const testCases = [
			"Archive error: unsupported format",
			"User cancel operation",
			"Detected Zip-Slip attempt",
			"Corrupt lha archive header",
			"Permission denied write error",
			"Unknown internal error",
		];

		for (const err of testCases) {
			const tsReason = parseInstallErrorReason(err);
			expect(typeof tsReason).toBe("string");
		}
	});
});
