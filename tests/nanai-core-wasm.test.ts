import { describe, expect, it, vi } from "vitest";
import {
	computeValidRectLayout,
	parseValidRect,
} from "../ui/ts/core/actions/balloon-theme-dom";
import {
	parseErrorReason as parseInstallErrorReason,
	parseInstallErrorReasonFallback,
} from "../ui/ts/core/actions/install-protocol";
import {
	buildRawSstpRequest,
	parseRawSstpResponse,
} from "../ui/ts/core/actions/sstp-fmo-actions";
import {
	calculateUpdateProgress,
	calculateUpdateProgressFallback,
	isNoUpdatePath,
	isNoUpdatePathFallback,
	normalizeUpdateReason,
	normalizeUpdateReasonFallback,
	UPDATE_REASONS,
} from "../ui/ts/core/actions/update-protocol";
import { wasmBridge } from "../ui/ts/core/wasm-bridge";

describe("nanai-core WASM module parity and fallback", () => {
	it("matches calculateUpdateProgress behavior between WASM and TS fallback", async () => {
		await wasmBridge.init();
		const testCases: Array<[number, number, number, boolean]> = [
			[0, 10, 0, false],
			[5, 10, 50, false],
			[7, 10, 70, false],
			[10, 10, 100, true],
			[15, 10, 100, true],
			[0, 0, 100, true],
			[-1, 10, 0, false],
		];

		for (const [curr, total, expectedPercent, expectedComplete] of testCases) {
			const tsFallback = calculateUpdateProgressFallback(curr, total);
			const tsRes = calculateUpdateProgress(curr, total);
			const bridgeRes = wasmBridge.calculateUpdateProgress(curr, total);

			expect(tsFallback).toEqual({
				percent: expectedPercent,
				isComplete: expectedComplete,
			});
			expect(bridgeRes).toEqual(tsFallback);
			expect(tsRes).toEqual(tsFallback);
		}
	});

	it("matches normalizeUpdateReason behavior between WASM and TS fallback", async () => {
		await wasmBridge.init();
		const testCases: Array<[string | null | undefined, string, number]> = [
			["manual", "manual", 0],
			["AUTO", "auto", 1],
			[" script ", "script", 2],
			["other", "manual", 0],
			[null, "manual", 0],
		];
		for (const [reason, expected, expectedCode] of testCases) {
			const fallbackReason = normalizeUpdateReasonFallback(reason);
			const tsReason = normalizeUpdateReason(reason);
			const wasmCode = wasmBridge.normalizeUpdateReason(reason ?? undefined);

			expect(fallbackReason).toBe(expected);
			expect(tsReason).toBe(expected);
			expect(wasmCode).toBe(expectedCode);
			expect(UPDATE_REASONS[wasmCode]).toBe(expected);
		}
	});

	it("matches parseInstallErrorReason behavior across all 7 WASM reason codes and TS fallback", async () => {
		await wasmBridge.init();
		const testCases: Array<[string, string]> = [
			["Archive error: unsupported format", "unsupported"],
			["invalid type: unknown", "unsupported"],
			["User cancel operation", "artificial"],
			["Detected Zip-Slip attempt", "invalid path"],
			["Corrupt lha archive header", "unlha32 error"],
			["Permission denied write error", "write error"],
			["Invalid archive format header", "format error"],
			["Unknown internal error", "extraction"],
		];

		for (const [err, expected] of testCases) {
			const wasmReason = wasmBridge.parseInstallErrorReason(err);
			const tsReason = parseInstallErrorReason(err);
			const fallbackReason = parseInstallErrorReasonFallback(err);

			expect(wasmReason).toBe(expected);
			expect(tsReason).toBe(expected);
			expect(fallbackReason).toBe(expected);
		}
	});

	it("matches isNoUpdatePath behavior between WASM and TS fallback", async () => {
		await wasmBridge.init();
		const patterns = ["ghost/master/dev.log", "*.tmp", "profile/*"];
		const paths = [
			"ghost/master/dev.log",
			"ghost\\master\\dev.log",
			"ghost/master/aya.dll",
			"",
			"sub/dir/debug.tmp",
		];

		for (const p of paths) {
			const fallback = isNoUpdatePathFallback(p, patterns);
			expect(wasmBridge.isNoUpdatePath(p, patterns)).toBe(fallback);
			expect(isNoUpdatePath(p, patterns)).toBe(fallback);
		}
		expect(wasmBridge.isNoUpdatePath("file.txt", [])).toBe(
			isNoUpdatePathFallback("file.txt", []),
		);
	});

	it("computes validrect and balloon text layouts via WASM params objects", async () => {
		await wasmBridge.init();
		expect(wasmBridge.isReady()).toBe(true);

		const validRect = wasmBridge.computeValidRectLayout(
			10,
			14,
			12,
			16,
			"stretch",
			"balloons0.png",
			undefined,
			1,
		);
		expect(validRect).not.toBeNull();
		expect(validRect?.slice).toBe("14 12 16 10 fill");
		expect(validRect?.width).toBe("14px 12px 16px 10px");
		expect(validRect?.repeat).toBe("stretch");
		expect(validRect?.scopeId).toBe(1);

		const textLayout = wasmBridge.computeBalloonTextLayout(
			"Hello\nWorld",
			200,
			14,
			18,
			10,
		);
		expect(textLayout).not.toBeNull();
		expect(textLayout?.line_count).toBe(2);
		expect(textLayout?.lines.map((l) => l.text)).toEqual(["Hello", "World"]);
		expect(textLayout?.total_height_px).toBe(36);
	});

	it("allocates and frees WASM buffers cleanly", async () => {
		await wasmBridge.init();
		expect(wasmBridge.isReady()).toBe(true);

		const ptr = wasmBridge.allocBuffer(64);
		expect(typeof ptr).toBe("number");
		expect(ptr).toBeGreaterThan(0);
		expect(() => wasmBridge.freeBuffer(ptr as number, 64)).not.toThrow();
	});

	it("preserves parseValidRect, computeValidRectLayout, and SSTP raw helpers across WASM and fallback", async () => {
		await wasmBridge.init();
		const props = {
			"validrect.left": "10",
			"validrect.top": "14",
			"validrect.right": "10",
			"validrect.bottom": "14",
			"border.repeat": "stretch",
		};
		const wasmInsets = parseValidRect(props);
		const wasmLayout = computeValidRectLayout(
			new Map(),
			props,
			"balloons0.png",
			0,
		);
		const sstpReqPayload = {
			method: "SEND",
			sender: "NanaiTest",
			script: "\\0Hello\\e",
		};
		const wasmRawReq = buildRawSstpRequest(sstpReqPayload);
		const rawResp =
			"SSTP/1.4 200 OK\r\nCharset: UTF-8\r\nScript: \\0Hi\\e\r\nReference0: r0\r\n\r\nBody";
		const wasmParsedResp = parseRawSstpResponse(rawResp);

		const readySpy = vi.spyOn(wasmBridge, "isReady").mockReturnValue(false);
		try {
			expect(parseValidRect(props)).toEqual(wasmInsets);
			const fallbackLayout = computeValidRectLayout(
				new Map(),
				props,
				"balloons0.png",
				0,
			);
			expect(fallbackLayout.top).toBe(wasmLayout.top);
			expect(fallbackLayout.right).toBe(wasmLayout.right);
			expect(fallbackLayout.bottom).toBe(wasmLayout.bottom);
			expect(fallbackLayout.left).toBe(wasmLayout.left);
			expect(fallbackLayout.cacheKey).toBe(wasmLayout.cacheKey);
			expect(fallbackLayout.source).toBe(wasmLayout.source);
			expect(buildRawSstpRequest(sstpReqPayload)).toBe(wasmRawReq);
			expect(parseRawSstpResponse(rawResp)).toEqual(wasmParsedResp);
		} finally {
			readySpy.mockRestore();
		}
	});

	it("creates and updates MascotEngine WASM single source of truth state", async () => {
		await wasmBridge.init();
		if (!wasmBridge.isReady()) return;

		const engine = wasmBridge.createMascotEngine();
		if (!engine) return;

		expect(engine).not.toBeNull();

		engine.select_ghost("Emily");
		engine.select_shell("master");
		engine.set_surface(0, 5);
		engine.enqueue_script("\\0\\s[5]Hello WASM Engine!\\e");
		engine.tick(16.6);

		const stateJson = engine.get_state_json();
		expect(typeof stateJson).toBe("string");
		expect(stateJson).toContain("Emily");
		expect(stateJson).toContain("master");

		expect(engine.get_surface(0)).toBe(5);
	});

	it("executes unified pipeline for handle_event and script queue in MascotEngine", async () => {
		await wasmBridge.init();
		if (!wasmBridge.isReady()) return;

		const engine = wasmBridge.createMascotEngine();
		if (!engine) return;

		// wasm-bindgen exports Rust snake_case as camelCase in JS
		if (typeof engine.handleEvent === "function") {
			engine.handleEvent("OnBoot", null);
			expect(engine.isPlaying()).toBe(true);
		}

		engine.tick(16.6);

		if (typeof engine.toggleBind === "function") engine.toggleBind(101);
		if (typeof engine.setBalloonTheme === "function")
			engine.setBalloonTheme("nam_vertical");

		if (typeof engine.clearScriptQueue === "function") {
			engine.clearScriptQueue();
			expect(engine.isPlaying()).toBe(false);
		}
	});
});
