import assert from "node:assert/strict";
import { describe, test } from "vitest";

const {
	buildInstallBeginArgs,
	buildInstallCompleteArgs,
	buildInstallCompleteExArgs,
	buildInstallCompleteAllArgs,
	buildInstallRefuseArgs,
	buildInstallRerouteArgs,
} = await import("../../ui/ts/core/actions/install-protocol.js");

describe("install-protocol - argument builders", () => {
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

	test("buildInstallCompleteExArgs generates Reference0..3", () => {
		const args = buildInstallCompleteExArgs(
			"ghost",
			"Nanai",
			"assets/ghost/nanai",
			"\\0\\s[0]Installed!\\e",
		);
		assert.deepEqual(args, [
			"ghost",
			"Nanai",
			"assets/ghost/nanai",
			"\\0\\s[0]Installed!\\e",
		]);
	});

	test("buildInstallCompleteAllArgs formats multiple installed resources", () => {
		const list = [
			{ type: "ghost", name: "Nanai" },
			{ type: "balloon", name: "DefaultBalloon" },
		];
		const args = buildInstallCompleteAllArgs(list);
		assert.equal(args[0], "2");
		assert.equal(args[1], `ghost\x01Nanai\nballoon\x01DefaultBalloon`);
	});

	test("buildInstallRefuseArgs formats refusal reasons", () => {
		assert.deepEqual(buildInstallRefuseArgs("accept failed", "OtherGhost"), [
			"accept failed",
			"OtherGhost",
		]);
		assert.deepEqual(buildInstallRefuseArgs(), ["refused", ""]);
	});

	test("buildInstallRerouteArgs formats reroute destinations", () => {
		assert.deepEqual(
			buildInstallRerouteArgs("TargetGhost", "shell", "NewShell"),
			["TargetGhost", "shell", "NewShell"],
		);
	});
});
