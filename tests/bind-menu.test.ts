import assert from "node:assert/strict";
import { test } from "vitest";

const {
	bindOptionKey,
	bindGroupsForScope,
	bindOptionForScope,
	dressupKey,
	bindMenuData,
	dressupMenuPayload,
	seedDressupDefaults,
	bindAnimationIds,
	patternSurfaceFile,
} = await import("../ui/js/surface/bind-menu.js");

test("bind-menu functions cover options, grouping, payload, seeding, and surface formatting", () => {
	// 1. bindOptionKey
	assert.equal(bindOptionKey(0), "sakura.bindoption.group");
	assert.equal(bindOptionKey(1), "kero.bindoption.group");

	// 2. bindGroupsForScope & bindOptionForScope
	const manifest = {
		sakura_bind_groups: [
			{ number: 1, category: "Hat", part: "Ribbon", default: true },
		],
		kero_bind_groups: [],
		descript: {
			properties: {
				"sakura.bindoption.group": "Hat,multiple",
			},
		},
	};

	assert.equal(bindGroupsForScope(manifest, 0).length, 1);
	assert.equal(bindGroupsForScope(manifest, 1).length, 0);

	const option = bindOptionForScope(manifest, 0);
	assert.equal(option.category, "Hat");
	assert.equal(option.options[0], "multiple");

	// 3. dressupKey & bindMenuData
	const key = dressupKey(0, "Hat", "Ribbon");
	assert.equal(key, "0__Hat__Ribbon");

	const stateMap = new Map();
	stateMap.set(key, true);

	const menuData = bindMenuData(manifest, 0, stateMap);
	assert.equal(menuData.categories[0].category, "Hat");
	assert.equal(menuData.categories[0].parts[0].on, true);

	// 4. dressupMenuPayload
	const payload = dressupMenuPayload(manifest, { dressupState: stateMap });
	assert.ok(payload);
	assert.equal(payload.sakura.categories.length, 1);

	// Test null dressupMenuPayload
	assert.equal(dressupMenuPayload(null), null);
	assert.equal(
		dressupMenuPayload({ sakura_bind_groups: [], kero_bind_groups: [] }),
		null,
	);

	// 5. seedDressupDefaults
	const newStateMap = new Map();
	const seeded = seedDressupDefaults(manifest, newStateMap);
	assert.equal(seeded, 1);
	assert.equal(newStateMap.get("0__Hat__Ribbon"), true);

	// 6. bindAnimationIds & patternSurfaceFile
	const animIds = bindAnimationIds(10, [20]);
	assert.deepEqual(animIds, [20, 10]);

	assert.equal(patternSurfaceFile("100"), "surface100.png");
	assert.equal(patternSurfaceFile("-1"), null);
	assert.equal(patternSurfaceFile(null), null);
});
