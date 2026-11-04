import assert from "node:assert/strict";
import { describe, test } from "vitest";

const {
	INSTALL_IDENTIFIERS,
	INSTALL_FAILURE_REASONS,
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
	UPDATE_TARGET_TYPES,
	UPDATE_REASONS,
	UPDATE_RESULT_COMPLETE,
	UPDATE_RESULT_FAILURE_REASONS,
	UPDATE_EVENT_ORDER,
	buildUpdateArgs,
	buildUpdateOtherArgs,
	PROGRESS_PHASE_EVENTS,
	OTHER_PROGRESS_PHASE_EVENTS,
	parseErrorReason,
	createUpdateProgressHandler,
} = await import("../ui/js/core/actions/update-protocol.js");

describe("install-protocol", () => {
	test("UKADOC install constants are defined and frozen", () => {
		assert.ok(Array.isArray(INSTALL_IDENTIFIERS));
		assert.ok(INSTALL_IDENTIFIERS.includes("ghost"));
		assert.ok(INSTALL_IDENTIFIERS.includes("balloon"));
		assert.ok(INSTALL_IDENTIFIERS.includes("shell"));
		assert.ok(INSTALL_IDENTIFIERS.includes("calendar.skin"));
		assert.ok(INSTALL_IDENTIFIERS.includes("profile"));
		assert.ok(Object.isFrozen(INSTALL_IDENTIFIERS));

		assert.ok(Array.isArray(INSTALL_FAILURE_REASONS));
		assert.ok(INSTALL_FAILURE_REASONS.includes("unsupported"));
		assert.ok(INSTALL_FAILURE_REASONS.includes("extraction"));
		assert.ok(INSTALL_FAILURE_REASONS.includes("unlha32 error"));
		assert.ok(INSTALL_FAILURE_REASONS.includes("invalid path"));
		assert.ok(Object.isFrozen(INSTALL_FAILURE_REASONS));
	});

	test("normalizeInstallType normalizes resource identifiers", () => {
		assert.equal(normalizeInstallType("Ghost"), "ghost");
		assert.equal(normalizeInstallType("SHELL"), "shell");
		assert.equal(normalizeInstallType(" balloon "), "balloon");
		assert.equal(normalizeInstallType("plugin"), "plugin");
		assert.equal(normalizeInstallType("headline"), "headline");
		assert.equal(normalizeInstallType("package"), "package");
		assert.equal(normalizeInstallType("supplement"), "supplement");
		assert.equal(normalizeInstallType("calendar.skin"), "calendar.skin");
		assert.equal(normalizeInstallType("calendar.plugin"), "calendar.plugin");
		assert.equal(normalizeInstallType("profile"), "profile");
		assert.equal(normalizeInstallType("taromime"), "taromime");
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
	test("UKADOC update constants are defined and frozen", () => {
		assert.ok(Array.isArray(UPDATE_TARGET_TYPES));
		assert.ok(UPDATE_TARGET_TYPES.includes("ghost"));
		assert.ok(UPDATE_TARGET_TYPES.includes("shell"));
		assert.ok(UPDATE_TARGET_TYPES.includes("balloon"));
		assert.ok(Object.isFrozen(UPDATE_TARGET_TYPES));

		assert.ok(Array.isArray(UPDATE_REASONS));
		assert.ok(UPDATE_REASONS.includes("manual"));
		assert.ok(UPDATE_REASONS.includes("auto"));
		assert.ok(UPDATE_REASONS.includes("script"));
		assert.ok(Object.isFrozen(UPDATE_REASONS));

		assert.ok(Array.isArray(UPDATE_RESULT_COMPLETE));
		assert.ok(UPDATE_RESULT_COMPLETE.includes("none"));
		assert.ok(UPDATE_RESULT_COMPLETE.includes("changed"));
		assert.ok(Object.isFrozen(UPDATE_RESULT_COMPLETE));

		assert.ok(Array.isArray(UPDATE_RESULT_FAILURE_REASONS));
		assert.ok(UPDATE_RESULT_FAILURE_REASONS.includes("timeout"));
		assert.ok(UPDATE_RESULT_FAILURE_REASONS.includes("404"));
		assert.ok(UPDATE_RESULT_FAILURE_REASONS.includes("md5 miss"));
		assert.ok(UPDATE_RESULT_FAILURE_REASONS.includes("fileio"));
		assert.ok(UPDATE_RESULT_FAILURE_REASONS.includes("artificial"));
		assert.ok(UPDATE_RESULT_FAILURE_REASONS.includes("readonly"));
		assert.ok(Object.isFrozen(UPDATE_RESULT_FAILURE_REASONS));

		assert.ok(Array.isArray(UPDATE_EVENT_ORDER));
		assert.equal(UPDATE_EVENT_ORDER[0], "OnUpdateProcessExec");
		assert.equal(
			UPDATE_EVENT_ORDER[UPDATE_EVENT_ORDER.length - 1],
			"OnUpdateComplete",
		);
		assert.ok(Object.isFrozen(UPDATE_EVENT_ORDER));
	});

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
