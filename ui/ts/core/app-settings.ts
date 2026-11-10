import { emit, invoke, isTauriAvailable } from "./tauri-helper.js";

export const settingsMethods = {
	loadSettings() {
		try {
			const saved = localStorage.getItem("nanai-android-mascot-settings");
			if (saved) {
				(this as unknown).settings = {
					...(this as unknown).settings,
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
			!!(this as unknown).settings.darkMode,
		);

		// シェル倍率 (50%〜200%)
		const scalePercent =
			parseInt((this as unknown).settings.shellScale, 10) || 100;
		if ((this as unknown).elements.ghostDisplay) {
			(this as unknown).elements.ghostDisplay.style.width =
				`${Math.round((200 * scalePercent) / 100)}px`;
			(this as unknown).elements.ghostDisplay.style.height =
				`${Math.round((400 * scalePercent) / 100)}px`;
		}
		if (isTauriAvailable()) {
			invoke("set_character_scale", { scalePercent }).catch(() => {});
		}

		// バルーン倍率
		const balloonPercent =
			parseInt((this as unknown).settings.balloonScale, 10) || 100;
		if ((this as unknown).elements.balloonDisplay) {
			(this as unknown).elements.balloonDisplay.style.transform =
				`translateX(-50%) scale(${balloonPercent / 100})`;
			(this as unknown).elements.balloonDisplay.style.transformOrigin =
				"top left";
		}

		(this as unknown).applyBalloonTheme();
	},

	applyBalloonTheme() {
		(this as unknown).setBalloonTheme(
			(this as unknown).settings.balloonTheme ||
				(this as unknown).currentBalloonTheme ||
				"default",
		);
	},

	showBalloon(text: string, scopeId: number = 0) {
		if (
			(this as unknown).elements.balloonText &&
			(this as unknown).elements.balloonDisplay
		) {
			(this as unknown).elements.balloonText.textContent = text;
			if (!isTauriAvailable()) {
				(this as unknown).elements.balloonDisplay.style.display = "block";
			}
		}
		if (isTauriAvailable()) {
			invoke("show_balloon_window", {
				scopeId,
				theme: (this as unknown).currentBalloonTheme,
			})
				.then(() => {
					emit(`update-balloon-content-${scopeId}`, {
						html: (this as unknown).elements.balloonText?.innerHTML || text,
						theme: (this as unknown).currentBalloonTheme || "default",
					});
				})
				.catch(() => {});
		}
	},

	hideBalloon(
		scopeId: number = 0,
		reason: "close" | "break" | "timeout" | "silent" = "close",
	) {
		if ((this as unknown).elements.balloonDisplay) {
			(this as unknown).elements.balloonDisplay.style.display = "none";
		}
		if (isTauriAvailable()) {
			invoke("hide_balloon_window", { scopeId }).catch(() => {});
		}
		if (reason === "close") {
			const lastScript = (this as unknown).sakuraPlayer?.lastScript || "";
			if ((this as unknown).ghostController?.sendBalloonCloseNotify) {
				void (this as unknown).ghostController.sendBalloonCloseNotify(
					lastScript,
					scopeId,
				);
			} else if ((this as unknown).ghostController?.sendShioriEvent) {
				void (this as unknown).ghostController.sendShioriEvent(
					"OnBalloonClose",
					[lastScript, String(scopeId)],
				);
			}
		} else if (reason === "break") {
			const lastScript = (this as unknown).sakuraPlayer?.lastScript || "";
			if ((this as unknown).ghostController?.sendBalloonBreakNotify) {
				void (this as unknown).ghostController.sendBalloonBreakNotify(
					lastScript,
					scopeId,
				);
			} else if ((this as unknown).ghostController?.sendShioriEvent) {
				void (this as unknown).ghostController.sendShioriEvent(
					"OnBalloonBreak",
					[lastScript, String(scopeId)],
				);
			}
		}
	},

	playSakuraScript(script: string) {
		return (this as unknown).sakuraPlayer.play(script);
	},

	startSecondTimer() {
		document.addEventListener("visibilitychange", () => {
			if (document.visibilityState === "visible") {
				(this as unknown).ghostController.sendShioriEvent(
					"OnWindowStateRestore",
				);
			}
		});
	},
};
