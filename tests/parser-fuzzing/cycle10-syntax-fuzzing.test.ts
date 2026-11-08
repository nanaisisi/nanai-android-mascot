import assert from "node:assert/strict";
import { test } from "vitest";

const { parseSurfacesTxt } = await import(
	"../../ui/js/surface/surface-parser.js"
);
const { parseSakuraScript } = await import(
	"../../ui/js/ghost/sakura-tokenizer.js"
);
const { handleTimerNotifyCommand, handleTimerPluginCommand } = await import(
	"../../ui/js/ghost/command-handler/system/timer.js"
);
const { handleFileWatchCommand, handleExecuteCommand } = await import(
	"../../ui/js/ghost/command-handler/media.js"
);

test("Parser Fuzzing Cycle 10: surfaces.txt compound intervals, bracketed surface IDs, and 7-part collision fuzzing", () => {
	const malformedSurfaces = `
// Unclosed brackets and weird casing
surface0
{
0pattern0,bind+sometimes,0,0,0,0
0pattern1,bind+random,5,10,0,0
collision,0,10,10,20,20,body
}

// Scoped surface with bracket syntax
sakura.surface[1]
{
name,CustomSakura
icon.rect,10,20,30,40
0pattern0,rarely,1,0,0,0
collision,1,15,15,35,35,head
}

kero.surface[10]
{
name,CustomKero
icon.rect,5,5,25,25
collision,2,0,0,50,50,kerobody
}

// Corrupted surface ID syntax
surface[abc]
{
0pattern0,sometimes,0,0,0,0
}
surface[-5]
{
0pattern0,periodic,5,0,0,0
}
`;

	assert.doesNotThrow(() => {
		const parsed = parseSurfacesTxt(malformedSurfaces);
		assert.ok(parsed);
		assert.equal(parsed.names?.["1"], "CustomSakura");
		assert.deepEqual(parsed.iconRects?.["1"], [10, 20, 30, 40]);
		assert.equal(parsed.names?.["10"], "CustomKero");
		assert.deepEqual(parsed.iconRects?.["10"], [5, 5, 25, 25]);
	});
});

test("Parser Fuzzing Cycle 10: Cycle 9 & Cycle 10 extended timer and plugin commands with malformed arguments", async () => {
	const dummyHandler = {
		app: {
			ghostController: {
				sendShioriEvent: async () => {},
			},
		},
	};

	const fuzzedTimerArgs = [
		[],
		["not_enough_args"],
		["invalid_seconds", "OnTestEvent"],
		["10", ""],
		["-5", "OnNegativeTimer"],
		["NaN", "OnInvalidTimer"],
		["0", "OnInstantTimer", "ref0", "ref1"],
	];

	for (const args of fuzzedTimerArgs) {
		await assert.doesNotReject(
			async () => {
				await handleTimerNotifyCommand(dummyHandler, args as string[]);
			},
			`handleTimerNotifyCommand should safely handle ${JSON.stringify(args)}`,
		);
	}

	const fuzzedPluginArgs = [
		[],
		["only_target"],
		["plugin_id", "invalid_sec"],
		["plugin_id", "5", ""],
		["", "10", "OnPluginEvent"],
		["plugin_uuid", "10", "OnPluginNotify", "arg1", "arg2"],
	];

	for (const args of fuzzedPluginArgs) {
		await assert.doesNotReject(
			async () => {
				await handleTimerPluginCommand(dummyHandler, args as string[], false);
			},
			`handleTimerPluginCommand should safely handle ${JSON.stringify(args)}`,
		);
	}
});

test("Parser Fuzzing Cycle 10: FileWatch, Execute commands and media handler fuzzing with injection payloads", async () => {
	const dummyHandler = {
		app: {},
	};

	const fuzzedFileWatchArgs = [
		[],
		[""],
		["/valid/path/file.txt"],
		["relative/path.txt", "1000"],
		["invalid\0path", "not_a_number"],
		["C:\\Windows\\System32\\calc.exe", "5000", "modify"],
	];

	for (const args of fuzzedFileWatchArgs) {
		await assert.doesNotReject(
			async () => {
				await handleFileWatchCommand(dummyHandler, args as string[]);
			},
			`handleFileWatchCommand should safely handle ${JSON.stringify(args)}`,
		);
	}

	const fuzzedExecuteArgs = [
		[],
		["unknown_subcommand"],
		["filewatch"],
		["emptyrecyclebin"],
		["ping"],
		["nslookup"],
		["schedule-add"],
	];

	for (const args of fuzzedExecuteArgs) {
		await assert.doesNotReject(
			async () => {
				await handleExecuteCommand(dummyHandler, args as string[]);
			},
			`handleExecuteCommand should safely handle ${JSON.stringify(args)}`,
		);
	}
});

test("Parser Fuzzing Cycle 10: SakuraScript nested tokenization with extreme delimiter combinations", () => {
	const extremeScripts = [
		"\\0\\s[0]\\![execute,ping,127.0.0.1]\\![filewatch,test.log,1000]\\w9\\e",
		"\\0\\![timerraiseother,TargetGhost,5,OnOtherCustomEvent,arg1]\\1\\![timernotifyplugin,PluginID,10,OnPluginTest]\\e",
		"\\0\\s[surface[0]]InvalidNestedBracket\\1\\s[1]\\__q[id]Choice\\__q\\e",
	];

	for (const script of extremeScripts) {
		assert.doesNotThrow(() => {
			const tokens = parseSakuraScript(script);
			assert.ok(Array.isArray(tokens));
		});
	}
});
