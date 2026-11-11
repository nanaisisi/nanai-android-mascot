import { emit, invoke, isTauriAvailable } from "./tauri-helper.js";

export const settingsMethods = {
	loadSettings() {
		try {
			const saved = localStorage.getItem("nanai-android-mascot-settings");
			if (saved) {
				const app = this as unknown as import("../../main.js").NanaiAndroidMascotApp;
				app.settings = {
					...app.settings,
					...JSON.parse(saved),
				};
			}
		} catch (_error) {
			// 設定未保存またはパース失敗時はデフォルト維持
		}
	},

	applySettings() {
		const app = this as unknown as import("../../main.js").NanaiAndroidMascotApp;
		document.body.classList.toggle(
			"dark-mode",
			!!app.settings?.darkMode,
		);

		// シェル倍率 (50%〜200%)
		const scalePercent =
			parseInt(
				app.settings?.shellScale || "100",
				10,
			) || 100;
		const ghostDisplay = app.elements?.ghostDisplay;
		if (ghostDisplay) {
			ghostDisplay.style.width =
				`${Math.round((200 * scalePercent) / 100)}px`;
			ghostDisplay.style.height =
				`${Math.round((400 * scalePercent) / 100)}px`;
		}
		if (isTauriAvailable()) {
			invoke("set_character_scale", { scalePercent }).catch(() => {});
		}

		// バルーン倍率
		const balloonPercent =
			parseInt(
				app.settings?.balloonScale || "100",
				10,
			) || 100;
		const balloonDisplay = app.elements?.balloonDisplay;
		if (balloonDisplay) {
			balloonDisplay.style.transform =
				`translateX(-50%) scale(${balloonPercent / 100})`;
			balloonDisplay.style.transformOrigin = "top left";
		}

		app.applyBalloonTheme?.();
	},

	applyBalloonTheme() {
		const app = this as unknown as import("../../main.js").NanaiAndroidMascotApp;
		app.setBalloonTheme?.(
			app.settings?.balloonTheme ||
				app.currentBalloonTheme ||
				"default",
		);
	},

	showBalloon(text: string, scopeId: number = 0) {
		const app = this as unknown as import("../../main.js").NanaiAndroidMascotApp;
		const balloonText = app.elements?.balloonText;
		const balloonDisplay = app.elements?.balloonDisplay;
		if (balloonText && balloonDisplay) {
			balloonText.textContent = text;
			if (!isTauriAvailable()) {
				balloonDisplay.style.display = "block";
			}
		}
		if (isTauriAvailable()) {
			invoke("show_balloon_window", {
				scopeId,
				theme: app.currentBalloonTheme,
			})
				.then(() => {
					emit(`update-balloon-content-${scopeId}`, {
						html: app.elements?.balloonText?.innerHTML || text,
						theme: app.currentBalloonTheme || "default",
					});
				})
				.catch(() => {});
		}
	},

	hideBalloon(
		scopeId: number = 0,
		reason: "close" | "break" | "timeout" | "silent" = "close",
	) {
		const app = this as unknown as import("../../main.js").NanaiAndroidMascotApp;
		const balloonDisplay = app.elements?.balloonDisplay;
		if (balloonDisplay) {
			balloonDisplay.style.display = "none";
		}
		if (isTauriAvailable()) {
			invoke("hide_balloon_window", { scopeId }).catch(() => {});
		}
		if (reason === "close") {
			const lastScript = app.sakuraPlayer?.lastScript || "";
			const gc = app.ghostController;
			if (gc?.sendBalloonCloseNotify) {
				void gc.sendBalloonCloseNotify(lastScript, scopeId);
			} else if (gc?.sendShioriEvent) {
				void gc.sendShioriEvent("OnBalloonClose", [
					lastScript,
					String(scopeId),
				]);
			}
		} else if (reason === "break") {
			const lastScript = app.sakuraPlayer?.lastScript || "";
			const gc = app.ghostController;
			if (gc?.sendBalloonBreakNotify) {
				void gc.sendBalloonBreakNotify(lastScript, scopeId);
			} else if (gc?.sendShioriEvent) {
				void gc.sendShioriEvent("OnBalloonBreak", [
					lastScript,
					String(scopeId),
				]);
			}
		}
	},

	playSakuraScript(script: string) {
		const app = this as unknown as import("../../main.js").NanaiAndroidMascotApp;
		return app.sakuraPlayer?.play(script);
	},

	startSecondTimer() {
		document.addEventListener("visibilitychange", () => {
			if (document.visibilityState === "visible") {
				const app = this as unknown as import("../../main.js").NanaiAndroidMascotApp;
				void app.ghostController?.sendShioriEvent?.("OnWindowStateRestore");
			}
		});
	},
};
