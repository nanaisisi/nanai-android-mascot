import assert from "node:assert/strict";
import { test } from "vitest";

const { rustCommandsToTokens, parseSakuraScriptAsync } = await import(
	"../ui/js/ghost/sakura-rust-bridge.js"
);

test("rustCommandsToTokens converts all Rust commands to SakuraScriptToken list", () => {
	const rustCmds = [
		{ type: "Target", payload: 1 },
		{ type: "Surface", payload: 10 },
		{ type: "Wait", payload: 200 },
		{ type: "ClickWait" },
		{ type: "Quick", payload: true },
		{ type: "NewLine", payload: { half: true } },
		{ type: "NewLine", payload: { half: false } },
		{ type: "Clear" },
		{ type: "Choice", payload: { label: "Opt", id: "opt1" } },
		{ type: "Anchor", payload: { id: "a1", text: "Hi" } },
		{ type: "Raise", payload: { event: "OnEvent", references: ["ref1"] } },
		{
			type: "Bind",
			payload: { category: "hat", part: "ribbon", status: true },
		},
		{
			type: "Bind",
			payload: { category: "hat", part: "ribbon", status: false },
		},
		{ type: "Balloon", payload: 0 },
		{ type: "Animation", payload: { id: 1, wait: true } },
		{ type: "Timeout" },
		{ type: "Halt" },
		{ type: "Sync", payload: true },
		{ type: "Offset", payload: { x: "10", y: "20" } },
		{ type: "Font", payload: { tag: "bold", param: "1" } },
		{ type: "Text", payload: "Test" },
		{ type: "End" },
		{ type: "Command", payload: { args: ["arg1"] } },
		{ type: "UnknownType" },
	];

	const tokens = rustCommandsToTokens(rustCmds);
	assert.ok(tokens.length > 0);

	// Verify specific tokens
	assert.equal(tokens.find((t) => t.type === "scope")?.value, 1);
	assert.equal(tokens.find((t) => t.type === "surface")?.value, 10);
	assert.equal(tokens.find((t) => t.type === "wait")?.value, 200);
	assert.equal(tokens.find((t) => t.type === "pause") !== undefined, true);
	assert.equal(tokens.find((t) => t.type === "quick_toggle")?.value, true);
	assert.equal(tokens.find((t) => t.type === "choice")?.id, "opt1");
	assert.equal(tokens.find((t) => t.type === "anchor_begin")?.id, "a1");
	assert.equal(tokens.find((t) => t.type === "timeout") !== undefined, true);
	assert.equal(tokens.find((t) => t.type === "halt") !== undefined, true);
	assert.equal(tokens.find((t) => t.type === "end") !== undefined, true);
});

test("parseSakuraScriptAsync covers non-Tauri, Tauri success, and Tauri error branches", async () => {
	// 1. Non-Tauri environment
	delete globalThis.__TAURI__;
	delete globalThis.__TAURI_INTERNALS__;
	const nonTauriRes = await parseSakuraScriptAsync("\\0Hello\\e");
	assert.equal(nonTauriRes, undefined);

	// 2. Tauri environment success
	globalThis.__TAURI_INTERNALS__ = {
		invoke: async (cmd, _args) => {
			if (cmd === "parse_sakura_script") {
				return [{ type: "Text", payload: "Hi" }, { type: "End" }];
			}
		},
		transformCallback: (cb) => cb,
	};
	globalThis.window = globalThis;

	const tauriRes = await parseSakuraScriptAsync("\\0Hi\\e");
	assert.ok(Array.isArray(tauriRes));
	assert.equal(tauriRes[0].type, "char");

	// 3. Tauri environment error
	globalThis.__TAURI_INTERNALS__.invoke = async () => {
		throw new Error("parse fail");
	};
	const errRes = await parseSakuraScriptAsync("\\0Fail\\e");
	assert.equal(errRes, undefined);

	delete globalThis.__TAURI_INTERNALS__;
});
