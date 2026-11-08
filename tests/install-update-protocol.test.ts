import { describe, expect, it } from "vitest";
import {
	buildInstallBeginArgs,
	buildInstallCompleteArgs,
	buildInstallCompleteExArgs,
	buildInstallFailureArgs,
	buildInstallMultiArgs,
	buildInstallRefuseArgs,
	buildInstallRerouteArgs,
	INSTALL_FAILURE_REASONS,
	INSTALL_IDENTIFIERS,
	isMultiResourceInstall,
	normalizeInstallType,
	parseInstallErrorReason,
} from "../ui/ts/core/actions/install-protocol";

describe("Slot-15 install-protocol - Cycle 8 Enhancements", () => {
	it("normalizes install types according to UKADOC specification", () => {
		expect(normalizeInstallType("GHOST")).toBe("ghost");
		expect(normalizeInstallType("Shell ")).toBe("shell");
		expect(normalizeInstallType("balloon")).toBe("balloon");
		expect(normalizeInstallType("calendar.skin")).toBe("calendar.skin");
		expect(normalizeInstallType("unknown_custom")).toBe("unknown_custom");
		expect(normalizeInstallType(null)).toBe("unknown");
	});

	it("identifies multi-resource installations correctly", () => {
		expect(isMultiResourceInstall([])).toBe(false);
		expect(isMultiResourceInstall([{ type: "ghost", name: "Nanai" }])).toBe(
			false,
		);
		expect(
			isMultiResourceInstall([
				{ type: "ghost", name: "Nanai" },
				{ type: "balloon", name: "Default" },
			]),
		).toBe(true);
	});

	it("builds multi-resource installation arguments", () => {
		const resources = [
			{ type: "ghost", name: "Nanai" },
			{ type: "shell", name: "Summer" },
		];
		const multiArgs = buildInstallMultiArgs(resources);
		expect(multiArgs.isMulti).toBe(true);
		expect(multiArgs.count).toBe("2");
		const sep = String.fromCharCode(1);
		expect(multiArgs.listText).toBe(`ghost${sep}Nanai\nshell${sep}Summer`);
	});

	it("builds single and ex installation arguments", () => {
		expect(buildInstallBeginArgs()).toEqual(["install"]);
		expect(buildInstallBeginArgs("custom_id")).toEqual(["custom_id"]);

		const completeArgs = buildInstallCompleteArgs(
			"ghost",
			"Nanai",
			"/path/to/ghost",
		);
		expect(completeArgs).toEqual(["ghost", "Nanai", "/path/to/ghost"]);

		const exArgs = buildInstallCompleteExArgs(
			"plugin",
			"WeatherPlugin",
			"/path/plugin",
			"\\![reload,plugin]",
		);
		expect(exArgs).toEqual([
			"plugin",
			"WeatherPlugin",
			"/path/plugin",
			"\\![reload,plugin]",
		]);

		const refuseArgs = buildInstallRefuseArgs("accept failed", "OtherGhost");
		expect(refuseArgs).toEqual(["accept failed", "OtherGhost"]);

		const rerouteArgs = buildInstallRerouteArgs(
			"MasterGhost",
			"shell",
			"Summer",
		);
		expect(rerouteArgs).toEqual(["MasterGhost", "shell", "Summer"]);
	});

	it("parses error reasons conforming to UKADOC failure reasons", () => {
		expect(parseInstallErrorReason("Zip-Slip detected")).toBe("invalid path");
		expect(parseInstallErrorReason("unsupported archive")).toBe("unsupported");
		expect(parseInstallErrorReason("user canceled")).toBe("artificial");
		expect(parseInstallErrorReason("crc error in lha")).toBe("unlha32 error");
		expect(parseInstallErrorReason("permission denied")).toBe("write error");
		expect(parseInstallErrorReason("unknown failure")).toBe("extraction");

		expect(buildInstallFailureArgs("traversal attempted")).toEqual([
			"invalid path",
		]);
	});

	it("verifies frozen specifications", () => {
		expect(INSTALL_IDENTIFIERS).toContain("ghost");
		expect(INSTALL_IDENTIFIERS).toContain("balloon");
		expect(INSTALL_FAILURE_REASONS).toContain("extraction");
		expect(INSTALL_FAILURE_REASONS).toContain("invalid path");
	});
});

describe("Slot-15 update-protocol - Cycle 9 Enhancements", () => {
	it("normalizes update reasons according to UKADOC specification", async () => {
		const { normalizeUpdateReason } = await import(
			"../ui/ts/core/actions/update-protocol"
		);
		expect(normalizeUpdateReason("MANUAL")).toBe("manual");
		expect(normalizeUpdateReason("Auto")).toBe("auto");
		expect(normalizeUpdateReason("script ")).toBe("script");
		expect(normalizeUpdateReason("unknown_mode")).toBe("manual");
		expect(normalizeUpdateReason(null)).toBe("manual");
		expect(normalizeUpdateReason(undefined)).toBe("manual");
	});

	it("identifies noupdate paths from developer_options patterns", async () => {
		const { isNoUpdatePath } = await import(
			"../ui/ts/core/actions/update-protocol"
		);
		const patterns = ["ghost/master/dev.log", "debug.tmp", "temp/test.txt"];

		expect(isNoUpdatePath("ghost/master/dev.log", patterns)).toBe(true);
		expect(isNoUpdatePath("ghost\\master\\dev.log", patterns)).toBe(true);
		expect(isNoUpdatePath("sub/dir/debug.tmp", patterns)).toBe(true);
		expect(isNoUpdatePath("ghost/master/aya.dll", patterns)).toBe(false);
		expect(isNoUpdatePath("", patterns)).toBe(false);
		expect(isNoUpdatePath("file.txt", [])).toBe(false);
	});
});

describe("Slot-15 update-protocol - Cycle 10 Enhancements", () => {
	it("calculates update progress percentage and bounds correctly", async () => {
		const { calculateUpdateProgress } = await import(
			"../ui/ts/core/actions/update-protocol"
		);

		expect(calculateUpdateProgress(0, 10)).toEqual({
			percent: 0,
			isComplete: false,
		});
		expect(calculateUpdateProgress(5, 10)).toEqual({
			percent: 50,
			isComplete: false,
		});
		expect(calculateUpdateProgress(10, 10)).toEqual({
			percent: 100,
			isComplete: true,
		});
		expect(calculateUpdateProgress(15, 10)).toEqual({
			percent: 100,
			isComplete: true,
		});
		// Edge cases: total 0 or negative
		expect(calculateUpdateProgress(0, 0)).toEqual({
			percent: 100,
			isComplete: true,
		});
		expect(calculateUpdateProgress(-1, 10)).toEqual({
			percent: 0,
			isComplete: false,
		});
	});

	it("builds update complete arguments conforming to UKADOC specification", async () => {
		const { buildUpdateCompleteArgs } = await import(
			"../ui/ts/core/actions/update-protocol"
		);

		expect(
			buildUpdateCompleteArgs("changed", ["file1.txt", "file2.txt"]),
		).toEqual(["changed", "2", "", "ghost", "manual"]);
		expect(buildUpdateCompleteArgs("none", [])).toEqual([
			"none",
			"0",
			"",
			"ghost",
			"manual",
		]);
		expect(buildUpdateCompleteArgs("unknown_val", [], "shell", "auto")).toEqual(
			["none", "0", "", "shell", "auto"],
		);
	});

	it("builds update failure arguments conforming to UKADOC specification", async () => {
		const { buildUpdateFailureArgs } = await import(
			"../ui/ts/core/actions/update-protocol"
		);

		expect(
			buildUpdateFailureArgs("404 Not Found", "ghost/master/aya.dll"),
		).toEqual(["404", "ghost/master/aya.dll", "", "ghost", "manual"]);
		expect(buildUpdateFailureArgs("Connection timeout", "readme.txt")).toEqual([
			"timeout",
			"readme.txt",
			"",
			"ghost",
			"manual",
		]);
		expect(
			buildUpdateFailureArgs("md5 miss", "ghost.dll", "balloon", "script"),
		).toEqual(["md5 miss", "ghost.dll", "", "balloon", "script"]);
	});

	it("handles malformed items in buildInstallRefuseArgs and buildInstallMultiArgs", async () => {
		const {
			buildInstallRefuseArgs,
			buildInstallMultiArgs,
			isMultiResourceInstall,
		} = await import("../ui/ts/core/actions/install-protocol");

		expect(buildInstallRefuseArgs("", "TestGhost")).toEqual([
			"refused",
			"TestGhost",
		]);
		expect(buildInstallRefuseArgs("  ", "TestGhost")).toEqual([
			"refused",
			"TestGhost",
		]);
		expect(buildInstallRefuseArgs("accept failed", "TestGhost")).toEqual([
			"accept failed",
			"TestGhost",
		]);

		// Array with null or invalid items
		const rawList = [
			{ type: "ghost", name: "MainGhost" },
			null as unknown as { type: string; name: string },
			{ type: "shell", name: "AltShell" },
		];
		const multiResult = buildInstallMultiArgs(rawList);
		expect(multiResult.isMulti).toBe(true);
		expect(multiResult.count).toBe("2");
		expect(isMultiResourceInstall(rawList)).toBe(true);
	});
});
