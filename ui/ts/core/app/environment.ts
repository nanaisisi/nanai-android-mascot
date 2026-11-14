import { actionMethods } from "../app-actions.js";
import { invoke, isTauriAvailable } from "../tauri-helper.js";

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

export function initUIEnvironment(appContext: {
	elements: Record<string, HTMLElement | null>;
}): void {
	if (isTauriAvailable()) {
		const menuBtn = document.getElementById("menu-btn");
		if (menuBtn) menuBtn.style.display = "none";
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
		quickBubble: "quick-bubble",
		quickActionsPanel: "quick-actions-panel",
	};
	appContext.elements = Object.fromEntries(
		Object.entries(ids).map(([key, id]) => [key, document.getElementById(id)]),
	);
}
