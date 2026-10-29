import assert from "node:assert/strict";
import { test } from "vitest";

const { modalTemplates } = await import("../ui/js/ui/modal-templates.js");

test("modalTemplates exports aggregated HTML templates", () => {
	assert.ok(modalTemplates);
	assert.equal(typeof modalTemplates, "object");
	const keys = Object.keys(modalTemplates);
	assert.ok(keys.length > 0);
	for (const key of keys) {
		assert.equal(typeof modalTemplates[key], "string");
		assert.ok(modalTemplates[key].length > 0);
	}
});
