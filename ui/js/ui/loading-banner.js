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

if (globalThis.__TAURI__) {
	const listenFn =
		globalThis.__TAURI__.event?.listen || globalThis.__TAURI__.listen;
	if (typeof listenFn === "function") {
		listenFn("update-loading-banner", (event) => {
			const data = event.payload;
			if (data?.name && nameEl) nameEl.textContent = data.name;
			if (data?.version && verEl) verEl.textContent = `v${data.version}`;
		});
	}
}
