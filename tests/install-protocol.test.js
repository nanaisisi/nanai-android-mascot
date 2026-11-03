import assert from "node:assert/strict";
import { describe, test } from "vitest";

const {
	normalizeInstallType,
	buildInstallBeginArgs,
	buildInstallCompleteArgs,
	buildInstallCompleteExArgs,
	buildInstallCompleteAllArgs,
	buildInstallRefuseArgs,
	buildInstallRerouteArgs,
	parseInstallErrorReason,
	buildInstallFailureArgs,
} = await import("../ui/js/core/actions/install-protocol.js");

const {
	buildUpdateArgs,
	buildUpdateOtherArgs,
	PROGRESS_PHASE_EVENTS,
	OTHER_PROGRESS_PHASE_EVENTS,
	parseErrorReason,
	createUpdateProgressHandler,
} = await import("../ui/js/core/actions/update-protocol.js");

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

describe("update-protocol", () => {
	test("buildUpdateArgs generates standard 5-element update arguments", () => {
		assert.deepEqual(buildUpdateArgs("file.txt", "1024"), [
			"file.txt",
			"1024",
			"",
			"ghost",
			"manual",
		]);
		assert.deepEqual(buildUpdateArgs("file.txt", "", "balloon", "auto"), [
			"file.txt",
			"",
			"",
			"balloon",
			"auto",
		]);
	});

	test("buildUpdateOtherArgs generates 4-element external update arguments", () => {
		assert.deepEqual(
			buildUpdateOtherArgs("DefaultBalloon", "balloon", "1.0", "manual"),
			["DefaultBalloon", "balloon", "1.0", "manual"],
		);
	});

	test("PROGRESS_PHASE_EVENTS and OTHER_PROGRESS_PHASE_EVENTS mapping", () => {
		assert.equal(
			PROGRESS_PHASE_EVENTS["download-begin"],
			"OnUpdate.OnDownloadBegin",
		);
		assert.equal(
			OTHER_PROGRESS_PHASE_EVENTS["download-begin"],
			"OnUpdateOther.OnDownloadBegin",
		);
		assert.equal(
			OTHER_PROGRESS_PHASE_EVENTS["md5-failed"],
			"OnUpdateOther.OnMD5CompareFailure",
		);
	});

	test("parseErrorReason extracts standard failure reasons", () => {
		assert.equal(parseErrorReason("HTTP 404 Not Found"), "404");
		assert.equal(parseErrorReason("Request timeout"), "timeout");
		assert.equal(parseErrorReason("md5 miss mismatch"), "md5 miss");
		assert.equal(parseErrorReason("Permission denied"), "fileio");
	});

	test("createUpdateProgressHandler relays events to GhostController", async () => {
		const dispatched = [];
		const mockGc = {
			sendShioriEvent: async (ev, args) => {
				dispatched.push({ ev, args });
			},
		};
		let failed = null;
		const handler = createUpdateProgressHandler(
			mockGc,
			(f) => {
				failed = f;
			},
			true,
		);

		handler({
			payload: { phase: "download-begin", path: "balloon/theme.txt" },
		});
		assert.equal(dispatched.length, 1);
		assert.equal(dispatched[0].ev, "OnUpdateOther.OnDownloadBegin");
		assert.equal(dispatched[0].args[0], "balloon/theme.txt");

		handler({
			payload: { phase: "md5-failed", path: "balloon/theme.txt" },
		});
		assert.equal(dispatched.length, 2);
		assert.equal(dispatched[1].ev, "OnUpdateOther.OnMD5CompareFailure");
		assert.equal(failed, "balloon/theme.txt");
	});
});
