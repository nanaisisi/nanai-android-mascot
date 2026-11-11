/**
 * WebWorker for WebAssembly SHIORI Engine Execution
 *
 * Implements the standard SHIORI 3.0 C ABI over WebAssembly Linear Memory:
 * - `load(dir_ptr, dir_len)`: initial directory loading
 * - `request(req_ptr, len_ptr)`: request string dispatch and response retrieval
 * - `unload()`: teardown
 */

let shioriInstance: WebAssembly.Instance | null = null;
let isLoaded = false;
let memoryBuffer: WebAssembly.Memory | null = null;

const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8");

/**
 * Execute a SHIORI 3.0 request against a WebAssembly instance using standard C ABI
 */
export function executeWasmRequest(
	instance: WebAssembly.Instance,
	requestText: string,
): string {
	const exports = instance.exports as Record<string, unknown>;
	const requestFn = (exports.request || exports.shiori_request) as
		| ((ptr: number, lenPtr: number) => number)
		| undefined;
	const mallocFn = (exports.malloc || exports.shiori_malloc) as
		| ((size: number) => number)
		| undefined;
	const freeFn = (exports.free || exports.shiori_free) as
		| ((ptr: number, size?: number) => void)
		| undefined;
	const memory = (exports.memory || memoryBuffer) as
		| WebAssembly.Memory
		| undefined;

	if (typeof requestFn !== "function" || !memory) {
		// Mock response if C ABI functions are missing
		return "SHIORI/3.0 200 OK\r\nCharset: UTF-8\r\nValue: \\0\\s[0]WASM SHIORI response (mock)\\e\r\n\r\n";
	}

	const reqBytes = encoder.encode(requestText);
	const reqLen = reqBytes.length;

	let reqPtr = 0;
	let lenPtr = 0;
	let allocatedReq = false;
	let allocatedLen = false;

	if (typeof mallocFn === "function") {
		reqPtr = mallocFn(reqLen + 1);
		lenPtr = mallocFn(4);
		allocatedReq = true;
		allocatedLen = true;
	} else {
		// Fallback to static memory offsets if malloc is not exported
		lenPtr = 512;
		reqPtr = 1024;
	}

	const memU8 = new Uint8Array(memory.buffer);
	const memDataView = new DataView(memory.buffer);

	// Write length (32-bit little-endian) and request payload
	memDataView.setUint32(lenPtr, reqLen, true);
	memU8.set(reqBytes, reqPtr);

	let resPtr = 0;
	try {
		resPtr = requestFn(reqPtr, lenPtr);
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : String(err);
		return `SHIORI/3.0 500 Internal Server Error\r\nCharset: UTF-8\r\nX-Error: ${message}\r\n\r\n`;
	}

	// Memory buffer could have grown, so re-obtain DataView
	const currentDataView = new DataView(memory.buffer);
	const currentU8 = new Uint8Array(memory.buffer);
	const outLen = currentDataView.getUint32(lenPtr, true);

	let responseText = "SHIORI/3.0 204 No Content\r\nCharset: UTF-8\r\n\r\n";

	if (resPtr > 0 && outLen > 0) {
		const responseBytes = currentU8.subarray(resPtr, resPtr + outLen);
		responseText = decoder.decode(responseBytes);
	}

	if (typeof freeFn === "function") {
		if (allocatedReq && reqPtr > 0) {
			try {
				freeFn(reqPtr, reqLen + 1);
			} catch (_e) {}
		}
		if (allocatedLen && lenPtr > 0) {
			try {
				freeFn(lenPtr, 4);
			} catch (_e) {}
		}
		if (resPtr > 0) {
			try {
				freeFn(resPtr, outLen);
			} catch (_e) {}
		}
	}

	return responseText;
}

// Bind to worker scope for backwards compatibility
if (typeof self !== "undefined") {
	(self as unknown as Record<string, unknown>).executeWasmRequest =
		executeWasmRequest;
}

if (
	typeof self !== "undefined" &&
	typeof self.addEventListener === "function"
) {
	self.addEventListener("message", async (e: MessageEvent) => {
		const { type, id, payload } = e.data || {};

		switch (type) {
			case "LOAD":
				try {
					if (payload?.wasmUrl || payload?.wasmBytes) {
						const wasmBytes =
							payload.wasmBytes ||
							(await (await fetch(payload.wasmUrl)).arrayBuffer());
						const importObject = {
							env: {
								memory: new WebAssembly.Memory({ initial: 256, maximum: 2048 }),
								abort: () => console.error("WASM abort called"),
							},
						};

						const { instance } = await WebAssembly.instantiate(
							wasmBytes,
							importObject,
						);
						shioriInstance = instance;
						memoryBuffer =
							(instance.exports.memory as WebAssembly.Memory) || null;

						const loadFn = (instance.exports.load ||
							instance.exports.shiori_load) as
							| ((ptr: number, len: number) => number)
							| undefined;
						if (typeof loadFn === "function") {
							const dirPath = payload?.dirPath || "ghost/master";
							const dirBytes = encoder.encode(dirPath);
							const mallocFn = (instance.exports.malloc ||
								instance.exports.shiori_malloc) as
								| ((size: number) => number)
								| undefined;

							if (typeof mallocFn === "function" && memoryBuffer) {
								const dirPtr = mallocFn(dirBytes.length + 1);
								new Uint8Array(memoryBuffer.buffer).set(dirBytes, dirPtr);
								loadFn(dirPtr, dirBytes.length);
							} else {
								loadFn(0, 0);
							}
						}
					}

					isLoaded = true;
					self.postMessage({
						type: "LOAD_RESULT",
						id,
						success: true,
					});
				} catch (err: unknown) {
					isLoaded = false;
					const message = err instanceof Error ? err.message : String(err);
					self.postMessage({
						type: "LOAD_RESULT",
						id,
						success: false,
						error: message,
					});
				}
				break;

			case "REQUEST":
				try {
					if (!isLoaded || !shioriInstance) {
						self.postMessage({
							type: "REQUEST_RESULT",
							id,
							response: "SHIORI/3.0 204 No Content\r\nCharset: UTF-8\r\n\r\n",
						});
						return;
					}

					const requestText = payload?.request || "";
					const responseText = executeWasmRequest(shioriInstance, requestText);

					self.postMessage({
						type: "REQUEST_RESULT",
						id,
						response: responseText,
					});
				} catch (err: unknown) {
					const message = err instanceof Error ? err.message : String(err);
					self.postMessage({
						type: "REQUEST_RESULT",
						id,
						response: `SHIORI/3.0 500 Internal Server Error\r\nCharset: UTF-8\r\nX-Error: ${message}\r\n\r\n`,
					});
				}
				break;

			case "UNLOAD":
				try {
					if (shioriInstance) {
						const unloadFn = (shioriInstance.exports.unload ||
							shioriInstance.exports.shiori_unload) as
							| (() => number | undefined)
							| undefined;
						if (typeof unloadFn === "function") {
							unloadFn();
						}
					}
				} catch (_e) {}
				shioriInstance = null;
				memoryBuffer = null;
				isLoaded = false;
				self.postMessage({
					type: "UNLOAD_RESULT",
					id,
					success: true,
				});
				break;

			default:
				self.postMessage({
					type: "ERROR",
					id,
					error: `Unknown message type: ${type}`,
				});
				break;
		}
	});
}
