import assert from "node:assert/strict";
import { test } from "vitest";

const { parseSakuraScript } = await import(
	"../../ui/ts/ghost/sakura-tokenizer.js"
);
const { parseSurfacesTxt } = await import(
	"../../ui/ts/surface/surface-parser.js"
);
const { surfaceCollisionMethods } = await import(
	"../../ui/ts/surface/surface-collision.js"
);

test("Parser Fuzzing Cycle 5: SakuraScript \\m[...] PostMessage fuzzing and malformed parameters", () => {
	const malformedScripts = [
		"\\m[]",
		"\\m[100]",
		"\\m[100,200]",
		"\\m[100,200,300,400,extra]",
		"\\m[not_a_number,abc,xyz]",
		"\\m[-1,-9999999999999999999999999,0]",
		"\\m[0x100,0b101,0o77]",
		"\\m[\n,\r,\t]",
		"\\m[  1024  ,  20  ,  30  ]",
		"\\m[\\w9,\\s[0],\\e]", // nested escape tags
		"\\m[", // unclosed bracket
		"\\m]", // unstarted bracket
		"\\m[[]]", // double brackets
		"\\m[\\\"quoted,arg\\\",\\'single,arg\\',3]",
	];

	for (const s of malformedScripts) {
		const tokens = parseSakuraScript(s);
		assert.ok(Array.isArray(tokens));
	}
});

test("Parser Fuzzing Cycle 5: surfaces.txt *.cursor and *.tooltips fuzzing and anomaly tolerance", () => {
	const malformedSurfaces = [
		// Empty and broken cursor blocks
		"sakura.cursor\n{\n}\n",
		"kero.cursor\n{\nmouseup\n}\n",
		"char2.cursor\n{\nmouseup,Head\n}\n",
		"*.cursor\n{\nmouseup,Head,system:hand,extra,param\n}\n",
		"cursor\n{\nunknown_event,Head,system:hand\n}\n",
		"sakura.cursor\n{\nmouseup,,system:hand\n,Head,system:finger\n}\n",
		// Empty and broken tooltip blocks
		"sakura.tooltips\n{\n}\n",
		"kero.tooltips\n{\nHead\n}\n",
		"*.tooltips\n{\nHead,Touch head here!,extra,values\n}\n",
		"tooltips\n{\n,Empty collision name\n}\n",
		"sakura.tooltips\n{\nHead,A\nHead,B\n}\n", // duplicate keys
		// Mixed corrupted blocks
		"sakura.cursor {\nmouseup,Head,pointer\n", // unclosed block
		"}\n", // stray closing brace
		"sakura.cursor\n{\nmouseup,Head,hand\n}\nsakura.tooltips\n{\nHead,Pat\n}\n",
	];

	for (const txt of malformedSurfaces) {
		const parsed = parseSurfacesTxt(txt);
		assert.ok(parsed && typeof parsed === "object");
	}
});

test("Parser Fuzzing Cycle 5: getCursorForCollision and getTooltipForCollision defensive queries", () => {
	const dummyManager = {
		cursors: {
			sakura: [
				{
					event: "mouseup",
					collision: "Head",
					cursor: "system:hand",
				},
				{
					event: "mousedown",
					collision: "Bust",
					cursor: "system:finger",
				},
			],
			"*": [
				{
					event: "mousehover",
					collision: "All",
					cursor: "system:arrow",
				},
			],
		},
		tooltips: {
			sakura: {
				Head: "Stroke Sakura's head",
			},
			kero: {
				Face: "Punch Kero's face",
			},
			"*": {
				Item: "Generic item",
			},
		},
		...surfaceCollisionMethods,
	};

	// 1. Cursor lookup normal and fallback to wildcard
	assert.equal(
		dummyManager.getCursorForCollision(0, "mouseup", "Head"),
		"system:hand",
	);
	assert.equal(
		dummyManager.getCursorForCollision("sakura", "MOUSEUP", "head"),
		"system:hand", // case-insensitive check
	);
	assert.equal(
		dummyManager.getCursorForCollision(1, "mousehover", "All"),
		"system:arrow", // fallback to '*'
	);

	// Edge queries
	assert.equal(dummyManager.getCursorForCollision(null, null, null), null);
	assert.equal(
		dummyManager.getCursorForCollision(0, "nonexistent", "Head"),
		null,
	);
	assert.equal(
		dummyManager.getCursorForCollision(0, "mouseup", "NonExistent"),
		null,
	);

	// When cursors is missing or empty
	const emptyManager = {
		cursors: null,
		tooltips: null,
		...surfaceCollisionMethods,
	};
	assert.equal(emptyManager.getCursorForCollision(0, "mouseup", "Head"), null);
	assert.equal(emptyManager.getTooltipForCollision(0, "Head"), null);

	// 2. Tooltip lookup normal and fallback to wildcard
	assert.equal(
		dummyManager.getTooltipForCollision(0, "Head"),
		"Stroke Sakura's head",
	);
	assert.equal(
		dummyManager.getTooltipForCollision("sakura", "head"),
		"Stroke Sakura's head", // case-insensitive
	);
	assert.equal(
		dummyManager.getTooltipForCollision(1, "Face"),
		"Punch Kero's face",
	);
	assert.equal(
		dummyManager.getTooltipForCollision(0, "Item"),
		"Generic item", // fallback to '*'
	);

	// Edge queries
	assert.equal(dummyManager.getTooltipForCollision(null, null), null);
	assert.equal(dummyManager.getTooltipForCollision(0, "NonExistent"), null);
});
