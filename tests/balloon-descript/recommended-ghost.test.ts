/**
 * @file recommended-ghost.test.ts
 * @brief UKADOC recommended.ghost / recommended.ghost.path 検証用単体テスト
 */

import assert from "node:assert/strict";
import { describe, test } from "vitest";
import {
	applyAssetProperties,
	verifyRecommendedGhost,
} from "../../ui/ts/core/actions/balloon-descript/assets.js";

describe("recommended.ghost and recommended.ghost.path UKADOC verification", () => {
	test("returns isRecommended: true when no recommended ghost is specified", () => {
		const res = verifyRecommendedGhost({}, "Emily", "/ghost/emily");
		assert.equal(res.isRecommended, true);
		assert.equal(res.warning, undefined);
	});

	test("returns isRecommended: true when current ghost name matches recommended.ghost (case-insensitive)", () => {
		const res = verifyRecommendedGhost(
			{ "recommended.ghost": "Emily" },
			"emily",
			"/ghost/emily",
		);
		assert.equal(res.isRecommended, true);
	});

	test("returns isRecommended: false with warning when ghost name mismatches", () => {
		const res = verifyRecommendedGhost(
			{ "recommended.ghost": "Emily" },
			"Sakura",
			"/ghost/sakura",
		);
		assert.equal(res.isRecommended, false);
		assert.ok(res.warning);
		assert.ok(res.warning.includes("Emily"));
		assert.ok(res.warning.includes("Sakura"));
	});

	test("returns isRecommended: true when current ghost path matches recommended.ghost.path", () => {
		const res = verifyRecommendedGhost(
			{ "recommended.ghost.path": "ghost/master" },
			"Emily",
			"C:/app/ghost/master",
		);
		assert.equal(res.isRecommended, true);
	});

	test("returns isRecommended: false when ghost path mismatches", () => {
		const res = verifyRecommendedGhost(
			{ "recommended.ghost.path": "ghost/master" },
			"Emily",
			"C:/app/other/path",
		);
		assert.equal(res.isRecommended, false);
		assert.ok(res.warning);
	});

	test("applyAssetProperties sets CSS properties and warning for recommended ghost mismatch", () => {
		const vars: Record<string, string> = {};
		const mockRoot = {
			style: {
				setProperty: (k: string, v: string) => {
					vars[k] = v;
				},
				removeProperty: (k: string) => {
					delete vars[k];
				},
			},
		} as unknown as HTMLElement;

		const props = {
			"recommended.ghost": "Emily",
			"recommended.ghost.path": "ghost/emily",
		};

		// Matching instance
		const matchingInstance = {
			currentGhostName: "Emily",
			currentGhostPath: "/app/ghost/emily",
		};
		applyAssetProperties(mockRoot, props, matchingInstance as any);

		assert.equal(vars["--balloon-recommended-ghost"], "Emily");
		assert.equal(vars["--balloon-recommended-ghost-path"], "ghost/emily");
		assert.equal(vars["--balloon-recommended-warning"], undefined);

		// Mismatched instance
		const mismatchInstance = {
			currentGhostName: "Sakura",
			currentGhostPath: "/app/ghost/sakura",
		};
		applyAssetProperties(mockRoot, props, mismatchInstance as any);

		assert.ok(vars["--balloon-recommended-warning"]);
		assert.ok(vars["--balloon-recommended-warning"].includes("Emily"));
	});
});
