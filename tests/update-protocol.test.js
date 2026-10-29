import assert from "node:assert/strict";
import { test } from "vitest";

const {
	buildUpdateArgs,
	parseErrorReason,
	createUpdateProgressHandler,
	PROGRESS_PHASE_EVENTS,
} = await import("../ui/js/core/actions/update-protocol.js");

test("update-protocol covers buildUpdateArgs, parseErrorReason, and progressHandler", () => {
	// 1. buildUpdateArgs
	const args = buildUpdateArgs("ref0", "ref1");
	assert.deepEqual(args, ["ref0", "ref1", "", "ghost", "manual"]);

	const defaultArgs = buildUpdateArgs();
	assert.deepEqual(defaultArgs, ["", "", "", "ghost", "manual"]);

	// 2. parseErrorReason
	assert.equal(parseErrorReason(new Error("HTTP 404 Not Found")), "404");
	assert.equal(parseErrorReason("timeout error"), "timeout");
	assert.equal(parseErrorReason("other error"), "fileio");

	// 3. createUpdateProgressHandler
	const eventsSent = [];
	let failedFile = null;

	const mockGc = {
		sendShioriEvent: async (ev, args) => {
			eventsSent.push({ ev, args });
		},
	};

	const handler = createUpdateProgressHandler(mockGc, (file) => {
		failedFile = file;
	});

	// Ignore events without filePath
	handler({ payload: {} });

	// Dispatch phases
	handler({ payload: { phase: "download-begin", path: "file1.txt" } });
	handler({ payload: { phase: "md5-begin", path: "file1.txt" } });
	handler({ payload: { phase: "md5-complete", path: "file1.txt" } });
	handler({ payload: { phase: "md5-failed", path: "file1.txt" } });

	assert.equal(failedFile, "file1.txt");
	assert.equal(eventsSent.length, 4);
	assert.equal(eventsSent[0].ev, PROGRESS_PHASE_EVENTS["download-begin"]);
	assert.equal(eventsSent[3].ev, PROGRESS_PHASE_EVENTS["md5-failed"]);
});
