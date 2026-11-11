import assert from "node:assert/strict";
import { test } from "vitest";

const { parseSakuraScript } = await import(
	"../../ui/ts/ghost/sakura-tokenizer.js"
);
const { tokensToAst } = await import("../../ui/ts/ghost/parser/ast.js");

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
