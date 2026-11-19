/**
 * Nanai Android Mascot - Loading Banner Controller
 */
const params = new URLSearchParams(globalThis.location.search);
const nameEl = document.getElementById("banner-ghost-name");
const verEl = document.getElementById("banner-version");

if (params.get("name") && nameEl) {
	nameEl.textContent = params.get("name");
}
if (params.get("version") && verEl) {
	verEl.textContent = `v${params.get("version")}`;
}

interface LoadingBannerPayload {
	name?: string;
	version?: string;
}

interface LoadingBannerTauri {
	event?: {
		listen?: (
			event: string,
			handler: (event: { payload?: LoadingBannerPayload }) => void,
		) => unknown;
	};
	listen?: (
		event: string,
		handler: (event: { payload?: LoadingBannerPayload }) => void,
	) => unknown;
	window?: {
		getCurrentWindow?: () => {
			startDragging?: () => Promise<void>;
		};
	};
}

const tauriApi = globalThis.__TAURI__ as unknown as
	| LoadingBannerTauri
	| undefined;

if (tauriApi) {
	const listenFn = tauriApi.event?.listen || tauriApi.listen;
	if (typeof listenFn === "function") {
		listenFn("update-loading-banner", (event) => {
			const data = event.payload;
			if (data?.name && nameEl) nameEl.textContent = data.name;
			if (data?.version && verEl) verEl.textContent = `v${data.version}`;
		});
	}

	const startDraggingFn = tauriApi.window?.getCurrentWindow?.()?.startDragging;
	if (typeof startDraggingFn === "function") {
		document.body.addEventListener("mousedown", (e) => {
			if (e.button === 0) {
				void startDraggingFn();
			}
		});
		document.body.addEventListener(
			"touchstart",
			() => {
				void startDraggingFn();
			},
			{ passive: true },
		);
	}
}

export {};
