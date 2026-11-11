import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis;
globalThis.location = { search: "?scope=0" };
globalThis.window.location = globalThis.location;
globalThis.document = {
	body: { addEventListener() {} },
	addEventListener() {},
	querySelectorAll() {
		return [];
	},
	getElementById() {
		return null;
	},
};

import { docTemplates } from "../ui/ts/ui/templates/doc-templates.js";
import { ghostTemplates } from "../ui/ts/ui/templates/ghost-templates.js";
import { settingsTemplates } from "../ui/ts/ui/templates/settings-templates.js";
import { systemTemplates } from "../ui/ts/ui/templates/system-templates.js";

test("ui templates test", () => {
	assert.ok(docTemplates);
	assert.ok(ghostTemplates);
	assert.ok(settingsTemplates);
	assert.ok(systemTemplates);
});
