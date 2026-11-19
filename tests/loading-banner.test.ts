import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis as unknown as Window & typeof globalThis;
globalThis.location = {
	search: "?name=MockGhost&version=1.0.0",
} as unknown as Location;

const elements: Record<string, { textContent: string }> = {};
globalThis.document = {
	getElementById(id: string) {
		elements[id] = elements[id] || { textContent: "" };
		return elements[id] as unknown as HTMLElement;
	},
} as unknown as Document;

type BannerListener = (event: {
	payload?: { name?: string; version?: string };
}) => void;
let eventListener: BannerListener | null = null;
globalThis.__TAURI__ = {
	event: {
		listen: async (_eventName: unknown, cb: unknown) => {
			eventListener = cb as BannerListener;
		},
	},
};

// Import loading-banner
await import("../ui/ts/ui/loading-banner.js");

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
