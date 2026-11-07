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
