import assert from "node:assert/strict";
import { test } from "vitest";

const { parseSakuraScript } = await import(
	"../../ui/ts/ghost/sakura-tokenizer.js"
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
		// Cycle 2 SSP extensions & deeply nested malformed tokens
		"\\__q[id,arg1,arg2]Nested\\__q",
		"\\_?quick_mode\\_?",
		"\\![open,teachbox,teachbox,--text=\\\\0\\\\s[0]Injected\\\\e]",
		"\\![open,communicatebox,--reference=ref1,ref2,ref3,--timeout=NaN]",
		"\\_l[100,100]\\_l[-50,-50]\\_l[@+10,@-10]\\_l[invalid,syntax]",
		"\\f[color,default]\\f[height,+5]\\f[name,Courier New]\\f[strike,1]\\f[underline,0]",
		"\\![anim,pause,not_a_number]\\![anim,resume,-1]",
		"\\b[-1]\\b[999999]\\b[invalid]",
		"\\s[-1]\\s[99999]\\s[]\\s[non_number]",
		"\\![bind,category,part,true]\\![bind-noevent,category,part,0]",
		"\\![set,choicetimeout,-500]\\![set,balloontimeout,invalid]",
		// Cycle 3 & 4: named animations, \__w wait_animation, escapes & quotes
		"\\i[smile]\\i[talk_01,wait]\\i[invalid/char]\\i[]\\i[999999999999999999999999]",
		"\\__w[animation,smile]\\__w[animation,]\\__w[animation,-1]\\__w[invalid,tag]\\__w[]",
		'\\![anim,offset,smile,NaN,Infinity]\\![anim,offset,"smile with spaces",10,-20]',
		'\\![anim,stop,"anim,quoted,commas"]\\![anim,clear,]',
		'\\q["Choice, with comma",id_1,"arg1,with,comma","arg2"]',
		'\\![open,passwordinput,id_pass,--title="Password, Required"]',
		'\\![open,textareabox,id_text,--text="Line1\\1Line2\\1Line3"]',
		"\\![open,sliderinput,id_slider,--min=-100,--max=100,--default=0]",
		"\\![close,inputbox,__SYSTEM_ALL_INPUT__]\\![close,dialog,__SYSTEM_ALL_DIALOG__]",
		"\\![set,balloonwait,200%]\\![set,balloonwait,50ms]\\![set,balloonwait,invalid]",
		"\\![quicksection,true]\\![quicksection,0]",
		"\\0\\_sMirror dual output with \\i[test]\\_s\\1\\e",
		"\\x[noclear]\\x[invalid]\\x[]",
		"\\_q[1]\\_q[0]\\_q[invalid]",
		"\\f[color,default]\\f[height,150%]",
		'\\0\\s[0]\\]\\]\\]\\"\\]"\\e',
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
