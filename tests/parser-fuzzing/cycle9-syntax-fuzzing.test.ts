import assert from "node:assert/strict";
import { test } from "vitest";

const { parseSakuraScript } = await import(
	"../../ui/js/ghost/sakura-tokenizer.js"
);
const { expandSakuraScriptEnv } = await import(
	"../../ui/js/ghost/command-handler/env.js"
);
const { handleWindowState } = await import(
	"../../ui/js/ghost/command-handler/window.js"
);
const { handleOpenDialogCommand } = await import(
	"../../ui/js/ghost/command-handler/dialog.js"
);

test("Parser Fuzzing Cycle 9: Window state change commands fuzzing and exception tolerance", async () => {
	const fuzzedWindowArgs = [
		"",
		"   ",
		"UNKNOWN_STATE",
		"min",
		"minimize",
		"!stayontop",
		"stayontop",
		"restore",
		"maximized",
		null,
		undefined,
		1234,
	];

	const dummyHandler = {
		app: {
			ghostController: {
				sendShioriEvent: async () => {},
			},
		},
	};

	for (const arg of fuzzedWindowArgs) {
		await assert.doesNotReject(
			async () => {
				await handleWindowState(arg as string, dummyHandler);
			},
			`handleWindowState should not throw for ${String(arg)}`,
		);
	}
});

test("Parser Fuzzing Cycle 9: Dialog command handlers with malformed arguments and injection attempts", async () => {
	const dummyHandler = {
		app: {
			modalDialogController: {
				openSystemDialog: async () => true,
				openCalendar: () => {},
			},
		},
	};

	const fuzzedDialogArgs = [
		["open", "dialog"], // missing dialog type
		["open", "dialog", ""],
		["open", "dialog", "unknown_dialog_type"],
		["open", "dialog", "open", "--id=", "--title="],
		["open", "dialog", "save", "--dir=///invalid/path"],
		["open", "dialog", "terms", "--id=terms\0injection"],
		["open", "dialog", "color", "--filter=*.png;*.jpg", "--option=noclose"],
	];

	for (const args of fuzzedDialogArgs) {
		await assert.doesNotReject(
			async () => {
				await handleOpenDialogCommand(dummyHandler, args as string[]);
			},
			`handleOpenDialogCommand should safely handle ${JSON.stringify(args)}`,
		);
	}
});

test("Parser Fuzzing Cycle 9: Environment variable expansion with malicious formatting and deep nesting", () => {
	const maliciousEnvScripts = [
		// Property calls with unbalanced brackets
		"%property[system.environment.",
		"%property[[[deep]]]",
		"%property[)]%",
		// Escaped percent and variable sequences
		"\\%\\%\\%property[date.year]\\\\%username%selfname",
		// Malformed arguments and environment variables
		"%m?",
		"%*",
		"%unknown_var_name%",
		"%0%1%2%999999%",
	];

	for (const script of maliciousEnvScripts) {
		assert.doesNotThrow(() => {
			const expanded = expandSakuraScriptEnv(script, {
				username: "TestUser",
				selfname: "Nanai",
			});
			assert.equal(typeof expanded, "string");
		}, `expandSakuraScriptEnv should handle ${script} without crashing`);
	}
});

test("Parser Fuzzing Cycle 9: Complex multi-character and nested scope tokenization", () => {
	const complexScripts = [
		// Alternating rapid scopes with inline choices
		"\\0\\__q[id1]Choice 1\\__q\\1\\__q[id2]Choice 2\\__q\\p[2]\\s[0]Character 3\\e",
		// Unclosed inline choice tag and entity reference mix
		"\\0\\__q[unclosed\\&[amp]Text\\_u[0x3042]\\_m[0x41]",
		// Rapid nested animations, balloon offsets, and quick toggles
		"\\0\\_q\\![anim,add,move,10,20]\\_q\\_s\\b[0]\\c\\s[10]\\w9\\e",
	];

	for (const script of complexScripts) {
		const tokens = parseSakuraScript(script);
		assert.ok(
			Array.isArray(tokens),
			`parseSakuraScript should successfully parse ${script}`,
		);
	}
});
