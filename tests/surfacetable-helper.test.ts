import { describe, expect, it } from "vitest";
import {
	getSurfaceDisplayName,
	getVisibleSurfaceTableGroups,
	type RawShellManifest,
	type RawSurfaceTable,
} from "../ui/ts/surface/shell-manifest";

describe("surfacetable helpers", () => {
	const sampleTable: RawSurfaceTable = {
		charset: "UTF-8",
		version: 1,
		groups: [
			{
				name: "基本",
				entries: [
					{ surface_id: 0, name: "通常" },
					{ surface_id: 1, name: "照れ" },
				],
			},
			{
				name: "__disabled",
				entries: [{ surface_id: 99, name: "非表示" }],
			},
			{
				name: "感情",
				entries: [{ surface_id: 2, name: "" }],
			},
		],
	};

	it("getVisibleSurfaceTableGroups excludes __disabled and handles nullish", () => {
		expect(getVisibleSurfaceTableGroups(null)).toEqual([]);
		expect(getVisibleSurfaceTableGroups(undefined)).toEqual([]);
		const visible = getVisibleSurfaceTableGroups(sampleTable);
		expect(visible.map((g) => g.name)).toEqual(["基本", "感情"]);
	});

	it("getSurfaceDisplayName resolves visible entries and ignores __disabled or empty names", () => {
		const manifest: RawShellManifest = {
			name: "master",
			surface_table: sampleTable,
		};
		expect(getSurfaceDisplayName(null, 0)).toBeNull();
		expect(getSurfaceDisplayName(manifest, 0)).toBe("通常");
		expect(getSurfaceDisplayName(manifest, 1)).toBe("照れ");
		expect(getSurfaceDisplayName(manifest, 99)).toBeNull();
		expect(getSurfaceDisplayName(manifest, 2)).toBeNull();
		expect(getSurfaceDisplayName(manifest, 404)).toBeNull();
	});
});
