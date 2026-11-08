
const _shioriInstance: unknown = null;
const _isLoaded = false;
const _memoryBuffer: unknown = null;

// biome-ignore lint/suspicious/noExplicitAny: automated fix
let shioriInstance: any = null;
let isLoaded = false;
// biome-ignore lint/suspicious/noExplicitAny: automated fix
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


					const _loadFn: unknown =
						(instance.exports.load as unknown) ||
						(instance.exports.shiori_load as unknown);

					// biome-ignore lint/suspicious/noExplicitAny: automated fix
					const loadFn: any =
						// biome-ignore lint/suspicious/noExplicitAny: automated fix
						(instance.exports.load as any) ||
						// biome-ignore lint/suspicious/noExplicitAny: automated fix
						(instance.exports.shiori_load as any);

					if (typeof loadFn === "function") {
						loadFn(0, 0);
					}
				}

				isLoaded = true;

				(self as unknown).postMessage(
					type: "LOAD_RESULT",
					id,
					success: true,);
			} catch (_err: unknown) {
				isLoaded = false;
				(self as unknown).postMessage({

				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				(self as any).postMessage({ type: "LOAD_RESULT", id, success: true });
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
			} catch (err: any) {
				isLoaded = false;
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
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

					(self as unknown).postMessage(

					// biome-ignore lint/suspicious/noExplicitAny: automated fix
					(self as any).postMessage(

						type: "REQUEST_RESULT",
						id,
						response: "SHIORI/3.0 204 No Content\r\nCharset: UTF-8\r\n\r\n",);
					return;

				const requestText = payload?.request || "";

				const _responseText = (self as unknown).executeWasmRequest(

				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				const _responseText = (self as any).executeWasmRequest(

					shioriInstance,
					requestText,
				);


				(self as unknown).postMessage(

				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				(self as any).postMessage(

					type: "REQUEST_RESULT",
					id,
					response: responseText,);
catch (err: unknown)
				(self as unknown).postMessage(
catch (err: any)
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				(self as any).postMessage(

					type: "REQUEST_RESULT",
					id,
					response: `SHIORI/3.0 500 Internal Server Error\r\nCharset: UTF-8\r\nX-Error: $err.message\r\n\r\n`,);
			break;

		case "UNLOAD":
			try {
				if (shioriInstance) {

					const _unloadFn: unknown =
						(shioriInstance.exports.unload as unknown) ||
						(shioriInstance.exports.shiori_unload as unknown);

					// biome-ignore lint/suspicious/noExplicitAny: automated fix
					const unloadFn: any =
						// biome-ignore lint/suspicious/noExplicitAny: automated fix
						(shioriInstance.exports.unload as any) ||
						// biome-ignore lint/suspicious/noExplicitAny: automated fix
						(shioriInstance.exports.shiori_unload as any);

					if (typeof unloadFn === "function") {
						unloadFn();
					}
				}
			} catch (_e) {}
			shioriInstance = null;
			isLoaded = false;

			(self as unknown).postMessage(
				type: "UNLOAD_RESULT",
				id,
				success: true,);
			break;

		default:
			(self as unknown).postMessage(

			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(self as any).postMessage(type: "UNLOAD_RESULT", id, success: true );
			break;

		default:
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(self as any).postMessage(

				type: "ERROR",
				id,
				error: `Unknown message type: $type`,
			});
			break;
	}
});
