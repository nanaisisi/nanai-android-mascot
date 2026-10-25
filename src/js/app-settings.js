import { invoke, isTauriAvailable } from "./tauri-helper.js";

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
    this.setBalloonTheme(this.settings.balloonTheme || this.currentBalloonTheme || "classic");
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
    let secondCounter = 0;
    const talkInterval = 60 + Math.floor(Math.random() * 30);

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        this.ghostController.sendShioriEvent("OnWindowStateRestore");
      }
    });

    setInterval(async () => {
      secondCounter++;
      if (!this.ghostController.currentGhost) return;

      if (secondCounter % 60 === 0) {
        try {
          await this.ghostController.sendShioriEvent("OnMinuteChange");
        } catch (_e) {
          // エラー無視
        }
      }

      if (isTauriAvailable()) {
        try {
          await invoke("on_second_change");
        } catch (_error) {
          // SHIORI未ロードまたは非サポート時は無視
        }
      } else if (secondCounter >= talkInterval) {
        secondCounter = 0;
        if (!this.sakuraPlayer.isPlaying) {
          this.ghostController.sendShioriEvent("OnSecondChange");
        }
      }
    }, 1000);
  },
};
