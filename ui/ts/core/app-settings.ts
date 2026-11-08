import { emit, invoke, isTauriAvailable } from "./tauri-helper.js";

export const settingsMethods = {
	loadSettings() {
		try {
			const saved = localStorage.getItem("nanai-android-mascot-settings");
			if (saved) {
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				(this as any).settings = {
					// biome-ignore lint/suspicious/noExplicitAny: automated fix
					...(this as any).settings,
					...JSON.parse(saved),
				};
			}
		} catch (_error) {
			// 設定未保存またはパース失敗時はデフォルト維持
		}
	},

	applySettings() {
		document.body.classList.toggle(
			"dark-mode",
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			!!(this as any).settings.darkMode,
		);

		// シェル倍率 (50%〜200%)
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const scalePercent = parseInt((this as any).settings.shellScale, 10) || 100;
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		if ((this as any).elements.ghostDisplay) {
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).elements.ghostDisplay.style.width =
				`${Math.round((200 * scalePercent) / 100)}px`;
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).elements.ghostDisplay.style.height =
				`${Math.round((400 * scalePercent) / 100)}px`;
		}
		if (isTauriAvailable()) {
			invoke("set_character_scale", { scalePercent }).catch(() => {});
		}

		// バルーン倍率
		const balloonPercent =
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			parseInt((this as any).settings.balloonScale, 10) || 100;
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		if ((this as any).elements.balloonDisplay) {
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).elements.balloonDisplay.style.transform =
				`translateX(-50%) scale(${balloonPercent / 100})`;
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).elements.balloonDisplay.style.transformOrigin =
				"bottom center";
		}

		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		(this as any).applyBalloonTheme();
	},

	applyBalloonTheme() {
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		(this as any).setBalloonTheme(
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).settings.balloonTheme ||
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				(this as any).currentBalloonTheme ||
				"default",
		);
	},

	showBalloon(text: string, scopeId: number = 0) {
		if (
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).elements.balloonText &&
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).elements.balloonDisplay
		) {
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).elements.balloonText.textContent = text;
			if (!isTauriAvailable()) {
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				(this as any).elements.balloonDisplay.style.display = "block";
			}
		}
		if (isTauriAvailable()) {
			invoke("show_balloon_window", {
				scopeId,
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				theme: (this as any).currentBalloonTheme,
			})
				.then(() => {
					emit(`update-balloon-content-${scopeId}`, {
						// biome-ignore lint/suspicious/noExplicitAny: automated fix
						html: (this as any).elements.balloonText?.innerHTML || text,
						// biome-ignore lint/suspicious/noExplicitAny: automated fix
						theme: (this as any).currentBalloonTheme || "default",
					});
				})
				.catch(() => {});
		}
	},

	hideBalloon(
		scopeId: number = 0,
		reason: "close" | "break" | "timeout" | "silent" = "close",
	) {
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		if ((this as any).elements.balloonDisplay) {
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).elements.balloonDisplay.style.display = "none";
		}
		if (isTauriAvailable()) {
			invoke("hide_balloon_window", { scopeId }).catch(() => {});
		}
		if (reason === "close") {
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			const lastScript = (this as any).sakuraPlayer?.lastScript || "";
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			if ((this as any).ghostController?.sendBalloonCloseNotify) {
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				void (this as any).ghostController.sendBalloonCloseNotify(
					lastScript,
					scopeId,
				);
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
			} else if ((this as any).ghostController?.sendShioriEvent) {
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				void (this as any).ghostController.sendShioriEvent("OnBalloonClose", [
					lastScript,
					String(scopeId),
				]);
			}
		} else if (reason === "break") {
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			const lastScript = (this as any).sakuraPlayer?.lastScript || "";
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			if ((this as any).ghostController?.sendBalloonBreakNotify) {
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				void (this as any).ghostController.sendBalloonBreakNotify(
					lastScript,
					scopeId,
				);
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
			} else if ((this as any).ghostController?.sendShioriEvent) {
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				void (this as any).ghostController.sendShioriEvent("OnBalloonBreak", [
					lastScript,
					String(scopeId),
				]);
			}
		}
	},

	playSakuraScript(script: string) {
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		return (this as any).sakuraPlayer.play(script);
	},

	startSecondTimer() {
		document.addEventListener("visibilitychange", () => {
			if (document.visibilityState === "visible") {
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				(this as any).ghostController.sendShioriEvent("OnWindowStateRestore");
			}
		});
	},
};
