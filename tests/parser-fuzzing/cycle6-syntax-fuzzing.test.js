import assert from "node:assert/strict";
import { test } from "vitest";

const { parseSakuraScript } = await import(
	"../../ui/js/ghost/sakura-tokenizer.js"
);
const { handleAnimCommand } = await import(
	"../../ui/js/ghost/command-handler/surface.js"
);
const { handleOpenDialogCommand } = await import(
	"../../ui/js/ghost/command-handler/dialog.js"
);

test("Parser Fuzzing Cycle 6: SakuraScript raw mode toggle (\\_?, \\_!) and unclosed edge cases", () => {
	const rawScripts = [
		// Basic toggle
		"\\0Hello \\_?\\s[0]\\w9\\e\\_? World",
		// Alternative raw delimiter \_!
		"\\0Hello \\_!\\i[10]\\n\\_! Done",
		// Unclosed raw toggle (should consume remaining text as raw chars without crash)
		"\\0Start \\_?\\s[10]\\e unfinished",
		"\\0Start \\_!\\w9\\x unclosed",
		// Nested/consecutive raw delimiters
		"\\_?\\_?\\_?",
		"\\_!\\_?\\_!",
		"\\_?escaped \\\\\\_? inside\\_?",
		// No autowrap tag (\_n)
		"\\0\\_nText without pause or wrap\\_n",
		"\\_n",
		"\\_n[half]", // malformed bracket attached to \_n
	];

	for (const s of rawScripts) {
		const tokens = parseSakuraScript(s);
		assert.ok(
			Array.isArray(tokens),
			`parseSakuraScript should return array for ${s}`,
		);
	}

	// Verify that inside raw mode, script commands are treated as raw characters
	const testScript = "\\0\\_?\\s[0]\\w9\\_?End";
	const tokens = parseSakuraScript(testScript);
	const rawChars = tokens
		.filter((t) => t.type === "char")
		.map((t) => t.value)
		.join("");
	assert.ok(
		rawChars.includes("\\s[0]\\w9"),
		"Commands inside \\_? ... \\_? should be emitted as literal characters",
	);
});

test("Parser Fuzzing Cycle 6: Dynamic \\![anim,add,...] parameter fuzzing and anomaly tolerance", async () => {
	const calls = [];
	const dummyHandler = {
		player: { currentScope: 0 },
		app: {
			surfaceManager: {
				setBaseMoveOffset: (scope, x, y) =>
					calls.push({ type: "move", scope, x, y }),
				currentSurfaceIdFor: () => 0,
				resolveSurfaceNumber: (n) => n,
			},
			ghostController: {
				updateSurface: async (surf, scope, overlays) =>
					calls.push({ type: "updateSurface", surf, scope, overlays }),
				setScopeMoveOffset: (scope, x, y) =>
					calls.push({ type: "scopeMove", scope, x, y }),
			},
		},
	};

	const fuzzedAnimArgs = [
		["anim", "add"], // missing subcommands
		["anim", "add", "unknown_method"], // invalid method
		["anim", "add", "move"], // missing x, y
		["anim", "add", "move", "not_a_num", "invalid"], // NaN coordinates
		["anim", "add", "move", "100", "-50"], // valid coordinates
		["anim", "add", "base"], // missing surface ID
		["anim", "add", "base", "5"], // valid base
		["anim", "add", "overlay"], // missing overlay surface
		["anim", "add", "overlay", "10", "x", "y"], // NaN offsets
		["anim", "add", "overlayfast", "20", "15", "25"], // valid fast overlay
		["anim", "offset", "99", "abc", "def"], // malformed anim offset
		["anim", "invalid_verb", "10"], // invalid verb
	];

	for (const args of fuzzedAnimArgs) {
		await assert.doesNotReject(
			async () => {
				await handleAnimCommand(dummyHandler, args);
			},
			`handleAnimCommand should not reject for ${JSON.stringify(args)}`,
		);
	}

	assert.ok(calls.some((c) => c.type === "move" && c.x === 100 && c.y === -50));
	assert.ok(calls.some((c) => c.type === "updateSurface" && c.surf === "5"));
});

test("Parser Fuzzing Cycle 6: System dialog command (\\![open,dialog,...]) options fuzzing", async () => {
	const dialogCalls = [];
	const dummyHandler = {
		player: { currentScope: 1 },
		app: {
			modalDialogController: {
				openSystemDialog: async (dialogType, dialogParams, scope) => {
					dialogCalls.push({ dialogType, dialogParams, scope });
					return true;
				},
			},
		},
	};

	const fuzzedDialogArgs = [
		["open", "dialog"], // defaults to "open"
		["open", "dialog", "save"],
		[
			"open",
			"dialog",
			"folder",
			"--id=Folder1",
			"--dir=/tmp",
			"--title=Select",
		],
		["open", "dialog", "color", "--id=Color1", "--default=#ff00ff"],
		["open", "dialog", "open", "--filter=Text Files (*.txt)|*.txt", "--dir="],
		["open", "dialog", "unknown_type", "malformed,csv,values"],
	];

	for (const args of fuzzedDialogArgs) {
		await assert.doesNotReject(
			async () => {
				await handleOpenDialogCommand(dummyHandler, args);
			},
			`handleOpenDialogCommand should tolerate ${JSON.stringify(args)}`,
		);
	}

	assert.equal(dialogCalls.length, fuzzedDialogArgs.length);
	assert.equal(dialogCalls[0].dialogType, "open");
	assert.equal(dialogCalls[1].dialogType, "save");
	assert.equal(dialogCalls[2].dialogType, "folder");
});
