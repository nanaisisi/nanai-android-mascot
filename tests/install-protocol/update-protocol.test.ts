import assert from "node:assert/strict";
import { describe, test } from "vitest";

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
} = await import("../../ui/ts/core/actions/update-protocol.js");

describe("install-protocol - update-protocol legacy coverage", () => {
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
