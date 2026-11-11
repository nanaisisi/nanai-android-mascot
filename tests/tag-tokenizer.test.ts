import assert from "node:assert/strict";
import { test } from "vitest";

import {
	skipUnknownTag,
	tokenizeDisplayTag,
	tokenizeEscapeTag,
	tokenizeInteractiveTag,
	tokenizeScopeSurfaceTag,
	tokenizeTag,
	tokenizeTextFormatTag,
	tokenizeWaitTag,
} from "../ui/ts/ghost/parser/tag-tokenizer.js";

test("tokenizeEscapeTag handles escaped backslash and percent", () => {
	const script1 = "\\\\hello";
	const res1 = tokenizeEscapeTag(script1, 1, script1.length);
	assert.ok(res1);
	assert.deepEqual(res1.tokens, [{ type: "char", value: "\\" }]);
	assert.equal(res1.nextIdx, 2);

	const script2 = "\\%world";
	const res2 = tokenizeEscapeTag(script2, 1, script2.length);
	assert.ok(res2);
	assert.deepEqual(res2.tokens, [{ type: "char", value: "%" }]);
	assert.equal(res2.nextIdx, 2);

	const script3 = "\\0test";
	const res3 = tokenizeEscapeTag(script3, 1, script3.length);
	assert.equal(res3, null);

	const resOut = tokenizeEscapeTag("\\", 1, 1);
	assert.equal(resOut, null);
});

test("tokenizeScopeSurfaceTag handles scopes, surfaces, and animations", () => {
	// \0 and \h
	const res0 = tokenizeScopeSurfaceTag("\\0", 1, 2);
	assert.deepEqual(res0?.tokens, [{ type: "scope", value: 0 }]);
	assert.equal(res0?.nextIdx, 2);

	const resH = tokenizeScopeSurfaceTag("\\h", 1, 2);
	assert.deepEqual(resH?.tokens, [{ type: "scope", value: 0 }]);

	// \1 and \u
	const res1 = tokenizeScopeSurfaceTag("\\1", 1, 2);
	assert.deepEqual(res1?.tokens, [{ type: "scope", value: 1 }]);

	const resU = tokenizeScopeSurfaceTag("\\u", 1, 2);
	assert.deepEqual(resU?.tokens, [{ type: "scope", value: 1 }]);

	// \p[2], \p5
	const resPBracket = tokenizeScopeSurfaceTag("\\p[2]", 1, 5);
	assert.deepEqual(resPBracket?.tokens, [{ type: "scope", value: 2 }]);
	assert.equal(resPBracket?.nextIdx, 5);

	const resPDigit = tokenizeScopeSurfaceTag("\\p5", 1, 3);
	assert.deepEqual(resPDigit?.tokens, [{ type: "scope", value: 5 }]);
	assert.equal(resPDigit?.nextIdx, 3);

	// \s[10], \s0, \s[-1]
	const resSBracket = tokenizeScopeSurfaceTag("\\s[10]", 1, 6);
	assert.deepEqual(resSBracket?.tokens, [{ type: "surface", value: 10 }]);

	const resSMinus = tokenizeScopeSurfaceTag("\\s[-1]", 1, 6);
	assert.deepEqual(resSMinus?.tokens, [{ type: "surface", value: -1 }]);

	const resSDigit = tokenizeScopeSurfaceTag("\\s3", 1, 3);
	assert.deepEqual(resSDigit?.tokens, [{ type: "surface", value: 3 }]);

	// \i[1,wait], \i[smile], \i4
	const resIWait = tokenizeScopeSurfaceTag("\\i[1,wait]", 1, 10);
	assert.deepEqual(resIWait?.tokens, [
		{ type: "animation", animId: 1, wait: true },
	]);

	const resIName = tokenizeScopeSurfaceTag("\\i[smile]", 1, 9);
	assert.deepEqual(resIName?.tokens, [
		{ type: "animation", animId: "smile", wait: false },
	]);

	const resIDigit = tokenizeScopeSurfaceTag("\\i7", 1, 3);
	assert.deepEqual(resIDigit?.tokens, [
		{ type: "animation", animId: 7, wait: false },
	]);

	// Non-matching
	assert.equal(tokenizeScopeSurfaceTag("\\w", 1, 2), null);
});

test("tokenizeWaitTag handles weights, millisecond waits, animation waits, timeouts, and halt/end", () => {
	// \w5
	const resW = tokenizeWaitTag("\\w5", 1, 3);
	assert.deepEqual(resW?.tokens, [{ type: "wait", value: 250 }]);

	// \_w[200]
	const resMw = tokenizeWaitTag("\\_w[200]", 1, 8);
	assert.deepEqual(resMw?.tokens, [{ type: "wait", value: 200 }]);

	// \__w[animation,10]
	const resAnimWait = tokenizeWaitTag("\\__w[animation,10]", 1, 18);
	assert.deepEqual(resAnimWait?.tokens, [
		{ type: "wait_animation", animId: 10 },
	]);

	// \t, \-, \e
	const resT = tokenizeWaitTag("\\t", 1, 2);
	assert.deepEqual(resT?.tokens, [{ type: "timeout" }]);

	const resHalt = tokenizeWaitTag("\\-", 1, 2);
	assert.deepEqual(resHalt?.tokens, [{ type: "halt" }]);

	const resEnd = tokenizeWaitTag("\\e", 1, 2);
	assert.deepEqual(resEnd?.tokens, [{ type: "end" }]);
	assert.equal(resEnd?.haltParsing, true);

	// Non-matching
	assert.equal(tokenizeWaitTag("\\s", 1, 2), null);
});

test("tokenizeTextFormatTag handles newlines, clear, pause, quick mode, and font", () => {
	// \n, \n[half]
	const resN = tokenizeTextFormatTag("\\n", 1, 2);
	assert.deepEqual(resN?.tokens, [{ type: "newline", half: false }]);

	const resNHalf = tokenizeTextFormatTag("\\n[half]", 1, 8);
	assert.deepEqual(resNHalf?.tokens, [{ type: "newline", half: true }]);

	// \c, \c[char,3], \c[line,2]
	const resC = tokenizeTextFormatTag("\\c", 1, 2);
	assert.deepEqual(resC?.tokens, [{ type: "clear" }]);

	const resCChar = tokenizeTextFormatTag("\\c[char,3]", 1, 10);
	assert.deepEqual(resCChar?.tokens, [
		{ type: "clear", mode: "char", count: 3 },
	]);

	// \x, \x[noclear]
	const resX = tokenizeTextFormatTag("\\x", 1, 2);
	assert.deepEqual(resX?.tokens, [{ type: "pause" }]);

	const resXNoClear = tokenizeTextFormatTag("\\x[noclear]", 1, 11);
	assert.deepEqual(resXNoClear?.tokens, [{ type: "pause", noClear: true }]);

	// \_q, \_q[1], \_q[0]
	const resQ = tokenizeTextFormatTag("\\_q", 1, 3);
	assert.deepEqual(resQ?.tokens, [{ type: "quick_toggle", value: undefined }]);

	const resQ1 = tokenizeTextFormatTag("\\_q[1]", 1, 6);
	assert.deepEqual(resQ1?.tokens, [{ type: "quick_toggle", value: true }]);

	const resQ0 = tokenizeTextFormatTag("\\_q[0]", 1, 6);
	assert.deepEqual(resQ0?.tokens, [{ type: "quick_toggle", value: false }]);

	// \f[bold,1], \f[default]
	const resF = tokenizeTextFormatTag("\\f[bold,1]", 1, 10);
	assert.deepEqual(resF?.tokens, [{ type: "font", tag: "bold", param: "1" }]);

	// Non-matching
	assert.equal(tokenizeTextFormatTag("\\b", 1, 2), null);
});

test("tokenizeInteractiveTag handles anchor, command, message, and choice", () => {
	// \_a[anchorId,arg1], \_a
	const resAnchorBegin = tokenizeInteractiveTag("\\_a[anchorId,arg1]", 1, 18);
	assert.deepEqual(resAnchorBegin?.tokens, [
		{ type: "anchor_begin", id: "anchorId", args: ["anchorId", "arg1"] },
	]);

	const resAnchorEnd = tokenizeInteractiveTag("\\_a", 1, 3);
	assert.deepEqual(resAnchorEnd?.tokens, [{ type: "anchor_end" }]);

	// \![open,box]
	const resCmd = tokenizeInteractiveTag("\\![open,box]", 1, 12);
	assert.deepEqual(resCmd?.tokens, [
		{ type: "command", args: ["open", "box"] },
	]);

	// \m[WM_USER,1,2]
	const resMsg = tokenizeInteractiveTag("\\m[WM_USER,1,2]", 1, 15);
	assert.deepEqual(resMsg?.tokens, [
		{ type: "post_message", umsg: "WM_USER", wparam: "1", lparam: "2" },
	]);

	// \q[Option,opt1] and \q[temp,Option,opt1]
	const resChoice = tokenizeInteractiveTag("\\q[Option,opt1]", 1, 15);
	assert.deepEqual(resChoice?.tokens, [
		{ type: "choice", text: "Option", id: "opt1", args: [] },
	]);

	const resTempChoice = tokenizeInteractiveTag("\\q[temp,Option,opt1]", 1, 20);
	assert.deepEqual(resTempChoice?.tokens, [
		{ type: "choice", text: "Option", id: "opt1", args: [] },
	]);

	// Non-matching
	assert.equal(tokenizeInteractiveTag("\\z", 1, 2), null);
});

test("tokenizeDisplayTag handles coordinate offset, sync toggle, and balloon selection", () => {
	// \_l[10,20]
	const resOffset = tokenizeDisplayTag("\\_l[10,20]", 1, 10);
	assert.deepEqual(resOffset?.tokens, [{ type: "offset", x: "10", y: "20" }]);

	// \_s, \_s[1], \_s[0]
	const resSync = tokenizeDisplayTag("\\_s", 1, 3);
	assert.deepEqual(resSync?.tokens, [
		{ type: "sync_toggle", value: undefined },
	]);

	const resSync1 = tokenizeDisplayTag("\\_s[1]", 1, 6);
	assert.deepEqual(resSync1?.tokens, [
		{ type: "sync_toggle", value: true, scopes: [1] },
	]);

	// \b[0], \b2
	const resBalloonBracket = tokenizeDisplayTag("\\b[0]", 1, 5);
	assert.deepEqual(resBalloonBracket?.tokens, [{ type: "balloon", value: 0 }]);

	const resBalloonDigit = tokenizeDisplayTag("\\b3", 1, 3);
	assert.deepEqual(resBalloonDigit?.tokens, [{ type: "balloon", value: 3 }]);

	// Non-matching
	assert.equal(tokenizeDisplayTag("\\w", 1, 2), null);
});

test("skipUnknownTag skips unrecognized tags and bracketed arguments", () => {
	const script = "\\_unknown[arg1,arg2]rest";
	const res = skipUnknownTag(script, 1, script.length);
	assert.deepEqual(res.tokens, []);
	assert.equal(res.nextIdx, 20);
	assert.equal(script.slice(res.nextIdx), "rest");
});

test("tokenizeTag facade coordinates all submodules seamlessly", () => {
	const script = "\\0\\s[0]Hello\\_w[100]\\e";
	const t0 = tokenizeTag(script, 0, script.length);
	assert.deepEqual(t0.tokens, [{ type: "scope", value: 0 }]);
	assert.equal(t0.nextIdx, 2);

	const tS = tokenizeTag(script, 2, script.length);
	assert.deepEqual(tS.tokens, [{ type: "surface", value: 0 }]);
	assert.equal(tS.nextIdx, 7);

	const tW = tokenizeTag(script, 12, script.length);
	assert.deepEqual(tW.tokens, [{ type: "wait", value: 100 }]);
	assert.equal(tW.nextIdx, 20);

	const tE = tokenizeTag(script, 20, script.length);
	assert.deepEqual(tE.tokens, [{ type: "end" }]);
	assert.equal(tE.haltParsing, true);

	// Boundary condition: index at end of script
	const resEmpty = tokenizeTag("\\", 0, 1);
	assert.deepEqual(resEmpty.tokens, []);
	assert.equal(resEmpty.nextIdx, 1);
});
