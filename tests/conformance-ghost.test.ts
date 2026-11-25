import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "vitest";
import {
	buildShioriNotifyWasm,
	buildShioriRequestWasm,
	buildSstpResponseWasm,
	parseSstpRequestWasm,
} from "../ui/ts/core/wasm/wasm-protocol.js";
import {
	computeSurfaceCompositionPlanWasm,
	findHitCollisionNameWasm,
} from "../ui/ts/core/wasm/wasm-surface.js";
import { wasmBridge } from "../ui/ts/core/wasm-bridge.js";

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
	const encoding = latin1Head.includes("charset,utf-8") ? "utf-8" : "shift-jis";
	return new TextDecoder(encoding).decode(buf);
}

describe("Conformance Ghost Regression (assets/ghost/mock_nanai)", () => {
	it("1. parses install.txt with type, name, and directory", () => {
		const text = readUkagakaText("assets/ghost/mock_nanai/install.txt");
		const parsed = wasmBridge.parseDescriptText(text);
		assert.ok(parsed, "install.txt should parse");
		const props = parsed.properties ?? {};
		assert.ok(props.type, "install.txt type should exist");
		assert.ok(props.name, "install.txt name should exist");
		assert.ok(props.directory, "install.txt directory should exist");
	});

	it("2. parses ghost and shell descript.txt and verifies surface assets exist", () => {
		const ghostDesc = wasmBridge.parseDescriptText(
			readUkagakaText("assets/ghost/mock_nanai/ghost/master/descript.txt"),
		);
		const shellDesc = wasmBridge.parseDescriptText(
			readUkagakaText("assets/ghost/mock_nanai/shell/master/descript.txt"),
		);
		assert.ok(ghostDesc?.properties?.name, "ghost descript name should exist");
		assert.ok(shellDesc?.properties?.name, "shell descript name should exist");
		assert.ok(
			fs.existsSync(
				path.resolve(
					process.cwd(),
					"assets/ghost/mock_nanai/shell/master/surface0.png",
				),
			),
			"surface0.png should exist",
		);
		assert.ok(
			fs.existsSync(
				path.resolve(
					process.cwd(),
					"assets/ghost/mock_nanai/shell/master/surface10.png",
				),
			),
			"surface10.png should exist",
		);
	});

	it("3. parses surfaces.txt, verifies collision hit/miss, and computes composition plan", () => {
		const parsed = toPlainObject(
			wasmBridge.parseSurfacesTxt(
				readUkagakaText("assets/ghost/mock_nanai/shell/master/surfaces.txt"),
			),
		);
		const collisionsMap = toPlainObject(parsed.collisions);
		let tested = false;

		for (const sid of Object.keys(collisionsMap)) {
			const rawCols = Array.isArray(collisionsMap[sid])
				? (collisionsMap[sid] as unknown[])
				: [];
			for (const c of rawCols) {
				const obj = toPlainObject(c);
				const shapeObj = toPlainObject(obj.shape);
				if (shapeObj.shape === "rect" && typeof obj.name === "string") {
					const midX = (Number(shapeObj.x1) + Number(shapeObj.x2)) / 2;
					const midY = (Number(shapeObj.y1) + Number(shapeObj.y2)) / 2;
					assert.equal(findHitCollisionNameWasm(rawCols, midX, midY), obj.name);
					assert.equal(findHitCollisionNameWasm(rawCols, 9999, 9999), null);
					tested = true;
					break;
				}
			}
			if (tested) break;
		}
		assert.ok(tested, "Expected rect collision in mock_nanai surfaces.txt");

		const plan = computeSurfaceCompositionPlanWasm(0, [], []);
		assert.ok(plan !== null, "composition plan should not be null");
	});

	it("4. tokenizes SakuraScript with scope, surface, wait, choice, anchor, and bind tags", () => {
		const tokens = wasmBridge.parseSakuraScript(
			"\\0\\s[0]おはよう\\w5\\1\\s[10]こんにちは\\_w[100]\\0\\q[メニュー,OnMenu]\\_a[link1]案内\\_a\\![bind,アクセサリ,眼鏡,1]\\e",
		);
		assert.ok(Array.isArray(tokens) && tokens.length >= 8);
	});

	it("5. roundtrips SHIORI/3.0 and SSTP/1.4 protocol messages via WASM", () => {
		const shioriReq = buildShioriRequestWasm("GET", {
			ID: "OnBoot",
			Sender: "Nanai",
			Charset: "UTF-8",
		});
		assert.ok(shioriReq?.includes("GET SHIORI/3.0"));
		assert.ok(shioriReq?.includes("ID: OnBoot"));

		const shioriNotify = buildShioriNotifyWasm("OnSecondChange", [
			"0",
			"0",
			"0",
			"0",
		]);
		assert.ok(shioriNotify?.includes("NOTIFY SHIORI/3.0"));
		assert.ok(shioriNotify?.includes("Reference0: 0"));

		const sstpParsed = parseSstpRequestWasm(
			"SEND SSTP/1.4\r\nSender: Conformance\r\nScript: \\0Hello\\e\r\nCharset: UTF-8\r\n\r\n",
		);
		assert.equal(sstpParsed?.command, "SEND");
		assert.equal(sstpParsed?.headers?.Sender, "Conformance");

		const sstpResp = buildSstpResponseWasm(200, "");
		assert.ok(
			sstpResp?.includes("SSTP/1.") && sstpResp?.includes("200"),
			`Expected SSTP 200 response, got: ${String(sstpResp)}`,
		);
	});
});
