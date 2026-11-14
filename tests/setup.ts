import fs from "node:fs";
import path from "node:path";
import { beforeAll } from "vitest";
import { wasmMemory } from "../ui/ts/core/wasm/wasm-memory.js";

beforeAll(async () => {
	const wasmPath = path.resolve(
		process.cwd(),
		"ui/ts/core/wasm/pkg/nanai_core_bg.wasm",
	);
	const wasmBuffer = fs.readFileSync(wasmPath);
	const arrayBuffer = wasmBuffer.buffer.slice(
		wasmBuffer.byteOffset,
		wasmBuffer.byteOffset + wasmBuffer.byteLength,
	);
	await wasmMemory.init(arrayBuffer);
});
