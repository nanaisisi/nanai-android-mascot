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

test("parseSakuraScript tokenizes \\m[umsg,wparam,lparam] post_message", () => {
	const script = "\\0\\m[WM_CLOSE,0,0]Text";
	const tokens = parseSakuraScript(script);
	const postMsg = tokens.find((t) => t.type === "post_message");
	assert.ok(postMsg);
	assert.equal(postMsg.umsg, "WM_CLOSE");
	assert.equal(postMsg.wparam, "0");
	assert.equal(postMsg.lparam, "0");
});

test("AST traversal functions and lifetime filtering", async () => {
	const {
		traverseAst,
		collectAstTokens,
		collectAstTokensByLifetime,
		getSakuraTokenLifetime,
	} = await import("../ui/js/ghost/parser/ast.js");

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

test("parseSakuraScript handles raw mode (\\_?, \\_!) and auto-wrap disable (\\_n)", () => {
	const script = "\\_?\\0\\s[0]\\nRawText\\_?\\_nLineWithoutAutoWrap\\_n";
	const tokens = parseSakuraScript(script);

	// Raw toggle begins
	const rawBegins = tokens.filter(
		(t) => t.type === "raw_toggle" && t.active === true,
	);
	assert.equal(rawBegins.length, 1);
	assert.equal(rawBegins[0].delimiter, "_?");

	// Content inside \_? is captured as literal characters
	const insideChars = tokens
		.filter((t) => t.type === "char")
		.map((t) => t.value)
		.join("");
	assert.ok(insideChars.includes("\\0\\s[0]\\nRawText"));

	// Raw toggle ends
	const rawEnds = tokens.filter(
		(t) => t.type === "raw_toggle" && t.active === false,
	);
	assert.equal(rawEnds.length, 1);

	// No-autowrap tokens (\_n)
	const noAutoWraps = tokens.filter((t) => t.type === "no_autowrap");
	assert.equal(noAutoWraps.length, 2);
});

test("rustCommandsToTokens maps Cycle 5 commands correctly", async () => {
	const { rustCommandsToTokens } = await import(
		"../ui/js/ghost/sakura-rust-bridge.js"
	);

	const commands = [
		{ type: "NewLineNoPause" },
		{ type: "AutoPause" },
		{
			type: "PostMessage",
			payload: { umsg: "1024", wparam: "1", lparam: "2" },
		},
		{ type: "Star" },
		{ type: "Marker" },
		{ type: "AudioWait" },
		{ type: "Jump", payload: "OnOther" },
		{ type: "Plus" },
		{
			type: "PluginEvent",
			payload: {
				plugin: "plug1",
				event: "OnTest",
				references: ["r0"],
				is_notify: false,
			},
		},
		{ type: "NoUserBreak", payload: true },
		{ type: "Voice", payload: "voice.wav" },
		{ type: "Midi", payload: "1234" },
		{ type: "ModeChange", payload: { mode: "passive", active: true } },
		{ type: "LockBalloonRepaint", payload: true },
		{
			type: "BalloonSetting",
			payload: { key: "align", value: "left", extra: [] },
		},
		{
			type: "ScheduleAdd",
			payload: {
				date: "2026-11-02",
				time: "12:00",
				title: "Meeting",
				memo: "Agenda",
			},
		},
	];

	const tokens = rustCommandsToTokens(commands);
	assert.equal(tokens.length, 16);
	assert.equal(tokens[0].type, "no_autowrap");
	assert.equal(tokens[1].type, "auto_pause");
	assert.equal(tokens[2].type, "post_message");
	assert.equal(tokens[2].umsg, "1024");
	assert.equal(tokens[3].type, "command");
	assert.equal(tokens[3].command, "marker");
	assert.equal(tokens[5].type, "wait_audio");
	assert.equal(tokens[6].command, "jump");
	assert.equal(tokens[7].type, "plus");
	assert.equal(tokens[8].command, "raiseplugin");
	assert.equal(tokens[9].type, "no_user_break");
	assert.equal(tokens[10].type, "voice");
	assert.equal(tokens[11].type, "midi");
	assert.equal(tokens[12].command, "entermode");
	assert.equal(tokens[13].command, "lockrepaint");
	assert.equal(tokens[14].command, "setballoon");
	assert.equal(tokens[15].command, "schedule-add");
});
