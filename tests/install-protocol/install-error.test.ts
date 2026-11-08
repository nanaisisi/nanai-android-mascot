import assert from "node:assert/strict";
import { describe, test } from "vitest";

const { parseInstallErrorReason, buildInstallFailureArgs } = await import(
	"../../ui/js/core/actions/install-protocol.js"
);

describe("install-protocol - error parsing & failure args", () => {
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
