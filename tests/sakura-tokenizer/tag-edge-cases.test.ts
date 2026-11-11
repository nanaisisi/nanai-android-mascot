import assert from "node:assert/strict";
import { test } from "vitest";

const { parseSakuraScript } = await import(
	"../../ui/js/ghost/sakura-tokenizer.js"
);

test("parseSakuraScript tokenizes XML/HTML entity reference tags (\\&[ID])", () => {
	const script =
		"Rock \\&[amp] Roll \\&[lt]Tag\\&[gt] \\&[quot]Quote\\&[quot] \\&[apos]Single\\&[apos] Non\\&[nbsp]Break \\&[custom_entity]";
	const tokens = parseSakuraScript(script);

	const chars = tokens
		.filter((t) => t.type === "char")
		.map((t) => t.value)
		.join("");
	assert.ok(chars.includes("Rock & Roll"));
	assert.ok(chars.includes("<Tag>"));
	assert.ok(chars.includes('"Quote"'));
	assert.ok(chars.includes("'Single'"));
	assert.ok(chars.includes("Non Break"));
	assert.ok(chars.includes("&[custom_entity]"));
});

test("parseSakuraScript tokenizes UCS-2/Unicode (\\_u[0xXXXX]) and ASCII (\\_m[0xXX]) code points", () => {
	// 0x3042 is Hiragana 'あ' (12354 in dec), 0x41 is 'A' (65 in dec)
	const script = "\\_u[0x3042]\\_u[12354]\\_m[0x41]\\_m[66]";
	const tokens = parseSakuraScript(script);

	const chars = tokens
		.filter((t) => t.type === "char")
		.map((t) => t.value)
		.join("");
	assert.equal(chars, "ああAB");
});

test("parseSakuraScript ignores invalid UCS-2 and ASCII out-of-bounds codes", () => {
	// Negative, NaN, or > 0x10ffff / > 0xff
	const script = "Start\\_u[invalid]\\_u[0x110000]\\_m[0x100]\\_m[xyz]End";
	const tokens = parseSakuraScript(script);

	const chars = tokens
		.filter((t) => t.type === "char")
		.map((t) => t.value)
		.join("");
	assert.equal(chars, "StartEnd");
});

test("parseSakuraScript handles choice scopes (\\__q[id,...] ... \\__q)", () => {
	const script = "\\0\\__q[choice_scope_1,extraArg]Custom Clickable Block\\__q";
	const tokens = parseSakuraScript(script);

	const beginTok = tokens.find((t) => t.type === "choice_scope_begin");
	assert.ok(beginTok);
	assert.equal(beginTok.id, "choice_scope_1");
	assert.deepEqual(beginTok.args, ["choice_scope_1", "extraArg"]);

	const endTok = tokens.find((t) => t.type === "choice_scope_end");
	assert.ok(endTok);
});

test("parseSakuraScript handles temporary choices (\\q[temp,text,id,args...])", () => {
	const script = "\\0\\q[temp,Temporary Option,temp_id,ref1,ref2]";
	const tokens = parseSakuraScript(script);

	const choiceTok = tokens.find((t) => t.type === "choice");
	assert.ok(choiceTok);
	assert.equal(choiceTok.text, "Temporary Option");
	assert.equal(choiceTok.id, "temp_id");
	assert.deepEqual(choiceTok.args, ["ref1", "ref2"]);
});

test("parseSakuraScript handles clear modes and counts correctly", () => {
	const script = "\\c\\c[char,5]\\c[line,3]\\c[unknown]";
	const tokens = parseSakuraScript(script);

	const clearTokens = tokens.filter((t) => t.type === "clear");
	assert.equal(clearTokens.length, 4);

	assert.equal(clearTokens[0].mode, undefined);
	assert.equal(clearTokens[1].mode, "char");
	assert.equal(clearTokens[1].count, 5);
	assert.equal(clearTokens[2].mode, "line");
	assert.equal(clearTokens[2].count, 3);
	assert.equal(clearTokens[3].mode, undefined);
});

test("parseSakuraScript handles quicksection and font commands", () => {
	const script =
		"\\_q\\_q[1]\\_q[0]\\f[color,255,0,0]\\f[height,18]\\f[default]";
	const tokens = parseSakuraScript(script);

	const quickTokens = tokens.filter((t) => t.type === "quick_toggle");
	assert.equal(quickTokens.length, 3);
	assert.equal(quickTokens[0].value, undefined);
	assert.equal(quickTokens[1].value, true);
	assert.equal(quickTokens[2].value, false);

	const fontTokens = tokens.filter((t) => t.type === "font");
	assert.equal(fontTokens.length, 3);
	assert.equal(fontTokens[0].tag, "color");
	assert.equal(fontTokens[0].param, "255,0,0");
	assert.equal(fontTokens[1].tag, "height");
	assert.equal(fontTokens[1].param, "18");
	assert.equal(fontTokens[2].tag, "default");
	assert.equal(fontTokens[2].param, null);
});
