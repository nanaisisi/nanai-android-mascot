import assert from "node:assert/strict";
import { test } from "node:test";

const calls = [];
let loadDelay = async () => {};
globalThis.window = globalThis;
globalThis.document = {
	getElementById: () => null,
	querySelector: () => null,
};
globalThis.__TAURI_INTERNALS__ = {
	transformCallback: () => 0,
	invoke: async (cmd, args) => {
		calls.push({ cmd, args });
		if (cmd === "load_surface_image") {
			await loadDelay(args);
			return `data:image/png;base64,${args.surfaceId}`;
		}
		if (cmd === "load_surface_pna") throw new Error("no pna");
		return null;
	},
};

const { ghostSurfaceMethods } = await import(
	"../ui/js/surface/ghost-surface.js"
);

function makeController() {
	const gc = Object.create(ghostSurfaceMethods);
	const chromaCalls = [];
	gc.currentGhost = { name: "g", path: "ghost/g" };
	gc.currentShell = "master";
	gc.currentSurfaces = new Map();
	gc.app = {
		surfaceManager: {
			resolveSurfaceNumber: (id) => id,
			setSurfaceId() {},
			processChromaKey: async (src, pna) => {
				chromaCalls.push({ src, pna });
				return src;
			},
			composeSurfaceElements: async (_id, src, resolve, _scope, layers) => {
				for (const layer of layers || []) {
					await resolve(layer.file);
				}
				return layers ? `${src}+frame` : src;
			},
		},
	};
	gc._chromaCalls = chromaCalls;
	return gc;
}

const count = (cmd) => calls.filter((c) => c.cmd === cmd).length;
const emitted = () =>
	calls
		.filter((c) => c.cmd === "plugin:event|emit")
		.map((c) => c.args.payload?.src);

test("repeated surface updates reuse loaded image data", async () => {
	calls.length = 0;
	const gc = makeController();
	await gc.updateSurface(0, 0);
	await gc.updateSurface(0, 0);
	assert.equal(count("load_surface_image"), 1);
	assert.equal(count("load_surface_pna"), 1);
});

test("animation frames do not re-show the character window", async () => {
	calls.length = 0;
	const gc = makeController();
	await gc.updateSurface(0, 0, [{ file: "surface1.png", x: 0, y: 0 }]);
	assert.equal(count("show_subchar_window"), 0);
});

test("animation frame layer also runs chroma-key processing", async () => {
	calls.length = 0;
	const gc = makeController();
	await gc.updateSurface(0, 0, [{ file: "surface1.png", x: 0, y: 0 }]);
	assert.ok(gc._chromaCalls.some((c) => c.src === "data:image/png;base64,1"));
});

test("a slower older surface update does not overwrite a newer one", async () => {
	calls.length = 0;
	const gc = makeController();
	let release;
	const gate = new Promise((r) => {
		release = r;
	});
	loadDelay = async (args) => {
		if (args.surfaceId === "5") await gate;
	};
	const older = gc.updateSurface(5, 0);
	await gc.updateSurface(6, 0);
	release();
	await older;
	loadDelay = async () => {};
	assert.equal(gc.currentSurfaces.get(0), "data:image/png;base64,6");
	assert.deepEqual(emitted(), ["data:image/png;base64,6"]);
});
