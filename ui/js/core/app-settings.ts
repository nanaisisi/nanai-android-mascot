import { emit, invoke, isTauriAvailable } from "./tauri-helper.js";

export const settingsMethods = {
	loadSettings() {
		try {
			const saved = localStorage.getItem("nanai-android-mascot-settings");
			if (saved) {
				(this as any).settings = { ...(this as any).settings, ...JSON.parse(saved) };
			}
		} catch (_error) {
			// 設定未保存またはパース失敗時はデフォルト維持
		}
	},

	applySettings() {
		document.body.classList.toggle("dark-mode", !!(this as any).settings.darkMode);

		// シェル倍率 (50%〜200%)
		const scalePercent = parseInt((this as any).settings.shellScale, 10) || 100;
		if ((this as any).elements.ghostDisplay) {
			(this as any).elements.ghostDisplay.style.width = `${Math.round((200 * scalePercent) / 100)}px`;
			(this as any).elements.ghostDisplay.style.height = `${Math.round((400 * scalePercent) / 100)}px`;
		}
		if (isTauriAvailable()) {
			invoke("set_character_scale", { scalePercent }).catch(() => {});
		}

		// バルーン倍率
		const balloonPercent = parseInt((this as any).settings.balloonScale, 10) || 100;
		if ((this as any).elements.balloonDisplay) {
			(this as any).elements.balloonDisplay.style.transform = `translateX(-50%) scale(${balloonPercent / 100})`;
			(this as any).elements.balloonDisplay.style.transformOrigin = "bottom center";
		}

		(this as any).applyBalloonTheme();
	},

	applyBalloonTheme() {
		(this as any).setBalloonTheme(
			(this as any).settings.balloonTheme || (this as any).currentBalloonTheme || "default",
		);
	},

	showBalloon(text: string, scopeId: number = 0) {
		if ((this as any).elements.balloonText && (this as any).elements.balloonDisplay) {
			(this as any).elements.balloonText.textContent = text;
			if (!isTauriAvailable()) {
				(this as any).elements.balloonDisplay.style.display = "block";
			}
		}
		if (isTauriAvailable()) {
			invoke("show_balloon_window", {
				scopeId,
				theme: (this as any).currentBalloonTheme,
			})
				.then(() => {
					emit(`update-balloon-content-${scopeId}`, {
						html: (this as any).elements.balloonText?.innerHTML || text,
						theme: (this as any).currentBalloonTheme || "default",
					});
				})
				.catch(() => {});
		}
	},

	hideBalloon(scopeId: number = 0) {
		if ((this as any).elements.balloonDisplay) {
			(this as any).elements.balloonDisplay.style.display = "none";
		}
		if (isTauriAvailable()) {
			invoke("hide_balloon_window", { scopeId }).catch(() => {});
		}
	},

	playSakuraScript(script: string) {
		return (this as any).sakuraPlayer.play(script);
	},

	startSecondTimer() {
		document.addEventListener("visibilitychange", () => {
			if (document.visibilityState === "visible") {
				(this as any).ghostController.sendShioriEvent("OnWindowStateRestore");
			}
		});
	},
};
