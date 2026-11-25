import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "vitest";
import {
	buildShioriNotifyWasm,
	buildShioriRequestWasm,
} from "../ui/ts/core/wasm/wasm-protocol.js";
import { findHitCollisionNameWasm } from "../ui/ts/core/wasm/wasm-surface.js";
import { wasmBridge } from "../ui/ts/core/wasm-bridge.js";
import { runAllUiComplianceProbes } from "../ui/ts/ui/compliance/runner.js";

function toPlainObject(val: unknown): Record<string, unknown> {
	if (val instanceof Map) {
		return Object.fromEntries(val.entries());
	}
	if (val && typeof val === "object") {
		return val as Record<string, unknown>;
	}
	return {};
}

function readUkagakaText(relPath: string): string {
	const buf = fs.readFileSync(path.resolve(process.cwd(), relPath));
	const latin1Head = buf.subarray(0, 512).toString("latin1").toLowerCase();
	const isUtf8 = latin1Head.includes("charset,utf-8");
	const encoding = isUtf8 ? "utf-8" : "shift-jis";
	return new TextDecoder(encoding).decode(buf);
}

describe("Verification Suite (Phase B3/B4 & Bundled Ghost)", () => {
	it("B1: decodes and parses descript.txt for bundled mock_nanai via WASM", () => {
		const text = readUkagakaText(
			"assets/ghost/mock_nanai/ghost/master/descript.txt",
		);
		const parsed = wasmBridge.parseDescriptText(text);
		assert.ok(parsed, "mock_nanai: parseDescriptText should return manifest");
		const props = parsed.properties ?? {};
		assert.ok(
			Object.keys(props).length > 0,
			"mock_nanai: properties should not be empty",
		);
		const displayName = props.name ?? props["sakura.name"] ?? "";
		assert.ok(
			displayName.length > 0,
			"mock_nanai: name or sakura.name should be present",
		);
		assert.ok(
			!displayName.includes("\uFFFD"),
			`mock_nanai: displayName should not contain replacement char: ${displayName}`,
		);
	});

	it("B2: passes all UI compliance probes (6/6)", async () => {
		const report = await runAllUiComplianceProbes();
		const failedDetails = report.results
			.filter((r) => !r.passed)
			.map((r) => `${r.id}: ${r.actualSummary}`)
			.join(" | ");
		assert.ok(report.total >= 6, `Expected >= 6 probes, got ${report.total}`);
		assert.equal(
			report.failed,
			0,
			`Expected 0 failed UI compliance probes, got ${report.failed}: ${failedDetails}`,
		);
		assert.equal(report.passRate, 100, "Expected 100% pass rate");
	});

	it("B3: parses real surfaces.txt via WASM and resolves collision hit", () => {
		const ghost = "mock_nanai";
		let hitVerified = false;

		const text = readUkagakaText(
			`assets/ghost/${ghost}/shell/master/surfaces.txt`,
		);
		const parsed = toPlainObject(wasmBridge.parseSurfacesTxt(text));
		const elements = toPlainObject(parsed.elements);
		const collisionsMap = toPlainObject(parsed.collisions);
		const animations = toPlainObject(parsed.animations);
		const totalEntries =
			Object.keys(elements).length +
			Object.keys(collisionsMap).length +
			Object.keys(animations).length;
		assert.ok(
			totalEntries > 0,
			`${ghost}: should define at least 1 surface/collision/animation entry`,
		);

		for (const sid of Object.keys(collisionsMap)) {
			const rawCols = Array.isArray(collisionsMap[sid])
				? (collisionsMap[sid] as unknown[])
				: [];
			const cols = rawCols.map((c) => {
				const obj = toPlainObject(c);
				const shapeObj = toPlainObject(obj.shape);
				const x1 = Number(shapeObj.x1 ?? obj.x1 ?? 0);
				const y1 = Number(shapeObj.y1 ?? obj.y1 ?? 0);
				const x2 = Number(shapeObj.x2 ?? obj.x2 ?? 0);
				const y2 = Number(shapeObj.y2 ?? obj.y2 ?? 0);
				return {
					id: Number(obj.id ?? 0),
					name: String(obj.name ?? ""),
					shape: String(shapeObj.shape ?? obj.shape ?? ""),
					x1,
					y1,
					x2,
					y2,
					minX: Math.min(x1, x2),
					minY: Math.min(y1, y2),
					maxX: Math.max(x1, x2),
					maxY: Math.max(y1, y2),
				};
			});
			const firstCol = cols.find((c) => c.shape === "rect" && c.name);
			if (firstCol) {
				const midX = (firstCol.x1 + firstCol.x2) / 2;
				const midY = (firstCol.y1 + firstCol.y2) / 2;
				const hitName = findHitCollisionNameWasm(rawCols, midX, midY);
				assert.equal(
					hitName,
					firstCol.name,
					`${ghost} surface ${sid}: expected hit ${String(firstCol.name)}`,
				);
				hitVerified = true;
				break;
			}
		}

		assert.ok(
			hitVerified,
			"Expected mock_nanai to have a testable rect collision",
		);
	});

	it("B4: parses SakuraScript tokens and builds SHIORI/3.0 requests via WASM", () => {
		const tokens = wasmBridge.parseSakuraScript(
			"\\0\\s[0]こんにちは\\q[選択肢A,OnChoiceA]\\![bind,アクセサリ,眼鏡,1]\\e",
		);
		assert.ok(Array.isArray(tokens) && tokens.length > 0);

		const req = buildShioriRequestWasm("GET", {
			ID: "OnBoot",
			Sender: "Nanai",
			Charset: "UTF-8",
		});
		assert.ok(req?.includes("GET SHIORI/3.0"));
		assert.ok(req?.includes("ID: OnBoot"));

		const notify = buildShioriNotifyWasm("OnSecondChange", [
			"0",
			"0",
			"0",
			"0",
		]);
		assert.ok(notify?.includes("NOTIFY SHIORI/3.0"));
		assert.ok(notify?.includes("ID: OnSecondChange"));
		assert.ok(notify?.includes("Reference0: 0"));
	});
});
