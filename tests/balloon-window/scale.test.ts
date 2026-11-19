/**
 * @file scale.test.ts
 * @brief BalloonWindow スケーリングモジュール単体テスト
 */

import assert from "node:assert/strict";
import { test } from "vitest";
import { updateBalloonWindowScale } from "../../ui/ts/ghost/balloon-window/scale.js";
import { setupBalloonMockEnvironment } from "./mock-balloon-env.js";

test("updateBalloonWindowScale updates style transform with user and dpi scale", () => {
	setupBalloonMockEnvironment();

	const mockBox = { style: { transform: "", transformOrigin: "" } };

	const s1 = updateBalloonWindowScale(
		mockBox as unknown as HTMLElement,
		1.5,
		1.0,
	);
	assert.strictEqual(s1, 1.5);
	assert.strictEqual(mockBox.style.transform, "scale(1.5)");
	assert.strictEqual(mockBox.style.transformOrigin, "top left");

	const s2 = updateBalloonWindowScale(
		mockBox as unknown as HTMLElement,
		1.0,
		0.8,
	);
	assert.strictEqual(s2, 0.8);
	assert.strictEqual(mockBox.style.transform, "scale(0.8)");

	// Null safety
	updateBalloonWindowScale(null, 1.0, 1.0);
});
