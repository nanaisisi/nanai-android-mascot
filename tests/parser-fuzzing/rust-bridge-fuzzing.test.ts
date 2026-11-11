import assert from "node:assert/strict";
import { test } from "vitest";

const { rustCommandsToTokens } = await import(
	"../../ui/ts/ghost/sakura-rust-bridge.js"
);

test("rustCommandsToTokens fuzzing and defensive mapping", () => {
	const malformedPayloads = [
		{ type: "Target", payload: null },
		{ type: "Target", payload: -1 },
		{ type: "Surface", payload: "not-a-number" },
		{ type: "Wait", payload: undefined },
		{ type: "NewLine", payload: null },
		{ type: "ClearArg", payload: { arg: null } },
		{ type: "ClearArg", payload: { arg: "invalid" } },
		{ type: "ClearArg", payload: { arg: "char,not_a_num" } },
		{ type: "Choice", payload: null },
		{ type: "Anchor", payload: null },
		{ type: "Raise", payload: null },
		{ type: "Bind", payload: null },
		{ type: "InlineBitmap", payload: null },
		{ type: "Animation", payload: null },
		{ type: "Offset", payload: null },
		{ type: "Font", payload: null },
		{ type: "WindowState", payload: null },
		{ type: "Change", payload: null },
		{ type: "Call", payload: null },
		{ type: "SetWallpaper", payload: null },
		{ type: "Cancel", payload: null },
		{ type: "Close", payload: null },
		{ type: "ArchiveExec", payload: null },
		{ type: "DownloadExec", payload: null },
		{ type: "UploadExec", payload: null },
		{ type: "MailCheckExec", payload: null },
		{ type: "MailExec", payload: null },
		{ type: "FileExec", payload: null },
		{ type: "SetHttpTimeout", payload: null },
		{ type: "SetProxy", payload: null },
		{ type: "OpenDialog", payload: null },
		{ type: "Text", payload: null },
		{ type: "NonExistentCommand", payload: {} },
	];

	const tokens = rustCommandsToTokens(malformedPayloads);
	assert.ok(Array.isArray(tokens));
	assert.ok(tokens.length > 0);
});
