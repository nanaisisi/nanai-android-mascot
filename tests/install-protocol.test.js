import assert from "node:assert/strict";
import { describe, test } from "vitest";

const {
	normalizeInstallType,
	buildInstallBeginArgs,
	buildInstallCompleteArgs,
	parseInstallErrorReason,
	buildInstallFailureArgs,
} = await import("../ui/js/core/actions/install-protocol.js");

describe("install-protocol", () => {
	test("normalizeInstallType normalizes resource identifiers", () => {
		assert.equal(normalizeInstallType("Ghost"), "ghost");
		assert.equal(normalizeInstallType("SHELL"), "shell");
		assert.equal(normalizeInstallType(" balloon "), "balloon");
		assert.equal(normalizeInstallType("plugin"), "plugin");
		assert.equal(normalizeInstallType("headline"), "headline");
		assert.equal(normalizeInstallType("package"), "package");
		assert.equal(normalizeInstallType("supplement"), "supplement");
		assert.equal(normalizeInstallType("calendar.skin"), "calendar.skin");
		assert.equal(normalizeInstallType(null), "unknown");
		assert.equal(normalizeInstallType(""), "unknown");
		assert.equal(normalizeInstallType("custom_type"), "custom_type");
	});

	test("buildInstallBeginArgs generates valid Reference0", () => {
		assert.deepEqual(buildInstallBeginArgs(), ["install"]);
		assert.deepEqual(buildInstallBeginArgs("custom_install"), [
			"custom_install",
		]);
	});

	test("buildInstallCompleteArgs generates Reference0, Reference1, Reference2", () => {
		const args = buildInstallCompleteArgs(
			"ghost",
			"Nanai",
			"assets/ghost/nanai",
		);
		assert.deepEqual(args, ["ghost", "Nanai", "assets/ghost/nanai"]);

		const defaultExtra = buildInstallCompleteArgs("balloon", "DefaultBalloon");
		assert.deepEqual(defaultExtra, ["balloon", "DefaultBalloon", ""]);
	});

	test("parseInstallErrorReason maps errors to UKADOC failure reasons", () => {
		assert.equal(
			parseInstallErrorReason("invalid type: install.txt type=unknown"),
			"unsupported",
		);
		assert.equal(
			parseInstallErrorReason("サポートされていないアーカイブ種別です"),
			"unsupported",
		);
		assert.equal(
			parseInstallErrorReason(new Error("User cancelled operation")),
			"artificial",
		);
		assert.equal(
			parseInstallErrorReason("Parent directory traversal ('..') detected"),
			"invalid path",
		);
		assert.equal(
			parseInstallErrorReason("Illegal path in archive: /etc/passwd"),
			"invalid path",
		);
		assert.equal(
			parseInstallErrorReason(new Error("CRC error or corrupt archive")),
			"unlha32 error",
		);
		assert.equal(
			parseInstallErrorReason("Failed writing file: permission denied"),
			"write error",
		);
		assert.equal(
			parseInstallErrorReason("Unknown generic extraction failure"),
			"extraction",
		);
	});

	test("buildInstallFailureArgs produces UKADOC failure argument array", () => {
		assert.deepEqual(buildInstallFailureArgs("unsupported type"), [
			"unsupported",
		]);
		assert.deepEqual(buildInstallFailureArgs("canceled by user"), [
			"artificial",
		]);
		assert.deepEqual(buildInstallFailureArgs("something broken"), [
			"extraction",
		]);
	});
});
