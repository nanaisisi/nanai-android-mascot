import { describe, expect, it } from "vitest";
import {
	createSakuraPlayerWasm,
	freeSakuraPlayerWasm,
	stepSakuraPlayerWasm,
} from "../ui/ts/core/wasm/wasm-sakura";
import { wasmBridge } from "../ui/ts/core/wasm-bridge";

describe("wasmBridge transparent connection and fallback unit tests", () => {
	it("handles fallback gracefully before WASM instantiation", () => {
		expect(wasmBridge.isReady()).toBe(false);

		// 初期化前でもフォールバックロジックで安全に応答
		const progress = wasmBridge.calculateUpdateProgress(5, 10);
		expect(progress.percent).toBe(50);
		expect(progress.isComplete).toBe(false);

		const errReason = wasmBridge.parseInstallErrorReason(
			"User cancel operation",
		);
		expect(errReason).toBe("artificial");

		const tokens = wasmBridge.parseSakuraScript("\\0\\s[0]Hello\\e");
		expect(tokens).toBeNull();

		expect(createSakuraPlayerWasm("\\0Hello\\e")).toBeNull();
		expect(stepSakuraPlayerWasm(null)).toBeNull();
		expect(() => freeSakuraPlayerWasm(null)).not.toThrow();
	});

	it("calculates progress correctly at edge boundaries via fallback", () => {
		expect(wasmBridge.calculateUpdateProgress(10, 10)).toEqual({
			percent: 100,
			isComplete: true,
		});

		expect(wasmBridge.calculateUpdateProgress(0, 10)).toEqual({
			percent: 0,
			isComplete: false,
		});
	});
});
