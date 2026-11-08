import { emit, invoke, isTauriAvailable } from "./tauri-helper.js";

export const settingsMethods = {
	loadSettings() {
		try {
			const saved = localStorage.getItem("nanai-android-mascot-settings");
			if (saved) {
<<<<<<< HEAD
				(this as unknown).settings = 
					...(this as unknown).settings,
=======
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				(this as any).settings = 
					// biome-ignore lint/suspicious/noExplicitAny: automated fix
					...(this as any).settings,
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
					...JSON.parse(saved),;
		} catch (_error) {
			// 設定未保存またはパース失敗時はデフォルト維持
		}
	},

	applySettings() {
		document.body.classList.toggle(
			"dark-mode",
<<<<<<< HEAD
			!!(this as unknown).settings.darkMode,
		);

		// シェル倍率 (50%〜200%)
		const _scalePercent =
			parseInt((this as unknown).settings.shellScale, 10) || 100;
		if ((this as unknown).elements.ghostDisplay) {
			(this as unknown).elements.ghostDisplay.style.width =
				`${Math.round((200 * scalePercent) / 100)}px`;
			(this as unknown).elements.ghostDisplay.style.height =
=======
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
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
				`${Math.round((400 * scalePercent) / 100)}px`;
		}
		if (isTauriAvailable()) {
			invoke("set_character_scale", { scalePercent }).catch(() => {});
		}

		// バルーン倍率
		const balloonPercent =
<<<<<<< HEAD
			parseInt((this as unknown).settings.balloonScale, 10) || 100;
		if ((this as unknown).elements.balloonDisplay) {
			(this as unknown).elements.balloonDisplay.style.transform =
				`translateX(-50%) scale(${balloonPercent / 100})`;
			(this as unknown).elements.balloonDisplay.style.transformOrigin =
				"bottom center";
		}

		(this as unknown).applyBalloonTheme();
	},

	applyBalloonTheme() 
		(this as unknown).setBalloonTheme(
			(this as unknown).settings.balloonTheme ||
				(this as unknown).currentBalloonTheme ||
=======
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
		(this as any).applyBalloonTheme();,

	applyBalloonTheme() 
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		(this as any).setBalloonTheme(
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).settings.balloonTheme ||
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				(this as any).currentBalloonTheme ||
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
				"default",
		);,

	showBalloon(text: string, scopeId: number = 0) 
		if (
<<<<<<< HEAD
			(this as unknown).elements.balloonText &&
			(this as unknown).elements.balloonDisplay
		) {
			(this as unknown).elements.balloonText.textContent = text;
			if (!isTauriAvailable()) {
				(this as unknown).elements.balloonDisplay.style.display = "block";
=======
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).elements.balloonText &&
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).elements.balloonDisplay
		) 
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).elements.balloonText.textContent = text;
			if (!isTauriAvailable()) {
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				(this as any).elements.balloonDisplay.style.display = "block";
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
			}
		if (isTauriAvailable()) {
			invoke("show_balloon_window", {
				scopeId,
<<<<<<< HEAD
				theme: (this as unknown).currentBalloonTheme,
			})
				.then(() => 
					emit(`update-balloon-content-$scopeId`, {
						html: (this as unknown).elements.balloonText?.innerHTML || text,
						theme: (this as unknown).currentBalloonTheme || "default",
=======
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				theme: (this as any).currentBalloonTheme,)
				.then(() => 
					emit(`update-balloon-content-$scopeId`, {
						// biome-ignore lint/suspicious/noExplicitAny: automated fix
						html: (this as any).elements.balloonText?.innerHTML || text,
						// biome-ignore lint/suspicious/noExplicitAny: automated fix
						theme: (this as any).currentBalloonTheme || "default",
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad);
				})
				.catch(() => );
		},

	hideBalloon(
		scopeId: number = 0,
		reason: "close" | "break" | "timeout" | "silent" = "close",
	) 
<<<<<<< HEAD
		if ((this as unknown).elements.balloonDisplay) {
			(this as unknown).elements.balloonDisplay.style.display = "none";
=======
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		if ((this as any).elements.balloonDisplay) {
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).elements.balloonDisplay.style.display = "none";
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
		}
		if (isTauriAvailable()) {
			invoke("hide_balloon_window", { scopeId }).catch(() => {});
		}
		if (reason === "close") {
<<<<<<< HEAD
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
=======
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
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
			}
		}
	},

	playSakuraScript(script: string) 
<<<<<<< HEAD
		return (this as unknown).sakuraPlayer.play(script);
=======
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		return (this as any).sakuraPlayer.play(script);
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad,

	startSecondTimer() 
		document.addEventListener("visibilitychange", () => {
			if (document.visibilityState === "visible") {
<<<<<<< HEAD
				(this as unknown).ghostController.sendShioriEvent(
					"OnWindowStateRestore",
				);
=======
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				(this as any).ghostController.sendShioriEvent("OnWindowStateRestore");
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
			}
		});,
};
