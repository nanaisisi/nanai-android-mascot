import assert from "node:assert/strict";
import { test } from "vitest";

const { rustCommandsToTokens } = await import(
	"../../ui/js/ghost/sakura-rust-bridge.js"
);

test("rustCommandsToTokens maps Cycle 5 commands correctly", () => {
	const commands = [
		{ type: "NewLineNoPause" },
		{ type: "AutoPause" },
		{
			type: "PostMessage",
			payload: { umsg: "1024", wparam: "1", lparam: "2" },
		},
		{ type: "Star" },
		{ type: "Marker" },
		{ type: "AudioWait" },
		{ type: "Jump", payload: "OnOther" },
		{ type: "Plus" },
		{
			type: "PluginEvent",
			payload: {
				plugin: "plug1",
				event: "OnTest",
				references: ["r0"],
				is_notify: false,
			},
		},
		{ type: "NoUserBreak", payload: true },
		{ type: "Voice", payload: "voice.wav" },
		{ type: "Midi", payload: "1234" },
		{ type: "ModeChange", payload: { mode: "passive", active: true } },
		{ type: "LockBalloonRepaint", payload: true },
		{
			type: "BalloonSetting",
			payload: { key: "align", value: "left", extra: [] },
		},
		{
			type: "ScheduleAdd",
			payload: {
				date: "2026-11-02",
				time: "12:00",
				title: "Meeting",
				memo: "Agenda",
			},
		},
	];

	const tokens = rustCommandsToTokens(commands);
	assert.equal(tokens.length, 16);
	assert.equal(tokens[0].type, "no_autowrap");
	assert.equal(tokens[1].type, "auto_pause");
	assert.equal(tokens[2].type, "post_message");
	assert.equal(tokens[2].umsg, "1024");
	assert.equal(tokens[3].type, "command");
	assert.equal(tokens[3].command, "marker");
	assert.equal(tokens[5].type, "wait_audio");
	assert.equal(tokens[6].command, "jump");
	assert.equal(tokens[7].type, "plus");
	assert.equal(tokens[8].command, "raiseplugin");
	assert.equal(tokens[9].type, "no_user_break");
	assert.equal(tokens[10].type, "voice");
	assert.equal(tokens[11].type, "midi");
	assert.equal(tokens[12].command, "entermode");
	assert.equal(tokens[13].command, "lockrepaint");
	assert.equal(tokens[14].command, "setballoon");
	assert.equal(tokens[15].command, "schedule-add");
});
