import { emit, invoke, isTauriAvailable } from "../../core/tauri-helper.js";

export async function initBalloonWindows(
	app: import("../../../main.js").NanaiAndroidMascotApp,
	_tokens: unknown[],
	hasTextContent: boolean,
	shownScopes: Set<number>,
) {
	if (!hasTextContent) return;
	const sakuraText = app.elements?.balloonText;
	const keroText = app.elements?.keroBalloonText;
	const sakuraDisplay = app.elements?.balloonDisplay as
		| { style?: Record<string, string>; [key: string]: unknown }
		| undefined;

	if (sakuraText) sakuraText.innerHTML = "";
	if (keroText) keroText.innerHTML = "";
	if (!isTauriAvailable()) {
		if (sakuraDisplay) {
			if (!sakuraDisplay.style) sakuraDisplay.style = {};
			sakuraDisplay.style.display = "block";
		}
	}
	if (isTauriAvailable()) {
		shownScopes.add(0);
		await invoke("show_balloon_window", {
			scopeId: 0,
			theme: app.currentBalloonTheme,
		})
			.then(() => {
				emit("update-balloon-content-0", {
					html: sakuraText?.innerHTML || "",
					theme: app.currentBalloonTheme || "default",
				});
			})
			.catch(() => {});
	}
}
