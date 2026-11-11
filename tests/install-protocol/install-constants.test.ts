import assert from "node:assert/strict";
import { describe, test } from "vitest";

const { INSTALL_IDENTIFIERS, INSTALL_FAILURE_REASONS, normalizeInstallType } =
	await import("../../ui/ts/core/actions/install-protocol.js");

describe("install-protocol - constants & normalization", () => {
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
});
