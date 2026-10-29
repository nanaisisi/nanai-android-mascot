import assert from "node:assert/strict";
import { test } from "vitest";

import {
	parseInterval,
	resolvePatternWait,
} from "../ui/js/surface/animation-parser.js";
import { BalloonDragManager } from "../ui/js/surface/balloon-drag.js";
import { bindMenuData } from "../ui/js/surface/bind-menu.js";

test("surface animation-parser & bind-menu test", () => {
	const wait = resolvePatternWait("10-20");
	assert.ok(wait >= 10 && wait <= 20);

	const interval = parseInterval("periodic,5");
	assert.equal(interval.param, 5);

	const data = bindMenuData({ bind: [] }, 0);
	assert.deepEqual(data, { categories: [] });
});

test("balloon-drag test", () => {
	const drag = new BalloonDragManager({});
	assert.ok(drag);
});
