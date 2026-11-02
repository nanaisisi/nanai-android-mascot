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
		// Cycle 2 surfaces.txt extended edge cases (surfaces2 overlay patterns, collisionex)
		"surface.append0,1,2\n{\ncollisionex0,Head,rect,10,20,30,40\ncollisionex1,Bust,circle,50,50,20\ncollisionex2,Arm,ellipse,80,80,15,25\n}\n",
		"surface0\n{\nanimation0.interval,periodic,5\nanimation0.pattern0,replace,0,0,10,10\nanimation0.pattern1,add,1,50,15,15\nanimation0.pattern2,bind,2,100,0,0\n}\n",
		"charset,Shift_JIS\n// Multi-surface def\nsurface0,surface1\n{\n}\n",
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

test("TouchGestureRecognizer and mobile gesture event stream fuzzing", async () => {
	const {
		TouchGestureRecognizer,
		TouchGestureEvent,
		TOUCH_GESTURE_TYPES,
		getTouchDistance,
		getTouchAngle,
		getTouchCenter,
	} = await import("../ui/js/ui/touch/index.js");

	// 1. Math helper fuzzing with NaN, null, and extreme boundaries
	assert.equal(getTouchDistance(null, null), 0);
	assert.equal(getTouchDistance({ clientX: 0, clientY: 0 }, null), 0);
	// When clientX is NaN, Number.isFinite falls back to 0 (hypot(0 - 10, 10 - 10) = 10)
	assert.equal(
		getTouchDistance(
			{ clientX: NaN, clientY: 10 },
			{ clientX: 10, clientY: 10 },
		),
		10,
	);
	assert.equal(
		getTouchDistance(
			{ clientX: 1e6, clientY: 1e6 },
			{ clientX: 1e6 + 3, clientY: 1e6 + 4 },
		),
		5,
	);

	assert.equal(getTouchAngle(null, null), 0);
	assert.equal(getTouchAngle({ clientX: 0, clientY: 0 }, null), 0);
	assert.equal(
		getTouchAngle({ clientX: 10, clientY: 10 }, { clientX: 10, clientY: 10 }),
		0,
	);

	assert.deepEqual(getTouchCenter(null, null), { x: 0, y: 0 });
	assert.deepEqual(
		getTouchCenter({ clientX: 10, clientY: 20 }, { clientX: 30, clientY: 40 }),
		{ x: 20, y: 30 },
	);

	// 2. TouchGestureEvent defensive properties with malformed details
	const malformedEvent = new TouchGestureEvent("nas:touch:fuzz", {
		scale: -5,
		deltaX: NaN,
		tapCount: -1,
	});
	assert.ok(malformedEvent);
	assert.equal(malformedEvent.scale, -5);
	assert.equal(malformedEvent.tapCount, -1);

	// 3. Fuzzing TouchGestureRecognizer event streams
	const listeners = {};
	const mockContainer = {
		addEventListener(type, fn) {
			if (!listeners[type]) listeners[type] = [];
			listeners[type].push(fn);
		},
		removeEventListener(type, fn) {
			if (!listeners[type]) return;
			listeners[type] = listeners[type].filter((f) => f !== fn);
		},
		dispatchEvent(event, type) {
			const fns = listeners[type || event.type] || [];
			for (const fn of fns) fn(event);
		},
	};

	const recognizer = new TouchGestureRecognizer(mockContainer, {
		minScale: 0.2,
		maxScale: 4.0,
	});

	const capturedEvents = [];
	for (const type of Object.values(TOUCH_GESTURE_TYPES)) {
		recognizer.on(type, (e) => capturedEvents.push(e));
	}

	// Pseudo-random event generator for stream fuzzing
	let pseudoRand = 987654321;
	const rng = () => {
		pseudoRand = (pseudoRand * 1103515245 + 12345) & 0x7fffffff;
		return pseudoRand / 0x7fffffff;
	};

	const touchTypes = ["touchstart", "touchmove", "touchend", "touchcancel"];
	for (let i = 0; i < 80; i++) {
		const type = touchTypes[Math.floor(rng() * touchTypes.length)];
		const touchCount = Math.floor(rng() * 4); // 0 to 3 touches
		const touches = [];
		for (let t = 0; t < touchCount; t++) {
			touches.push({
				clientX: (rng() - 0.5) * 1000,
				clientY: (rng() - 0.5) * 1000,
			});
		}

		// Dispatch without throwing
		assert.doesNotThrow(() => {
			mockContainer.dispatchEvent(
				{
					type,
					touches,
					changedTouches: touches,
					preventDefault() {},
				},
				type,
			);
		});
	}

	// Recognizer clean reset
	recognizer.reset();
	assert.equal(recognizer._isPinching, false);
	assert.equal(recognizer._isDragging, false);
});
