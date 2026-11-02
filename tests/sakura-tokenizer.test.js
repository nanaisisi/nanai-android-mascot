import assert from "node:assert/strict";
import { test } from "vitest";

const { parseSakuraScript } = await import(
	"../ui/js/ghost/sakura-tokenizer.js"
);
const { tokensToAst } = await import("../ui/js/ghost/parser/ast.js");

test("tokensToAst transforms tokens into structured AST including Choice", () => {
	const script = "\\0\\s[0]Text\\q[Option 1,id1]\\1\\_a[anchor1]AnchorText\\_a";
	const tokens = parseSakuraScript(script);
	const ast = tokensToAst(tokens);

	assert.equal(ast.nodeType, "root");
	assert.equal(ast.children.length, 2);

	const scope0 = ast.children[0];
	assert.equal(scope0.nodeType, "scope");
	assert.equal(scope0.scope, 0);

	const choiceNode = scope0.children.find((c) => c.nodeType === "choice");
	assert.ok(choiceNode);
	assert.equal(choiceNode.id, "id1");
	assert.equal(choiceNode.text, "Option 1");

	const scope1 = ast.children[1];
	assert.equal(scope1.nodeType, "scope");
	assert.equal(scope1.scope, 1);

	const anchorNode = scope1.children.find((c) => c.nodeType === "anchor");
	assert.ok(anchorNode);
	assert.equal(anchorNode.id, "anchor1");
});

test("parseSakuraScript tokenizes all JS fallback SakuraScript tags and text", () => {
	const script =
		"\\0\\hHello\\1\\uWorld\\p[2]\\p0\\s[10]\\s0\\i[1,wait]\\i2\\w5\\_w[200]\\n\\n[half]\\c\\c[char,3]\\c[line,2]\\x\\x[noclear]\\_q\\_q[1]\\_q[0]\\_a[a1,arg1]Link\\_a\\![open,box]\\q[Opt,opt1]\\_l[10,20]\\_s\\_s[1]\\_s[0]\\b[0]\\b1\\f[bold,1]\\f[default]\\t\\-\\custom[arg]Text\\e";

	const tokens = parseSakuraScript(script);
	assert.ok(tokens.length > 0);

	// Partial clear
	const charClear = tokens.find((t) => t.type === "clear" && t.mode === "char");
	assert.equal(charClear?.count, 3);
	const lineClear = tokens.find((t) => t.type === "clear" && t.mode === "line");
	assert.equal(lineClear?.count, 2);

	// Pause noclear
	const noclearPause = tokens.find(
		(t) => t.type === "pause" && t.noClear === true,
	);
	assert.ok(noclearPause);

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
	assert.equal(
		tokens.some((t) => t.type === "clear"),
		true,
	);
	assert.equal(
		tokens.some((t) => t.type === "pause"),
		true,
	);

	// Quick toggle
	const quicks = tokens.filter((t) => t.type === "quick_toggle");
	assert.equal(quicks.length, 3);

	// Anchor
	assert.equal(
		tokens.some((t) => t.type === "anchor_begin" && t.id === "a1"),
		true,
	);
	assert.equal(
		tokens.some((t) => t.type === "anchor_end"),
		true,
	);

	// Command
	assert.equal(
		tokens.some((t) => t.type === "command" && t.args[0] === "open"),
		true,
	);

	// Choice
	assert.equal(
		tokens.some(
			(t) => t.type === "choice" && t.id === "opt1" && t.text === "Opt",
		),
		true,
	);

	// Offset
	assert.equal(
		tokens.some((t) => t.type === "offset" && t.x === "10" && t.y === "20"),
		true,
	);

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
	assert.equal(
		tokens.some((t) => t.type === "timeout"),
		true,
	);
	assert.equal(
		tokens.some((t) => t.type === "halt"),
		true,
	);
	assert.equal(
		tokens.some((t) => t.type === "end"),
		true,
	);

	// Normal text chars
	assert.equal(
		tokens.some((t) => t.type === "char" && t.value === "H"),
		true,
	);
});
