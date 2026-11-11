import assert from "node:assert/strict";
import { test } from "vitest";

const {
	buildUpdateArgs,
	buildUpdateOtherArgs,
	parseErrorReason,
	createUpdateProgressHandler,
	PROGRESS_PHASE_EVENTS,
} = await import("../ui/ts/core/actions/update-protocol.js");

test("update-protocol covers buildUpdateArgs, buildUpdateOtherArgs, parseErrorReason, and progressHandler", () => {
	// 1. buildUpdateArgs
	const args = buildUpdateArgs("ref0", "ref1");
	assert.deepEqual(args, ["ref0", "ref1", "", "ghost", "manual"]);

	const defaultArgs = buildUpdateArgs();
	assert.deepEqual(defaultArgs, ["", "", "", "ghost", "manual"]);

	const customTypeArgs = buildUpdateArgs("ok", "none", "shell", "automatic");
	assert.deepEqual(customTypeArgs, ["ok", "none", "", "shell", "automatic"]);

	// 1.5. buildUpdateOtherArgs
	const otherArgs1 = buildUpdateOtherArgs("ShellName", "shell", "1.0", "auto");
	assert.deepEqual(otherArgs1, ["ShellName", "shell", "1.0", "auto"]);

	const otherArgsDefault = buildUpdateOtherArgs();
	assert.deepEqual(otherArgsDefault, ["", "shell", "", "manual"]);

	// 2. parseErrorReason
	assert.equal(parseErrorReason(new Error("HTTP 404 Not Found")), "404");
	assert.equal(parseErrorReason(new Error("404")), "404");
	assert.equal(parseErrorReason("timeout error"), "timeout");
	assert.equal(parseErrorReason("connection timeout"), "timeout");
	assert.equal(parseErrorReason("md5 miss mismatch"), "md5 miss");
	assert.equal(parseErrorReason("other error"), "fileio");

	// 3. createUpdateProgressHandler
	const eventsSent: { ev: unknown; args: unknown }[] | { ev: unknown }[] = [];
	let failedFile = null;

	const mockGc = {
		sendShioriEvent: async (ev: unknown, args: unknown) => {
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
	handler({ payload: { phase: "fileio-failed", path: "file2.txt" } });

	assert.equal(failedFile, "file2.txt");
	assert.equal(eventsSent.length, 5);
	assert.equal(eventsSent[0].ev, PROGRESS_PHASE_EVENTS["download-begin"]);
	assert.equal(eventsSent[3].ev, PROGRESS_PHASE_EVENTS["md5-failed"]);
	assert.equal(eventsSent[4].ev, PROGRESS_PHASE_EVENTS["fileio-failed"]);

	// 4. Unknown phase or null payload does not throw
	handler({ payload: null });
	handler({ payload: { phase: "unknown-phase", path: "file2.txt" } });

	// 5. Handler without onFailedFile callback
	const handlerNoCallback = createUpdateProgressHandler(mockGc);
	handlerNoCallback({ payload: { phase: "md5-failed", path: "file3.txt" } });

	// 6. Handler with null gc
	const handlerNoGc = createUpdateProgressHandler(null);
	handlerNoGc({ payload: { phase: "download-begin", path: "file4.txt" } });
});
