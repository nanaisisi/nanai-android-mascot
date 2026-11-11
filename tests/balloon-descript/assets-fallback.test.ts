import assert from "node:assert/strict";
import { test } from "vitest";
import { setupBalloonDescriptMockEnvironment } from "./helpers.js";

const { cssVars } = setupBalloonDescriptMockEnvironment();

const { balloonDescriptActions } = await import(
	"../../ui/ts/core/actions/balloon-descript.js"
);

test("balloonDescriptActions applyAssetProperties handles non-Tauri environment (fallback path)", () => {
	delete (globalThis as unknown as { __TAURI__?: unknown }).__TAURI__;
	const mockInstance = {
		currentBalloonTheme: "default",
		elements: { balloonDisplay: { style: {} } },
	};
	const props = {
		mousecursor: "test.cur",
	};
	balloonDescriptActions.applyBalloonDescript.call(mockInstance, props);
	assert.equal(
		cssVars["--balloon-cursor-default"],
		'url("assets/balloon/default/test.cur"), auto',
	);
});
