import assert from "node:assert/strict";
import { test } from "vitest";

const {
	enumToString,
	intervalToString,
	methodToString,
	collisionRecord,
	collisionContains,
	manifestToSurfaceData,
	getShellManifest,
	parseSurfacesTextWithRust,
} = await import("../ui/js/surface/shell-manifest.js");

test("shell-manifest functions cover enums, collision records, and containment", async () => {
	// 1. enumToString
	assert.equal(enumToString(null), "");
	assert.equal(enumToString("Always"), "always");
	assert.equal(enumToString({ Random: 3 }), "random,3");
	assert.equal(enumToString({ Custom: "myMode" }), "mymode");
	assert.equal(enumToString(123), "123");

	// 2. intervalToString
	assert.equal(intervalToString("YenE"), "\\e");
	assert.equal(intervalToString("always"), "always");

	// 3. methodToString
	assert.equal(methodToString("blend,multiply"), "blend-multiply");
	assert.equal(methodToString("overlay"), "overlay");

	// 4. collisionRecord (rect, polygon, circle, ellipse)
	const rectRec = collisionRecord({
		name: "Head",
		shape: { Rect: { x1: 0, y1: 0, x2: 10, y2: 10 } },
	});
	assert.equal(rectRec.shape, "rect");
	assert.equal(rectRec.x2, 10);

	const polyRec = collisionRecord({
		name: "Arm",
		shape: {
			Polygon: { vertices: [[0, 0], [10, 0], [5, 10], [{ x: 0, y: 0 }]] },
		},
	});
	assert.equal(polyRec.shape, "polygon");
	assert.equal(polyRec.vertices.length, 4);

	const circleRec = collisionRecord({
		name: "C",
		shape: { Circle: { cx: 5, cy: 5, r: 5 } },
	});
	assert.equal(circleRec.shape, "circle");
	assert.equal(circleRec.rx, 5);

	const ellipseRec = collisionRecord({
		name: "E",
		shape: { Ellipse: { cx: 5, cy: 5, rx: 5, ry: 8 } },
	});
	assert.equal(ellipseRec.shape, "ellipse");
	assert.equal(ellipseRec.ry, 8);

	// 5. collisionContains
	assert.equal(collisionContains(rectRec, 5, 5), true);
	assert.equal(collisionContains(rectRec, 15, 15), false);
	assert.equal(collisionContains(null, 0, 0), false);

	assert.equal(collisionContains(polyRec, 5, 2), true); // inside triangle
	assert.equal(collisionContains(circleRec, 5, 5), true);
	assert.equal(collisionContains(ellipseRec, 5, 5), true);

	// 6. manifestToSurfaceData
	const mockManifest = {
		aliases: { smile: [0, 1] },
		kero_aliases: { normal: [10] },
		surfaces: [
			{
				number: 0,
				definition: {
					collisions: [
						{ name: "head", shape: { Rect: { x1: 0, y1: 0, x2: 10, y2: 10 } } },
					],
					elements: [{ id: 0, method: "Base", file: "base.png", x: 0, y: 0 }],
					animations: {
						0: {
							id: 0,
							interval: "Always",
							patterns: [
								{
									index: 0,
									surface: 6,
									wait: 50,
									wait_max: 100,
									method: "Overlay",
									x: 0,
									y: 0,
								},
							],
						},
					},
				},
			},
		],
	};
	const surfaceData = manifestToSurfaceData(mockManifest);
	assert.ok(surfaceData.collisions["0"]);
	assert.ok(surfaceData.elements["0"]);
	assert.ok(surfaceData.animations["0"]);
	assert.equal(surfaceData.aliases.smile[0], 0);

	// 7. getShellManifest & parseSurfacesTextWithRust (with Tauri mock)
	globalThis.__TAURI_INTERNALS__ = {
		invoke: async (cmd, _args) => {
			if (cmd === "shell_manifest") return mockManifest;
			if (cmd === "parse_surfaces_text") return { 0: mockManifest.surfaces[0] };
		},
		transformCallback: (cb) => cb,
	};
	globalThis.window = globalThis;

	const shRes = await getShellManifest("ghost", "shell");
	assert.ok(shRes);

	const parseRes = await parseSurfacesTextWithRust("surface0\n{...}");
	assert.ok(parseRes);

	// Test error catch branches
	globalThis.__TAURI_INTERNALS__.invoke = async () => {
		throw new Error("fail");
	};
	assert.equal(await getShellManifest("g", "s"), null);
	assert.equal(await parseSurfacesTextWithRust("bad"), null);

	delete globalThis.__TAURI_INTERNALS__;
	assert.ok(true);
});
