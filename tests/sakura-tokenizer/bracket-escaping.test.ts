import assert from "node:assert/strict";
import { test } from "vitest";

const { parseSakuraScript } = await import(
	"../../ui/ts/ghost/sakura-tokenizer.js"
);

test("parseSakuraScript handles bracket escaping and quoted arguments with commas and double quotes", () => {
	const script =
		'\\0\\q[Option \\] with bracket,opt_id]\\![raise,OnTest,"100,2"]\\![call,ghost,"the ""MobileMaster"""]';
	const tokens = parseSakuraScript(script);

	// Choice with escaped bracket
	const choice = tokens.find((t) => t.type === "choice");
	assert.ok(choice);
	assert.equal(choice.text, "Option ] with bracket");
	assert.equal(choice.id, "opt_id");

	// Raise command with comma inside quotes
	const raiseCmd = tokens.find(
		(t) => t.type === "command" && t.args[0] === "raise",
	);
	assert.ok(raiseCmd);
	assert.equal(raiseCmd.args[1], "OnTest");
	assert.equal(raiseCmd.args[2], "100,2");

	// Call command with escaped double quote
	const callCmd = tokens.find(
		(t) => t.type === "command" && t.args[0] === "call",
	);
	assert.ok(callCmd);
	assert.equal(callCmd.args[1], "ghost");
	assert.equal(callCmd.args[2], 'the "MobileMaster"');
});
