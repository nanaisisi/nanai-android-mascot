import assert from "node:assert/strict";
import { describe, it } from "vitest";

const { parseSakuraScript } = await import(
	"../../ui/ts/ghost/sakura-tokenizer.js"
);
const { tokensToAst, collectChoices, collectSurfaces } = await import(
	"../../ui/ts/ghost/parser/ast.js"
);

describe("Slot-04 Cycle 6 syntax and AST extensions", () => {
	it("parses Unicode and ASCII escape codes correctly", () => {
		// \_u[0x22EE] vertical ellipsis, \_u[65] 'A', \_m[0x42] 'B'
		const script = "\\_u[0x41]\\_u[66]\\_m[0x43]";
		const tokens = parseSakuraScript(script);
		const chars = tokens
			.filter((t) => t.type === "char")
			.map((t) => t.value)
			.join("");
		assert.equal(chars, "ABC");
	});

	it("resolves XML/HTML entities via \\&[ID]", () => {
		const script = "\\&[amp]\\&[lt]\\&[gt]\\&[quot]\\&[apos]\\&[nbsp]";
		const tokens = parseSakuraScript(script);
		const chars = tokens
			.filter((t) => t.type === "char")
			.map((t) => t.value)
			.join("");
		assert.equal(chars, "&<>\"' ");
	});

	it("parses \\__q[ID,...] choice scope into tokens and AST choice nodes", () => {
		const script =
			"\\0\\s[10]\\__q[OnSelectA,arg1]Clickable Choice A\\__q\\1\\s[20]\\q[Choice B,OnSelectB]";
		const tokens = parseSakuraScript(script);

		const scopeBegins = tokens.filter((t) => t.type === "choice_scope_begin");
		const scopeEnds = tokens.filter((t) => t.type === "choice_scope_end");
		assert.equal(scopeBegins.length, 1);
		assert.equal(scopeEnds.length, 1);
		assert.equal(scopeBegins[0].id, "OnSelectA");
		assert.deepEqual(scopeBegins[0].args, ["OnSelectA", "arg1"]);

		const ast = tokensToAst(tokens);
		const choices = collectChoices(ast);
		assert.equal(choices.length, 2);
		assert.equal(choices[0].id, "OnSelectA");
		assert.equal(choices[0].text, "Clickable Choice A");
		assert.deepEqual(choices[0].args, ["OnSelectA", "arg1"]);

		assert.equal(choices[1].id, "OnSelectB");
		assert.equal(choices[1].text, "Choice B");

		const surfaces = collectSurfaces(ast);
		assert.deepEqual(surfaces, [10, 20]);
	});
});
