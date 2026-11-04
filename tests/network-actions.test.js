import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis;

const { networkActions } = await import(
	"../ui/js/core/actions/network-actions.js"
);

test("networkActions.checkEmail covers all branches (Tauri & non-Tauri)", async () => {
	const eventsSent = [];
	const mockApp = {
		...networkActions,
		ghostController: {
			sendShioriEvent: async (ev, args) => {
				eventsSent.push({ ev, args });
				return {};
			},
		},
		showBalloon() {},
	};

	// 1. Non-Tauri environment
	delete globalThis.__TAURI__;
	delete globalThis.__TAURI_INTERNALS__;
	await mockApp.checkEmail("personal");
	assert.ok(eventsSent.some((e) => e.ev === "OnBIFFBegin"));
	assert.ok(eventsSent.some((e) => e.ev === "OnBIFFComplete"));

	// 2. Tauri environment with standard result
	globalThis.__TAURI_INTERNALS__ = {
		invoke: async (cmd, _args) => {
			if (cmd === "check_email") {
				return { count: 3, size: 1024, unread: 1 };
			}
		},
		transformCallback: (cb) => cb,
	};
	eventsSent.length = 0;
	await mockApp.checkEmail("work");
	assert.ok(
		eventsSent.some((e) => e.ev === "OnBIFFComplete" && e.args[2] === "work"),
	);

	// 3. Tauri environment with headers result (OnBIFF2Complete)
	globalThis.__TAURI_INTERNALS__ = {
		invoke: async (cmd, _args) => {
			if (cmd === "check_email") {
				return {
					count: 5,
					size: 2048,
					unread: 2,
					headers: ["Subject: Hello", "From: Boss"],
				};
			}
		},
		transformCallback: (cb) => cb,
	};
	eventsSent.length = 0;
	await mockApp.checkEmail("news");
	assert.ok(eventsSent.some((e) => e.ev === "OnBIFF2Complete"));

	// 4. Tauri environment with error/failure (sendShioriEvent throws)
	globalThis.__TAURI_INTERNALS__ = {
		invoke: async () => {
			return { count: 0, size: 0, unread: 0 };
		},
		transformCallback: (cb) => cb,
	};
	mockApp.ghostController.sendShioriEvent = async (ev) => {
		eventsSent.push({ ev });
		if (ev === "OnBIFFBegin") throw new Error("Shiori error");
		return {};
	};
	eventsSent.length = 0;
	await mockApp.checkEmail("broken");
	assert.ok(eventsSent.some((e) => e.ev === "OnBIFFFailure"));

	// 5. Tauri environment where invoke("check_email") rejects (covers .catch(() => null) on line 20)
	globalThis.__TAURI_INTERNALS__ = {
		invoke: async (cmd) => {
			if (cmd === "check_email") throw new Error("Rust check_email failed");
		},
		transformCallback: (cb) => cb,
	};
	eventsSent.length = 0;
	mockApp.ghostController.sendShioriEvent = async (ev, args) => {
		eventsSent.push({ ev, args });
	};
	await mockApp.checkEmail("fail_account");
	assert.ok(eventsSent.some((e) => e.ev === "OnBIFFComplete"));

	// 6. Tauri environment where result.headers is not an array (covers Array.isArray false branch)
	globalThis.__TAURI_INTERNALS__ = {
		invoke: async (cmd) => {
			if (cmd === "check_email") {
				return { count: 1, size: 100, unread: 1, headers: "not-an-array" };
			}
		},
		transformCallback: (cb) => cb,
	};
	eventsSent.length = 0;
	mockApp.ghostController.sendShioriEvent = async (ev, args) => {
		eventsSent.push({ ev, args });
	};
	await mockApp.checkEmail("non_array_headers");
	assert.ok(eventsSent.some((e) => e.ev === "OnBIFFComplete"));

	delete globalThis.__TAURI_INTERNALS__;
	assert.ok(true);
});
