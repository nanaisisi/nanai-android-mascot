import {
	invoke,
	isNativeMultiWindow,
	isOverlayWindow,
	isTauriAvailable,
} from "../core/tauri-helper.js";

function setInlineBannerVisible(
	visible: boolean,
	ghostName?: string,
	version?: string,
): void {
	if (typeof document === "undefined") return;
	const host = document.getElementById("android-loading-banner");
	if (!host) return;
	if (!visible) {
		host.hidden = true;
		return;
	}
	const nameEl = document.getElementById("android-banner-ghost-name");
	if (nameEl && ghostName) {
		nameEl.textContent = ghostName;
	}
	const verEl = document.getElementById("android-banner-version");
	if (verEl && version) {
		verEl.textContent = version.startsWith("v") ? version : `v${version}`;
	}
	host.hidden = false;
}

export async function showLoadingBanner(
	ghostName?: string,
	version?: string,
): Promise<void> {
	if (!isOverlayWindow() && !isNativeMultiWindow()) {
		setInlineBannerVisible(true, ghostName, version);
		return;
	}
	if (isTauriAvailable()) {
		await invoke("show_loading_banner_window", { ghostName });
	}
}

export async function hideLoadingBanner(): Promise<void> {
	setInlineBannerVisible(false);
	if (isTauriAvailable() && isNativeMultiWindow() && !isOverlayWindow()) {
		await invoke("hide_loading_banner_window");
	}
}
