import assert from "node:assert/strict";
import { test } from "vitest";

const { parseSakuraScript } = await import(
	"../ui/js/ghost/sakura-tokenizer.js"
);
const { rustCommandsToTokens } = await import(
	"../ui/js/ghost/sakura-rust-bridge.js"
);
const { parseSurfacesTxt, expandSurfaceRange } = await import(
	"../ui/js/surface/surface-parser.js"
);

test("SakuraScript parser fuzzing and edge cases", () => {
	const edgeCases = [
		"",
		"\\",
		"\\\\",
		"\\\\\\\\",
		"\\0\\1\\p[2]\\p[-1]\\p[999]",
		"\\s[\\w[\\e",
		"\\q[,]",
		"\\q[OnlyText]",
		"\\q[Label,id,arg1,arg2,arg3]",
		"\\_a[]\\_a",
		"\\_a[id,extra]\\_a",
		"\\_q\\_q\\_q",
		"\\![open,inputbox]",
		"\\![open,inputbox,,,,,]",
		"\\![unknown,tag,with,lots,of,commas,,,,,,]",
		"\\![",
		"\\![]",
		"\\b[abc]",
		"\\_b[some/path,inline,10,20]",
		"\\_b[]",
		"\\_w[not_a_number]",
		"\\_w[-50]",
		"\\_w[999999999]",
		"\\f[color,not-a-color]",
		"\\f[height,not-a-size]",
		"\\f[unknown,param]",
		"\\c\\c[char,5]\\c[line,2]\\c[invalid,mode]",
		"\\_l[10,20]\\_l[@10,@-20]\\_l[invalid]",
		"\\x\\t\\e\\-",
		"\u0000\u0001\u0002\u001b[31mANSI\u001b[0m",
		"\\0".repeat(500),
		`\\_s${"\\0A".repeat(100)}\\_s`,
		"\\%\\%\\\\%\\%[nested\\tags]",
		"Mixed multibyte 日本語 𠮷野家 🍣🍺 \r\n\t",
	];

	for (const input of edgeCases) {
		const tokens = parseSakuraScript(input);
		assert.ok(Array.isArray(tokens), `Expected array for input: ${input}`);
	}

	// Randomized fuzzing strings
	const seedChars = [
		"\\",
		"0",
		"1",
		"s",
		"[",
		"]",
		",",
		"q",
		"!",
		"_",
		"w",
		"e",
		"c",
		"f",
		"b",
		"\\",
		"%",
		" ",
		"\n",
		"a",
		"b",
		"x",
		"@",
		"-",
	];
	let pseudoRand = 123456789;
	const rng = () => {
		pseudoRand = (pseudoRand * 1103515245 + 12345) & 0x7fffffff;
		return pseudoRand / 0x7fffffff;
	};

	for (let i = 0; i < 100; i++) {
		const len = Math.floor(rng() * 40) + 1;
		let fuzzStr = "";
		for (let j = 0; j < len; j++) {
			fuzzStr += seedChars[Math.floor(rng() * seedChars.length)];
		}
		const tokens = parseSakuraScript(fuzzStr);
		assert.ok(Array.isArray(tokens));
	}
});

test("rustCommandsToTokens fuzzing and defensive mapping", () => {
	const malformedPayloads = [
		{ type: "Target", payload: null },
		{ type: "Target", payload: -1 },
		{ type: "Surface", payload: "not-a-number" },
		{ type: "Wait", payload: undefined },
		{ type: "NewLine", payload: null },
		{ type: "ClearArg", payload: { arg: null } },
		{ type: "ClearArg", payload: { arg: "invalid" } },
		{ type: "ClearArg", payload: { arg: "char,not_a_num" } },
		{ type: "Choice", payload: null },
		{ type: "Anchor", payload: null },
		{ type: "Raise", payload: null },
		{ type: "Bind", payload: null },
		{ type: "InlineBitmap", payload: null },
		{ type: "Animation", payload: null },
		{ type: "Offset", payload: null },
		{ type: "Font", payload: null },
		{ type: "WindowState", payload: null },
		{ type: "Change", payload: null },
		{ type: "Call", payload: null },
		{ type: "SetWallpaper", payload: null },
		{ type: "Cancel", payload: null },
		{ type: "Close", payload: null },
		{ type: "ArchiveExec", payload: null },
		{ type: "DownloadExec", payload: null },
		{ type: "UploadExec", payload: null },
		{ type: "MailCheckExec", payload: null },
		{ type: "MailExec", payload: null },
		{ type: "FileExec", payload: null },
		{ type: "SetHttpTimeout", payload: null },
		{ type: "SetProxy", payload: null },
		{ type: "OpenDialog", payload: null },
		{ type: "Text", payload: null },
		{ type: "NonExistentCommand", payload: {} },
	];

	const tokens = rustCommandsToTokens(malformedPayloads);
	assert.ok(Array.isArray(tokens));
	assert.ok(tokens.length > 0);
});

test("surfaces.txt parser fuzzing and edge cases", () => {
	const edgeCases = [
		"",
		"   \r\n\t  ",
		"surface0\n{\n}\n",
		"surface0,1,2\n{\n}\n",
		"surface.append0\n{\n}\n",
		"surface0\n{\ncollision,0,10,20,30,40,Head\n}\n",
		"surface0\n{\ncollision0,0,10,20,30,40,Head\n}\n",
		"surface0\n{\ncollision,not,numbers,at,all,Head\n}\n",
		"surface0\n{\nelement0,overlay,surface0001.png,10,20\n}\n",
		"surface0\n{\nelement0,unknownblend,surface0001.png,not_x,not_y\n}\n",
		"surface0\n{\nanimation0.interval,sometimes\nanimation0.pattern0,overlay,100,50,0,0\n}\n",
		"surface0\n{\nanimation0.interval,run\n}\n",
		"descript\n{\nversion,1\n}\n",
		"// comment line\n# another comment\nsurface0\n{\n// inline comment\n}\n",
		"surface0 {\n", // unclosed brace
		"}\n", // stray closing brace
		"surface0-5\n{\n}\n",
		"surface10-5\n{\n}\n", // reverse range
	];

	for (const txt of edgeCases) {
		const parsed = parseSurfacesTxt(txt);
		assert.ok(parsed && typeof parsed === "object");
	}

	// expandSurfaceRange edge cases (returns string[] array)
	assert.deepEqual(expandSurfaceRange(""), [""]);
	assert.deepEqual(expandSurfaceRange("0"), ["0"]);
	assert.deepEqual(expandSurfaceRange("0-3"), ["0", "1", "2", "3"]);
	assert.deepEqual(expandSurfaceRange("3-0"), []);
	assert.deepEqual(expandSurfaceRange("abc"), ["abc"]);
});
