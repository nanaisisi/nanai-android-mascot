import { emit, invoke, isTauriAvailable } from "./tauri-helper.js";

export const settingsMethods = {
	loadSettings() {
		try {
			const saved = localStorage.getItem("nanai-android-mascot-settings");
			if (saved) {
				(this as import("../../../main.js").NanaiAndroidMascotApp).settings = {
					...(this as import("../../../main.js").NanaiAndroidMascotApp)
						.settings,
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
			!!(this as import("../../../main.js").NanaiAndroidMascotApp).settings
				.darkMode,
		);

		// シェル倍率 (50%〜200%)
		const scalePercent =
			parseInt(
				(this as import("../../../main.js").NanaiAndroidMascotApp).settings
					.shellScale,
				10,
			) || 100;
		if (
			(this as import("../../../main.js").NanaiAndroidMascotApp).elements
				.ghostDisplay
		) {
			(
				this as import("../../../main.js").NanaiAndroidMascotApp
			).elements.ghostDisplay.style.width =
				`${Math.round((200 * scalePercent) / 100)}px`;
			(
				this as import("../../../main.js").NanaiAndroidMascotApp
			).elements.ghostDisplay.style.height =
				`${Math.round((400 * scalePercent) / 100)}px`;
		}
		if (isTauriAvailable()) {
			invoke("set_character_scale", { scalePercent }).catch(() => {});
		}

		// バルーン倍率
		const balloonPercent =
			parseInt(
				(this as import("../../../main.js").NanaiAndroidMascotApp).settings
					.balloonScale,
				10,
			) || 100;
		if (
			(this as import("../../../main.js").NanaiAndroidMascotApp).elements
				.balloonDisplay
		) {
			(
				this as import("../../../main.js").NanaiAndroidMascotApp
			).elements.balloonDisplay.style.transform =
				`translateX(-50%) scale(${balloonPercent / 100})`;
			(
				this as import("../../../main.js").NanaiAndroidMascotApp
			).elements.balloonDisplay.style.transformOrigin = "top left";
		}

		(
			this as import("../../../main.js").NanaiAndroidMascotApp
		).applyBalloonTheme();
	},

	applyBalloonTheme() {
		(this as import("../../../main.js").NanaiAndroidMascotApp).setBalloonTheme(
			(this as import("../../../main.js").NanaiAndroidMascotApp).settings
				.balloonTheme ||
				(this as import("../../../main.js").NanaiAndroidMascotApp)
					.currentBalloonTheme ||
				"default",
		);
	},

	showBalloon(text: string, scopeId: number = 0) {
		if (
			(this as import("../../../main.js").NanaiAndroidMascotApp).elements
				.balloonText &&
			(this as import("../../../main.js").NanaiAndroidMascotApp).elements
				.balloonDisplay
		) {
			(
				this as import("../../../main.js").NanaiAndroidMascotApp
			).elements.balloonText.textContent = text;
			if (!isTauriAvailable()) {
				(
					this as import("../../../main.js").NanaiAndroidMascotApp
				).elements.balloonDisplay.style.display = "block";
			}
		}
		if (isTauriAvailable()) {
			invoke("show_balloon_window", {
				scopeId,
				theme: (this as import("../../../main.js").NanaiAndroidMascotApp)
					.currentBalloonTheme,
			})
				.then(() => {
					emit(`update-balloon-content-${scopeId}`, {
						html:
							(this as import("../../../main.js").NanaiAndroidMascotApp)
								.elements.balloonText?.innerHTML || text,
						theme:
							(this as import("../../../main.js").NanaiAndroidMascotApp)
								.currentBalloonTheme || "default",
					});
				})
				.catch(() => {});
		}
	},

	hideBalloon(
		scopeId: number = 0,
		reason: "close" | "break" | "timeout" | "silent" = "close",
	) {
		if (
			(this as import("../../../main.js").NanaiAndroidMascotApp).elements
				.balloonDisplay
		) {
			(
				this as import("../../../main.js").NanaiAndroidMascotApp
			).elements.balloonDisplay.style.display = "none";
		}
		if (isTauriAvailable()) {
			invoke("hide_balloon_window", { scopeId }).catch(() => {});
		}
		if (reason === "close") {
			const lastScript =
				(this as import("../../../main.js").NanaiAndroidMascotApp).sakuraPlayer
					?.lastScript || "";
			if (
				(this as import("../../../main.js").NanaiAndroidMascotApp)
					.ghostController?.sendBalloonCloseNotify
			) {
				void (
					this as import("../../../main.js").NanaiAndroidMascotApp
				).ghostController.sendBalloonCloseNotify(lastScript, scopeId);
			} else if (
				(this as import("../../../main.js").NanaiAndroidMascotApp)
					.ghostController?.sendShioriEvent
			) {
				void (
					this as import("../../../main.js").NanaiAndroidMascotApp
				).ghostController.sendShioriEvent("OnBalloonClose", [
					lastScript,
					String(scopeId),
				]);
			}
		} else if (reason === "break") {
			const lastScript =
				(this as import("../../../main.js").NanaiAndroidMascotApp).sakuraPlayer
					?.lastScript || "";
			if (
				(this as import("../../../main.js").NanaiAndroidMascotApp)
					.ghostController?.sendBalloonBreakNotify
			) {
				void (
					this as import("../../../main.js").NanaiAndroidMascotApp
				).ghostController.sendBalloonBreakNotify(lastScript, scopeId);
			} else if (
				(this as import("../../../main.js").NanaiAndroidMascotApp)
					.ghostController?.sendShioriEvent
			) {
				void (
					this as import("../../../main.js").NanaiAndroidMascotApp
				).ghostController.sendShioriEvent("OnBalloonBreak", [
					lastScript,
					String(scopeId),
				]);
			}
		}
	},

	playSakuraScript(script: string) {
		return (
			this as import("../../../main.js").NanaiAndroidMascotApp
		).sakuraPlayer.play(script);
	},

	startSecondTimer() {
		document.addEventListener("visibilitychange", () => {
			if (document.visibilityState === "visible") {
				(
					this as import("../../../main.js").NanaiAndroidMascotApp
				).ghostController.sendShioriEvent("OnWindowStateRestore");
			}
		});
	},
};
