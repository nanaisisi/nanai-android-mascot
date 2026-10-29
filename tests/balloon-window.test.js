import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis;
globalThis.location = { search: "?scope=0" };
globalThis.localStorage = { getItem: () => null, setItem: () => {} };
globalThis.document = {
	documentElement: { style: { setProperty() {} }, setAttribute() {} },
	getElementById(_id) {
		return {
			style: {},
			addEventListener() {},
			querySelectorAll: () => [],
		};
	},
	readyState: "complete",
	addEventListener() {},
};

const balloonWindowModule = await import("../ui/js/ghost/balloon-window.js");

test("balloon-window helper logic test", async () => {
	assert.ok(balloonWindowModule);
});
