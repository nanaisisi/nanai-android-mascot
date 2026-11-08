import assert from "node:assert/strict";
import { test } from "vitest";

const { parseSakuraScript } = await import(
	"../../ui/js/ghost/sakura-tokenizer.js"
);

test("parseSakuraScript tokenizes \\m[umsg,wparam,lparam] post_message", () => {
	const script = "\\0\\m[WM_CLOSE,0,0]Text";
	const tokens = parseSakuraScript(script);
	const postMsg = tokens.find((t) => t.type === "post_message");
	assert.ok(postMsg);
	assert.equal(postMsg.umsg, "WM_CLOSE");
	assert.equal(postMsg.wparam, "0");
	assert.equal(postMsg.lparam, "0");
});
