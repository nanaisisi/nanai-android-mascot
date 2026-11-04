let shioriInstance: any = null;
let isLoaded = false;
let _memoryBuffer: any = null;

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
					_memoryBuffer = instance.exports.memory;

					const loadFn: any = (instance.exports.load as any) || (instance.exports.shiori_load as any);
					if (typeof loadFn === "function") {
						loadFn(0, 0);
					}
				}

				isLoaded = true;
				(self as any).postMessage({ type: "LOAD_RESULT", id, success: true });
			} catch (err: any) {
				isLoaded = false;
				(self as any).postMessage({
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
					(self as any).postMessage({
						type: "REQUEST_RESULT",
						id,
						response: "SHIORI/3.0 204 No Content\r\nCharset: UTF-8\r\n\r\n",
					});
					return;
				}

				const requestText = payload?.request || "";
				const responseText = (self as any).executeWasmRequest(shioriInstance, requestText);

				(self as any).postMessage({
					type: "REQUEST_RESULT",
					id,
					response: responseText,
				});
			} catch (err: any) {
				(self as any).postMessage({
					type: "REQUEST_RESULT",
					id,
					response: `SHIORI/3.0 500 Internal Server Error\r\nCharset: UTF-8\r\nX-Error: ${err.message}\r\n\r\n`,
				});
			}
			break;

		case "UNLOAD":
			try {
				if (shioriInstance) {
					const unloadFn: any =
						(shioriInstance.exports.unload as any) ||
						(shioriInstance.exports.shiori_unload as any);
					if (typeof unloadFn === "function") {
						unloadFn();
					}
				}
			} catch (_e) {}
			shioriInstance = null;
			isLoaded = false;
			(self as any).postMessage({ type: "UNLOAD_RESULT", id, success: true });
			break;

		default:
			(self as any).postMessage({
				type: "ERROR",
				id,
				error: `Unknown message type: ${type}`,
			});
			break;
	}
});
