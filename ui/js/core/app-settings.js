export const settingsMethods = {
	loadSettings() {
		try {
			const saved = localStorage.getItem("nanai-android-mascot-settings");
			if (saved) {
				this.settings = { ...this.settings, ...JSON.parse(saved) };
			}
		} catch (_error) {
			// 設定未保存またはパース失敗時はデフォルト維持
		}
	},

	applySettings() {
		document.body.classList.toggle("dark-mode", !!this.settings.darkMode);

		// シェル倍率 (50%〜200%)
		const scalePercent = parseInt(this.settings.shellScale, 10) || 100;
		if (this.elements.ghostDisplay) {
			this.elements.ghostDisplay.style.width = `${Math.round((200 * scalePercent) / 100)}px`;
			this.elements.ghostDisplay.style.height = `${Math.round((400 * scalePercent) / 100)}px`;
		}

		// バルーン倍率
		const balloonPercent = parseInt(this.settings.balloonScale, 10) || 100;
		if (this.elements.balloonDisplay) {
			this.elements.balloonDisplay.style.transform = `translateX(-50%) scale(${balloonPercent / 100})`;
			this.elements.balloonDisplay.style.transformOrigin = "bottom center";
		}

		this.applyBalloonTheme();
	},

	applyBalloonTheme() {
		this.setBalloonTheme(
			this.settings.balloonTheme || this.currentBalloonTheme || "default",
		);
	},

	showBalloon(text) {
		if (this.elements.balloonText && this.elements.balloonDisplay) {
			this.elements.balloonText.textContent = text;
			this.elements.balloonDisplay.style.display = "block";
		}
	},

	hideBalloon() {
		if (this.elements.balloonDisplay) {
			this.elements.balloonDisplay.style.display = "none";
		}
	},

	playSakuraScript(script) {
		return this.sakuraPlayer.play(script);
	},

	startSecondTimer() {
		document.addEventListener("visibilitychange", () => {
			if (document.visibilityState === "visible") {
				this.ghostController.sendShioriEvent("OnWindowStateRestore");
			}
		});
	},
};
