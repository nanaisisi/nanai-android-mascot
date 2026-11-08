import { emit, invoke, isTauriAvailable } from "../../core/tauri-helper.js";

export async function initBalloonWindows(
	app: any,
	_tokens: any[],
	hasTextContent: boolean,
	shownScopes: Set<number>,
) {
	if (!hasTextContent) return;
	const sakuraText = app.elements.balloonText;
	const keroText = app.elements.keroBalloonText;
	const sakuraDisplay = app.elements.balloonDisplay;

	sakuraText.innerHTML = "";
	if (keroText) keroText.innerHTML = "";
	if (!isTauriAvailable()) {
		sakuraDisplay.style.display = "block";
	}
	if (isTauriAvailable()) {
		shownScopes.add(0);
		await invoke("show_balloon_window", {
			scopeId: 0,
			theme: app.currentBalloonTheme,
		})
			.then(() => {
				emit("update-balloon-content-0", {
					html: sakuraText.innerHTML || "",
					theme: app.currentBalloonTheme || "default",
				});
			})
			.catch(() => {});
	}
}
