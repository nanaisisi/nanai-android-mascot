import assert from "node:assert/strict";
import { test } from "vitest";
import {
	calculateAstTextLength,
	collectAnchors,
	collectAnimations,
	collectChoices,
	collectScopeNodes,
	collectSurfaces,
	filterAstByScope,
	stripWaitsFromAst,
	tokensToAst,
} from "../ui/ts/ghost/parser/ast.js";
import { parseSakuraScript } from "../ui/ts/ghost/sakura-tokenizer.js";

test("tokensToAst builds structured AST from SakuraScript tokens", () => {
	const script = "\\0\\s[0]Hello!\\_a[id1,arg1]Link\\_a\\1\\s[10]Kero!\\e";
	const tokens = parseSakuraScript(script);
	const ast = tokensToAst(tokens);

	assert.equal(ast.nodeType, "root");
	assert.equal(Array.isArray(ast.children), true);

	// Root should have 2 scopes: \0 and \1
	const scopes = ast.children.filter((c) => c.nodeType === "scope");
	assert.equal(scopes.length, 2);

	const scope0 = scopes[0];
	assert.equal(scope0.scope, 0);

	// Scope 0 contains surface, text, and anchor
	const surface0 = scope0.children.find(
		(c) => c.nodeType === "command" && c.token?.type === "surface",
	);
	assert.equal(surface0?.token?.value, 0);

	const anchor = scope0.children.find((c) => c.nodeType === "anchor");
	assert.ok(anchor);
	assert.equal(anchor?.id, "id1");
	assert.deepEqual(anchor?.args, ["id1", "arg1"]);
	assert.equal(anchor?.children.length, 4); // "L", "i", "n", "k"

	const scope1 = scopes[1];
	assert.equal(scope1.scope, 1);
	const surface1 = scope1.children.find(
		(c) => c.nodeType === "command" && c.token?.type === "surface",
	);
	assert.equal(surface1?.token?.value, 10);
});

test("parseSakuraScript handles escaped backslash \\\\ and escaped percent \\%", () => {
	const script = "100\\% complete\\\\done";
	const tokens = parseSakuraScript(script);

	// Check that \% turned into a '%' char token
	const percentToken = tokens.find((t) => t.type === "char" && t.value === "%");
	assert.ok(percentToken);

	// Check that \\ turned into a '\' char token
	const backslashToken = tokens.find(
		(t) => t.type === "char" && t.value === "\\",
	);
	assert.ok(backslashToken);

	// Build AST without scope
	const ast = tokensToAst(tokens);
	assert.equal(ast.nodeType, "root");
	assert.equal(ast.children.length, tokens.length);
});

test("tokensToAst handles unclosed anchors and top-level commands gracefully", () => {
	const tokens = [
		{ type: "char", value: "A" },
		{ type: "anchor_begin", id: "unclosed", args: ["unclosed"] },
		{ type: "char", value: "B" },
	];
	const ast = tokensToAst(tokens);
	assert.equal(ast.nodeType, "root");
	assert.equal(ast.children.length, 2); // char A, then anchor unclosed
	assert.equal(ast.children[1].nodeType, "anchor");
	assert.equal(ast.children[1].id, "unclosed");
});

test("collectAnchors, calculateAstTextLength, and collectScopeNodes operate accurately", () => {
	const script =
		"\\0\\s[0]Hello \\_a[anchor1,r1]Documentation\\_a\\q[Click Here,choice1]\\1\\s[10]Kero world\\e";
	const tokens = parseSakuraScript(script);
	const ast = tokensToAst(tokens);

	// collectAnchors
	const anchors = collectAnchors(ast);
	assert.equal(anchors.length, 1);
	assert.equal(anchors[0].id, "anchor1");
	assert.equal(anchors[0].text, "Documentation");
	assert.deepEqual(anchors[0].args, ["anchor1", "r1"]);

	// collectChoices
	const choices = collectChoices(ast);
	assert.equal(choices.length, 1);
	assert.equal(choices[0].id, "choice1");
	assert.equal(choices[0].text, "Click Here");

	// collectSurfaces
	const surfaces = collectSurfaces(ast);
	assert.deepEqual(surfaces, [0, 10]);

	// calculateAstTextLength
	// "Hello " (6) + "Documentation" (13) + "Click Here" (10) + "Kero world" (10) = 39
	const textLen = calculateAstTextLength(ast);
	assert.equal(textLen, 39);

	// collectScopeNodes
	const scope0Nodes = collectScopeNodes(ast, 0);
	assert.ok(scope0Nodes.length >= 3);
	const scope1Nodes = collectScopeNodes(ast, 1);
	assert.ok(scope1Nodes.length >= 2);
	const scope2Nodes = collectScopeNodes(ast, 2);
	assert.equal(scope2Nodes.length, 0);

	// Direct Scope node test
	const scopeNode = ast.children?.find((c) => c.nodeType === "scope");
	if (scopeNode) {
		const directScopeNodes = collectScopeNodes(scopeNode, 0);
		assert.equal(directScopeNodes.length, scopeNode.children?.length);
	}
});

test("collectAnimations, filterAstByScope, and stripWaitsFromAst handle advanced tree traversal", () => {
	const script =
		"\\0\\s[0]\\w5Hello\\i[100,wait]\\_w[200]!\\1\\s[10]\\i[200]\\w9Kero\\e";
	const tokens = parseSakuraScript(script);
	const ast = tokensToAst(tokens);

	// 1. collectAnimations
	const anims = collectAnimations(ast);
	assert.equal(anims.length, 2);
	assert.equal(anims[0].id, 100);
	assert.equal(anims[0].wait, true);
	assert.equal(anims[1].id, 200);
	assert.equal(anims[1].wait, false);

	// 2. filterAstByScope
	const scope0Ast = filterAstByScope(ast, 0);
	assert.equal(scope0Ast.nodeType, "root");
	assert.equal(scope0Ast.children?.length, 1);
	assert.equal(scope0Ast.children?.[0].scope, 0);
	assert.deepEqual(collectSurfaces(scope0Ast), [0]);

	const scope1Ast = filterAstByScope(ast, 1);
	assert.equal(scope1Ast.children?.length, 1);
	assert.equal(scope1Ast.children?.[0].scope, 1);
	assert.deepEqual(collectSurfaces(scope1Ast), [10]);

	const scope2Ast = filterAstByScope(ast, 2);
	assert.equal(scope2Ast.children?.length, 0);

	// 3. stripWaitsFromAst
	const cleanAst = stripWaitsFromAst(ast);
	const allTokensAfter =
		cleanAst.children?.flatMap((c) => c.children || []) || [];
	const hasWait = allTokensAfter.some(
		(n) =>
			n.nodeType === "command" &&
			(n.token?.type === "wait" || n.token?.type === "wait_anim"),
	);
	assert.equal(hasWait, false);
	assert.equal(collectAnimations(cleanAst).length, 2);
});
