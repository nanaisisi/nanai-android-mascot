let shioriInstance = null;
let isLoaded = false;
let _memoryBuffer = null;

// メインスレッドからのメッセージ待受
self.addEventListener("message", async (e) => {
	const { type, id, payload } = e.data || {};

	switch (type) {
		case "LOAD":
			try {
				// WASM バイナリのロード
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
					_memoryBuffer = instance.exports.memory;

					// C ABI load() 呼出 (エクスポート関数: load または shiori_load)
					const loadFn = instance.exports.load || instance.exports.shiori_load;
					if (typeof loadFn === "function") {
						loadFn(0, 0);
					}
				}

				isLoaded = true;
				self.postMessage({ type: "LOAD_RESULT", id, success: true });
			} catch (err) {
				isLoaded = false;
				self.postMessage({
					type: "LOAD_RESULT",
					id,
					success: false,
					error: err.message,
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
			} catch (err) {
				self.postMessage({
					type: "REQUEST_RESULT",
					id,
					response: `SHIORI/3.0 500 Internal Server Error\r\nCharset: UTF-8\r\nX-Error: ${err.message}\r\n\r\n`,
				});
			}
			break;

		case "UNLOAD":
			try {
				if (shioriInstance) {
					const unloadFn =
						shioriInstance.exports.unload ||
						shioriInstance.exports.shiori_unload;
					if (typeof unloadFn === "function") {
						unloadFn();
					}
				}
			} catch (_e) {
				// unloadエラー無視
			}
			shioriInstance = null;
			isLoaded = false;
			self.postMessage({ type: "UNLOAD_RESULT", id, success: true });
			break;

		default:
			self.postMessage({
				type: "ERROR",
				id,
				error: `Unknown worker action: ${type}`,
			});
	}
});

/**
 * WASM C ABI 経由での SHIORI/3.0 リクエスト実行
 */
function executeWasmRequest(instance, requestText) {
	const reqFn = instance.exports.request || instance.exports.shiori_request;
	const allocFn = instance.exports.malloc || instance.exports.allocate;
	const freeFn = instance.exports.free || instance.exports.deallocate;

	if (typeof reqFn !== "function") {
		return "SHIORI/3.0 204 No Content\r\nCharset: UTF-8\r\n\r\n";
	}

	// 文字列エンコードとメモリ書き込み
	const encoder = new TextEncoder();
	const reqBytes = encoder.encode(requestText);
	const mem = new Uint8Array(instance.exports.memory.buffer);

	let reqPtr = 0;
	if (typeof allocFn === "function") {
		reqPtr = allocFn(reqBytes.length + 1);
	}

	mem.set(reqBytes, reqPtr);
	mem[reqPtr + reqBytes.length] = 0;

	// C ABI: request(ptr, &len)
	const resPtr = reqFn(reqPtr, reqBytes.length);

	// レスポンス文字列読み取り
	let end = resPtr;
	const currentMem = new Uint8Array(instance.exports.memory.buffer);
	while (end < currentMem.length && currentMem[end] !== 0) {
		end++;
	}

	const decoder = new TextDecoder("utf-8");
	const responseText = decoder.decode(currentMem.subarray(resPtr, end));

	if (typeof freeFn === "function" && reqPtr !== 0) {
		freeFn(reqPtr);
	}

	return responseText || "SHIORI/3.0 204 No Content\r\nCharset: UTF-8\r\n\r\n";
}
