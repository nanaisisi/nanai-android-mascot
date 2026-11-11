import assert from "node:assert/strict";
import { test } from "vitest";
import {
	collectAstTokens,
	collectAstTokensByLifetime,
	filterAstByScope,
	getAstDiagnostics,
	getSakuraTokenLifetime,
	mapAstCommands,
	stripWaitsFromAst,
	tokensToAst,
} from "../../ui/ts/ghost/parser/ast.js";
import type {
	SakuraAstNode,
	SakuraToken,
} from "../../ui/ts/ghost/parser/ast-types.js";
import { parseSakuraScript } from "../../ui/ts/ghost/sakura-tokenizer.js";

test("getSakuraTokenLifetime correctly categorizes Scope, Script, and Permanent tokens", () => {
	// Font is Scope lifetime
	assert.equal(getSakuraTokenLifetime({ type: "font", tag: "bold" }), "Scope");

	// Surface, bind, windowstate, etc. are Permanent lifetime
	assert.equal(
		getSakuraTokenLifetime({ type: "surface", value: 0 }),
		"Permanent",
	);
	assert.equal(getSakuraTokenLifetime({ type: "bind" }), "Permanent");
	assert.equal(
		getSakuraTokenLifetime({ type: "command", command: "bind" }),
		"Permanent",
	);
	assert.equal(
		getSakuraTokenLifetime({ type: "command", command: "windowstate" }),
		"Permanent",
	);
	assert.equal(
		getSakuraTokenLifetime({ type: "command", command: "setwallpaper" }),
		"Permanent",
	);
	assert.equal(
		getSakuraTokenLifetime({ type: "command", command: "setproxy" }),
		"Permanent",
	);
	assert.equal(
		getSakuraTokenLifetime({ type: "command", command: "sethttptimeout" }),
		"Permanent",
	);

	// Regular commands and text are Script lifetime
	assert.equal(getSakuraTokenLifetime({ type: "char", value: "a" }), "Script");
	assert.equal(getSakuraTokenLifetime({ type: "wait", value: 100 }), "Script");
	assert.equal(
		getSakuraTokenLifetime({ type: "command", command: "raise" }),
		"Script",
	);
	assert.equal(getSakuraTokenLifetime(null), "Script");
	assert.equal(getSakuraTokenLifetime("invalid"), "Script");
});

test("collectAstTokens and collectAstTokensByLifetime extract tokens by lifetime classification", () => {
	const script =
		"\\0\\s[0]\\f[bold,1]Hello\\w5\\![bind,cat_ears]\\1\\s[10]\\f[default]World";
	const tokens = parseSakuraScript(script);
	const ast = tokensToAst(tokens);

	const allTokens = collectAstTokens(ast);
	assert.ok(allTokens.length > 5);

	const scopeLifetimeTokens = collectAstTokensByLifetime(ast, "Scope");
	assert.equal(scopeLifetimeTokens.length, 2); // 2 font tokens

	const permLifetimeTokens = collectAstTokensByLifetime(ast, "Permanent");
	// surfaces (0, 10) + bind command
	assert.ok(permLifetimeTokens.length >= 2);
});

test("filterAstByScope handles non-root scope nodes and unclosed/missing scopes", () => {
	const script = "\\0\\s[0]Sakura text\\1\\s[10]Kero text";
	const tokens = parseSakuraScript(script);
	const ast = tokensToAst(tokens);

	// Filtering root AST for scope 0
	const scope0Ast = filterAstByScope(ast, 0);
	assert.equal(scope0Ast.nodeType, "root");
	assert.equal(scope0Ast.children?.length, 1);
	assert.equal(scope0Ast.children?.[0].scope, 0);

	// Direct scope node filtering
	const singleScopeNode: SakuraAstNode = {
		nodeType: "scope",
		scope: 1,
		children: [{ nodeType: "command", token: { type: "char", value: "x" } }],
	};
	const matchedDirect = filterAstByScope(singleScopeNode, 1);
	assert.equal(matchedDirect.nodeType, "scope");
	assert.equal(matchedDirect.children?.length, 1);

	const unmatchedDirect = filterAstByScope(singleScopeNode, 0);
	assert.equal(unmatchedDirect.nodeType, "root");
	assert.equal(unmatchedDirect.children?.length, 0);
});

test("stripWaitsFromAst cleans all types of waits recursively", () => {
	const ast: SakuraAstNode = {
		nodeType: "root",
		children: [
			{
				nodeType: "scope",
				scope: 0,
				children: [
					{ nodeType: "command", token: { type: "wait", value: 100 } },
					{ nodeType: "command", token: { type: "wait_audio" } },
					{ nodeType: "command", token: { type: "wait_anim" } },
					{ nodeType: "command", token: { type: "char", value: "Z" } },
				],
			},
		],
	};

	const cleaned = stripWaitsFromAst(ast);
	const scope0 = cleaned.children?.[0];
	assert.ok(scope0);
	assert.equal(scope0?.children?.length, 1);
	assert.equal((scope0?.children?.[0].token as SakuraToken)?.value, "Z");
});

test("mapAstCommands recursively transforms commands without mutating original AST", () => {
	const ast: SakuraAstNode = {
		nodeType: "root",
		children: [
			{
				nodeType: "scope",
				scope: 0,
				children: [
					{ nodeType: "command", token: { type: "char", value: "a" } },
					{ nodeType: "command", token: { type: "char", value: "b" } },
				],
			},
		],
	};

	const transformed = mapAstCommands(ast, (tok) => {
		const token = tok as SakuraToken;
		if (token.type === "char") {
			return { ...token, value: String(token.value).toUpperCase() };
		}
		return token;
	});

	// Original AST preserved
	const origScope = ast.children?.[0];
	assert.ok(origScope?.children);
	assert.equal((origScope.children[0].token as SakuraToken).value, "a");

	// Transformed AST changed
	const transScope = transformed.children?.[0];
	assert.ok(transScope?.children);
	assert.equal((transScope.children[0].token as SakuraToken).value, "A");
	assert.equal((transScope.children[1].token as SakuraToken).value, "B");
});

test("getAstDiagnostics handles empty or deep ASTs accurately", () => {
	const emptyAst: SakuraAstNode = {
		nodeType: "root",
		children: [],
	};
	const diagEmpty = getAstDiagnostics(emptyAst);
	assert.equal(diagEmpty.nodeCount, 1);
	assert.equal(diagEmpty.maxDepth, 1);
	assert.equal(diagEmpty.commandCount, 0);

	const deepAst: SakuraAstNode = {
		nodeType: "root",
		children: [
			{
				nodeType: "scope",
				scope: 0,
				children: [
					{
						nodeType: "anchor",
						id: "anc1",
						args: ["anc1"],
						children: [
							{
								nodeType: "choice",
								id: "ch1",
								text: "Choice1",
								children: [
									{
										nodeType: "command",
										token: { type: "char", value: "!" },
									},
								],
							},
						],
					},
				],
			},
		],
	};

	const diagDeep = getAstDiagnostics(deepAst);
	assert.equal(diagDeep.nodeCount, 5);
	assert.equal(diagDeep.maxDepth, 5);
	assert.equal(diagDeep.scopeCounts[0], 1);
	assert.equal(diagDeep.anchorCount, 1);
	assert.equal(diagDeep.choiceCount, 1);
	assert.equal(diagDeep.commandCount, 1);
});
