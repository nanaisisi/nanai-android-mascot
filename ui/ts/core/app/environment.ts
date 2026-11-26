import { actionMethods } from "../app-actions.js";
import {
	invoke,
	isOverlayWindow,
	isSinglePageUi,
	isTauriAvailable,
} from "../tauri-helper.js";

export async function scanBalloons(appContext: {
	scanBalloons?: () => Promise<unknown[]>;
}): Promise<unknown[]> {
	return (
		(
			actionMethods as unknown as Record<string, () => Promise<unknown[]>>
		).scanBalloons?.call(appContext) || []
	);
}

export async function scanPlugins(appContext: {
	availablePlugins?: unknown[];
}): Promise<void> {
	if (!isTauriAvailable()) return;
	try {
		const plugins = await invoke<string[]>("scan_plugins");
		if (Array.isArray(plugins) && plugins.length > 0) {
			appContext.availablePlugins = plugins;
			console.log("✨ プラグインスキャン完了:", plugins.length);
		}
	} catch (e) {
		console.error("プラグインスキャン失敗:", e);
	}
}

const BG_STORAGE_KEY = "nanai_android_bg_image";

export function applyAndroidBackgroundImage(dataUrl?: string | null): void {
	if (typeof document === "undefined" || !document.body) return;
	const url =
		dataUrl !== undefined ? dataUrl : localStorage.getItem(BG_STORAGE_KEY);
	if (url) {
		document.body.style.backgroundImage = `url("${url}")`;
		document.body.style.backgroundSize = "cover";
		document.body.style.backgroundPosition = "center";
		document.body.style.backgroundRepeat = "no-repeat";
	} else {
		document.body.style.backgroundImage = "";
	}
}

export function saveAndroidBackgroundImage(dataUrl: string | null): void {
	if (dataUrl) {
		localStorage.setItem(BG_STORAGE_KEY, dataUrl);
	} else {
		localStorage.removeItem(BG_STORAGE_KEY);
	}
	applyAndroidBackgroundImage(dataUrl);
}

export function initUIEnvironment(appContext: {
	elements: Record<string, HTMLElement | null>;
}): void {
	if (isTauriAvailable() && !isSinglePageUi()) {
		const menuBtn = document.getElementById("menu-btn");
		if (menuBtn) menuBtn.style.display = "none";
		const androidMenuBtn = document.getElementById("android-menu-btn");
		if (androidMenuBtn) androidMenuBtn.style.display = "none";
	}
	if (isOverlayWindow() && typeof document !== "undefined" && document.body) {
		document.body.classList.add("is-android-overlay");
		const toggleOverlayBtn = document.getElementById(
			"android-toggle-overlay-btn",
		);
		if (toggleOverlayBtn) {
			toggleOverlayBtn.textContent = "📱 アプリ画面へ戻る";
		}
	}
	if (isSinglePageUi() && !isOverlayWindow()) {
		applyAndroidBackgroundImage();
	}
	const ids: Record<string, string> = {
		ghostDisplay: "ghost-display",
		ghostCharacter: "ghost-character",
		keroDisplay: "kero-display",
		keroCharacter: "kero-character",
		sakuraSlot: "sakura-slot",
		keroSlot: "kero-slot",
		balloonDisplay: "balloon-display",
		balloonText: "balloon-text",
		keroBalloonDisplay: "kero-balloon-display",
		keroBalloonText: "kero-balloon-text",
		menuContainer: "menu-iframe-container",
		menuBtn: "menu-btn",
		androidMenuBtn: "android-menu-btn",
		androidMenuPanel: "android-menu-panel",
		quickBubble: "quick-bubble",
		quickActionsPanel: "quick-actions-panel",
	};
	appContext.elements = Object.fromEntries(
		Object.entries(ids).map(([key, id]) => [key, document.getElementById(id)]),
	);
}
