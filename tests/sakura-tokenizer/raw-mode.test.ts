import assert from "node:assert/strict";
import { test } from "vitest";

const { parseSakuraScript } = await import(
	"../../ui/js/ghost/sakura-tokenizer.js"
);

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
