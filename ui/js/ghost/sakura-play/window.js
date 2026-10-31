import { invoke, isTauriAvailable } from "../../core/tauri-helper.js";

export async function initBalloonWindows(app, tokens, hasTextContent, shownScopes) {
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
		const winPromises = [
			invoke("show_balloon_window", {
				scopeId: 0,
				theme: app.currentBalloonTheme,
			}).catch(() => {}),
		];
		const hasKero = tokens.some((t) => t.type === "scope" && t.value >= 1);
		if (hasKero) {
			shownScopes.add(1);
			winPromises.push(
				invoke("show_balloon_window", {
					scopeId: 1,
					theme: app.currentBalloonTheme,
				}).catch(() => {}),
			);
		}
		await Promise.all(winPromises);
	}
}
