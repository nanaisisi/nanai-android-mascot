import assert from "node:assert/strict";
import { test } from "vitest";

const { parseSakuraScript } = await import(
	"../../ui/ts/ghost/sakura-tokenizer.js"
);
const { tokensToAst } = await import("../../ui/ts/ghost/parser/ast.js");

test("AST traversal functions and lifetime filtering", async () => {
	const {
		traverseAst,
		collectAstTokens,
		collectAstTokensByLifetime,
		getSakuraTokenLifetime,
	} = await import("../../ui/ts/ghost/parser/ast.js");

	assert.equal(getSakuraTokenLifetime({ type: "font" }), "Scope");
	assert.equal(getSakuraTokenLifetime({ type: "surface" }), "Permanent");
	assert.equal(getSakuraTokenLifetime({ type: "bind" }), "Permanent");
	assert.equal(
		getSakuraTokenLifetime({ type: "command", command: "windowstate" }),
		"Permanent",
	);
	assert.equal(getSakuraTokenLifetime({ type: "char" }), "Script");

	const script = "\\0\\s[0]\\f[bold,1]Text\\q[Option 1,id1]";
	const tokens = parseSakuraScript(script);
	const ast = tokensToAst(tokens);

	let visitedNodes = 0;
	traverseAst(ast, (_node) => {
		visitedNodes++;
	});
	assert.ok(visitedNodes >= 3);

	const collected = collectAstTokens(ast);
	assert.ok(collected.length >= 3);
	assert.equal(collected[0].type, "scope");
	assert.equal(collected[0].value, 0);
	assert.equal(collected[1].type, "surface");
	assert.equal(collected[1].value, 0);
	const choiceTok = collected.find((t) => t.type === "choice");
	assert.ok(choiceTok);
	assert.equal(choiceTok.id, "id1");
	assert.equal(choiceTok.text, "Option 1");

	const scopeTokens = collectAstTokensByLifetime(ast, "Scope");
	assert.equal(scopeTokens.length, 1);
	assert.equal(scopeTokens[0].type, "font");

	const permanentTokens = collectAstTokensByLifetime(ast, "Permanent");
	assert.equal(permanentTokens.length, 1);
	assert.equal(permanentTokens[0].type, "surface");
});
