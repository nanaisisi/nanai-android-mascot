/**
 * @file theme.test.ts
 * @brief BalloonWindow テーマ・スキン・マニフェスト適用モジュール単体テスト
 */

import assert from "node:assert/strict";
import { test } from "vitest";
import { setupBalloonMockEnvironment } from "./mock-balloon-env.js";

test("loadBalloonSkinImages and applyBalloonDescript load and apply theme descript manifest", async () => {
	setupBalloonMockEnvironment();

	const { applyBalloonDescript, loadBalloonSkinImages } = await import(
		"../../ui/ts/ghost/balloon-window/theme.js"
	);

	const bgImg = await loadBalloonSkinImages("ivory", 0);
	assert.ok(bgImg);
	const keroImg = await loadBalloonSkinImages("ivory", 1);
	assert.ok(keroImg);
	const charImg = await loadBalloonSkinImages("ivory", 2);
	assert.ok(charImg);

	let callbackDpi = 0;
	let callbackDontMove: unknown = null;

	const themeRes = await applyBalloonDescript({
		theme: "ivory",
		scopeId: 0,
		currentUserScale: 1.0,
		onDpiScaleChange: (dpi: number) => {
			callbackDpi = dpi;
		},
		onDontMoveChange: (dontMove: unknown) => {
			callbackDontMove = dontMove;
		},
	});

	assert.ok(themeRes);
	assert.strictEqual(callbackDpi, 0.8);
	assert.strictEqual(callbackDontMove, true);

	// Non-Tauri fallback return
	delete (globalThis as unknown).__TAURI__;
	delete (globalThis as unknown).__TAURI_INTERNALS__;
	const nonTauriRes = await applyBalloonDescript({
		theme: "ivory",
		scopeId: 0,
		currentUserScale: 1.0,
	});
	assert.strictEqual(nonTauriRes, null);
});
