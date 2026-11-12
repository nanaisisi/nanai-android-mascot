/**
 * @file tests/windows/splashscreen.test.ts
 * @brief splashscreen.js の単体テストおよびカバレッジテスト
 */

import assert from "node:assert/strict";
import { test, vi } from "vitest";
import { createWindowsMockEnvironment } from "./helpers.js";

test("splashscreen.js 100% coverage", async () => {
	vi.useFakeTimers();
	const env = createWindowsMockEnvironment();
	(globalThis as unknown as { __TAURI__?: { version: string } }).__TAURI__ = {
		version: "2.0",
	};

	await import("../../ui/windows/splashscreen.ts");

	await vi.advanceTimersByTimeAsync(4500);
	assert.equal(
		env.getEl("loading-text")?.textContent,
		"スプラッシュ完了 - 手動で閉じてください",
	);

	// Also test when loadingTextElement is null and __TAURI__ is undefined
	delete (globalThis as unknown as { __TAURI__?: unknown }).__TAURI__;
	env.returnNullElements = true;
	vi.resetModules();
	await import("../../ui/windows/splashscreen.js");
	await vi.advanceTimersByTimeAsync(4500);
	env.returnNullElements = false;

	vi.useRealTimers();
});
