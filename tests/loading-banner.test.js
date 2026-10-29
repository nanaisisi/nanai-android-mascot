import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis;
globalThis.location = { search: "?name=MockGhost&version=1.0.0" };

const elements = {};
globalThis.document = {
	getElementById(id) {
		elements[id] = elements[id] || { textContent: "" };
		return elements[id];
	},
};

let eventListener = null;
globalThis.__TAURI__ = {
	event: {
		listen: async (_eventName, cb) => {
			eventListener = cb;
		},
	},
};

// Import loading-banner
await import("../ui/js/ui/loading-banner.js");

test("loading-banner covers URL param initialization and Tauri event updates", async () => {
	assert.equal(elements["banner-ghost-name"].textContent, "MockGhost");
	assert.equal(elements["banner-version"].textContent, "v1.0.0");

	assert.ok(eventListener);
	eventListener({ payload: { name: "NewGhost", version: "2.0.0" } });

	assert.equal(elements["banner-ghost-name"].textContent, "NewGhost");
	assert.equal(elements["banner-version"].textContent, "v2.0.0");

	delete globalThis.__TAURI__;
	assert.ok(true);
});
