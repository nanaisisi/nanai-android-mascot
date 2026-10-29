import assert from "node:assert/strict";
import { test } from "vitest";

const { parseSakuraScript } = await import("../ui/js/ghost/sakura-tokenizer.js");

test("parseSakuraScript tokenizes all JS fallback SakuraScript tags and text", () => {
	const script =
		"\\0\\hHello\\1\\uWorld\\p[2]\\p0\\s[10]\\s0\\i[1,wait]\\i2\\w5\\_w[200]\\n\\n[half]\\c\\x\\_q\\_q[1]\\_q[0]\\_a[a1,arg1]Link\\_a\\![open,box]\\q[Opt,opt1]\\_l[10,20]\\_s\\_s[1]\\_s[0]\\b[0]\\b1\\f[bold,1]\\f[default]\\t\\-\\custom[arg]Text\\e";

	const tokens = parseSakuraScript(script);
	assert.ok(tokens.length > 0);

	// Scope tokens
	assert.equal(tokens.filter((t) => t.type === "scope").length, 6);

	// Surface tokens
	assert.equal(tokens.filter((t) => t.type === "surface").length, 2);

	// Animation tokens
	const anims = tokens.filter((t) => t.type === "animation");
	assert.equal(anims.length, 2);
	assert.equal(anims[0].wait, true);

	// Wait tokens
	const waits = tokens.filter((t) => t.type === "wait");
	assert.equal(waits.length, 2);
	assert.equal(waits[0].value, 250);
	assert.equal(waits[1].value, 200);

	// Newline tokens
	const nls = tokens.filter((t) => t.type === "newline");
	assert.equal(nls.length, 2);
	assert.equal(nls[1].half, true);

	// Clear and Pause
	assert.equal(tokens.some((t) => t.type === "clear"), true);
	assert.equal(tokens.some((t) => t.type === "pause"), true);

	// Quick toggle
	const quicks = tokens.filter((t) => t.type === "quick_toggle");
	assert.equal(quicks.length, 3);

	// Anchor
	assert.equal(tokens.some((t) => t.type === "anchor_begin" && t.id === "a1"), true);
	assert.equal(tokens.some((t) => t.type === "anchor_end"), true);

	// Command
	assert.equal(tokens.some((t) => t.type === "command" && t.args[0] === "open"), true);

	// Choice
	assert.equal(tokens.some((t) => t.type === "choice" && t.id === "opt1" && t.text === "Opt"), true);

	// Offset
	assert.equal(tokens.some((t) => t.type === "offset" && t.x === "10" && t.y === "20"), true);

	// Sync toggle
	assert.equal(tokens.filter((t) => t.type === "sync_toggle").length, 3);

	// Balloon
	assert.equal(tokens.filter((t) => t.type === "balloon").length, 2);

	// Font
	const fonts = tokens.filter((t) => t.type === "font");
	assert.equal(fonts.length, 2);
	assert.equal(fonts[0].tag, "bold");
	assert.equal(fonts[0].param, "1");

	// Timeout, Halt, End
	assert.equal(tokens.some((t) => t.type === "timeout"), true);
	assert.equal(tokens.some((t) => t.type === "halt"), true);
	assert.equal(tokens.some((t) => t.type === "end"), true);

	// Normal text chars
	assert.equal(tokens.some((t) => t.type === "char" && t.value === "H"), true);
});
