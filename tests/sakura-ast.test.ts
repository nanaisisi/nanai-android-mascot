import assert from "node:assert/strict";
import { test } from "vitest";
import {
	parseSakuraScript,
	tokensToAst,
} from "../ui/js/ghost/sakura-parser.js";

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
