import assert from "node:assert/strict";
import { test } from "vitest";

const { parseSakuraScript } = await import(
	"../../ui/js/ghost/sakura-tokenizer.js"
);
const { handleSetSyncObject, handleResetSyncObject, handleWaitSyncObject } =
	await import("../../ui/js/ghost/command-handler/playback.js");
const { handleEnterMode, handleLeaveMode } = await import(
	"../../ui/js/ghost/command-handler/system/surface.js"
);
const { handleRaiseOtherCommand, handleNotifyOtherCommand } = await import(
	"../../ui/js/ghost/command-handler/ghost.js"
);

test("Parser Fuzzing Cycle 8: SyncObject commands argument fuzzing and null-safety", async () => {
	const dummyHandler = {
		player: {
			playbackController: {
				syncObjects: null,
			},
		},
		app: {
			syncObjectManager: null,
		},
	};

	const fuzzedSyncArgs = [
		["set", "syncobject"], // missing object name
		["set", "syncobject", ""], // empty object name
		["set", "syncobject", "   "], // whitespace only
		["set", "syncobject", "obj_1", "extra_arg1", "extra_arg2"], // surplus args
		["reset", "syncobject"],
		["reset", "syncobject", null],
		["wait", "syncobject"],
		["wait", "syncobject", "obj_2", "--timeout=-100"], // negative timeout
		["wait", "syncobject", "obj_2", "--timeout=invalid"], // NaN timeout
		["wait", "syncobject", "obj_2", "--reset=0", "5000"], // valid with positional and option flags
		["wait", "syncobject", "obj_2", "invalid_number_pos"],
	];

	for (const args of fuzzedSyncArgs) {
		await assert.doesNotReject(
			async () => {
				if (args[0] === "set") {
					await handleSetSyncObject(dummyHandler, args as string[]);
				} else if (args[0] === "reset") {
					await handleResetSyncObject(dummyHandler, args as string[]);
				} else if (args[0] === "wait") {
					await handleWaitSyncObject(dummyHandler, args as string[]);
				}
			},
			`SyncObject command handler should not throw for ${JSON.stringify(args)}`,
		);
	}
});

test("Parser Fuzzing Cycle 8: Mode transition commands and cross-ghost IPC anomaly tolerance", async () => {
	const eventsSent: any[] = [];
	const dummyHandler = {
		player: {
			currentScope: 0,
			app: {
				ghostController: {
					sendShioriEvent: async (ev: string, args: any[]) => {
						eventsSent.push({ ev, args });
					},
					sendRaiseOther: async (ghost: string, ev: string, refs: any[]) => {
						eventsSent.push({ type: "raiseOther", ghost, ev, refs });
					},
					sendNotifyOther: async (ghost: string, ev: string, refs: any[]) => {
						eventsSent.push({ type: "notifyOther", ghost, ev, refs });
					},
				},
			},
		},
	};

	const fuzzedModeArgs = [
		["enter"], // missing mode
		["enter", ""], // empty mode
		["enter", "unknown_undefined_mode"], // arbitrary mode string
		["leave"],
		["leave", ""],
		["leave", "non_existent_mode"],
	];

	for (const args of fuzzedModeArgs) {
		await assert.doesNotReject(
			async () => {
				if (args[0] === "enter") {
					await handleEnterMode(dummyHandler, args as string[]);
				} else {
					await handleLeaveMode(dummyHandler, args as string[]);
				}
			},
			`Mode commands should tolerate ${JSON.stringify(args)}`,
		);
	}

	const fuzzedIpcArgs = [
		["raiseother"], // missing all
		["raiseother", "TargetGhost"], // missing event
		["raiseother", "TargetGhost", "OnEvent", "a", "b", "c"], // valid
		["notifyother"],
		["notifyother", ""],
		["notifyother", "TargetGhost", "OnNotice"],
	];

	for (const args of fuzzedIpcArgs) {
		await assert.doesNotReject(
			async () => {
				if (args[0] === "raiseother") {
					await handleRaiseOtherCommand(dummyHandler, args as string[]);
				} else {
					await handleNotifyOtherCommand(dummyHandler, args as string[]);
				}
			},
			`IPC commands should tolerate ${JSON.stringify(args)}`,
		);
	}
});

test("Parser Fuzzing Cycle 8: Extreme SakuraScript tokenizer input with combined control tags", () => {
	const extremeScripts = [
		// Mixed brackets, backslashes, unclosed scopes
		"\\0\\![set,syncobject,\\__q[id]test\\__q]\\1\\![enter,passivemode]\\s[0]",
		// Null characters and UTF-8 multibyte boundary sequences
		"\\0\\u0000\\_u[0x0041]\\_m[0x42]\\&[amp]\\&[invalid_entity;]\\e",
		// Rapid successive mode and sync commands
		"\\![enter,passivemode]\\![leave,passivemode]\\![enter,collisionmode]\\![leave,collisionmode]",
		// Empty and malformed script commands
		"\\![]\\![,]\\![     ]\\![unknown,command,args,,,]",
	];

	for (const script of extremeScripts) {
		const tokens = parseSakuraScript(script);
		assert.ok(
			Array.isArray(tokens),
			`parseSakuraScript should successfully produce token array for ${script}`,
		);
	}
});
