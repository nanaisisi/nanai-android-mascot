/**
 * Mascot Nanai - ゴースト & SHIORI 管理モジュール
 */

export class GhostController {
  constructor(app) {
    this.app = app;
    this.ghosts = [];
    this.currentGhost = null;
  }

  async autoLoadGhost() {
    console.log("🔄 自動ゴースト読み込み開始...");
    try {
      const savedGhost = localStorage.getItem("mascot-nanai-current-ghost");
      if (savedGhost) {
        const ghostInfo = JSON.parse(savedGhost);
        const exists = await this.verifyGhostExists(ghostInfo);
        if (exists) {
          this.currentGhost = ghostInfo;
          this.updateGhostCharacter(ghostInfo.name);
          return;
        }
      }
      await this.scanAndLoadFirstGhost();
    } catch (error) {
      console.error("❌ 自動ゴースト読み込みエラー:", error);
      this.updateGhostCharacter("mock_nanai");
    }
  }

  async verifyGhostExists(ghostInfo) {
    if (!globalThis.__TAURI__) return false;
    try {
      const result = await globalThis.__TAURI__.invoke("scan_ghosts", {
        ghostPath: ghostInfo.path || "assets/ghost",
      });
      return result.ghosts?.some((g) => g.name === ghostInfo.name) || false;
    } catch (error) {
      console.error("ゴースト存在確認エラー:", error);
      return false;
    }
  }

  async scanAndLoadFirstGhost() {
    if (!globalThis.__TAURI__) {
      console.log("Tauri環境ではありません - デフォルトmock_nanaiを使用");
      this.selectGhost("mock_nanai");
      return;
    }

    try {
      const result = await globalThis.__TAURI__.invoke("scan_ghosts", {
        ghostPath: "assets/ghost",
      });
      this.ghosts = result.ghosts || [];
      if (this.ghosts.length > 0) {
        const defaultGhost = this.ghosts.find((g) => g.name === "mock_nanai") || this.ghosts[0];
        this.selectGhost(defaultGhost.name);
      } else {
        this.selectGhost("mock_nanai");
      }
    } catch (error) {
      console.error("❌ ゴーストスキャンエラー:", error);
      this.selectGhost("mock_nanai");
    }
  }

  selectGhost(ghostName) {
    const ghost = this.ghosts.find((g) => g.name === ghostName) || {
      name: ghostName,
      path: `assets/ghost/${ghostName}`,
    };

    this.currentGhost = ghost;
    this.updateCurrentGhostDisplay();
    this.updateGhostCharacter(ghostName);
    localStorage.setItem("mascot-nanai-current-ghost", JSON.stringify(ghost));

    this.initializeGhostSHIORI(ghost);
    this.app.showBalloon(`ゴースト「${ghostName}」を選択しました。`);
    setTimeout(() => this.app.hideBalloon(), 2000);
  }

  async initializeGhostSHIORI(ghost) {
    if (!globalThis.__TAURI__) return;
    try {
      console.log(`🎭 SHIORI初期化開始: ${ghost.name}`);
      await globalThis.__TAURI__.invoke("load_ghost", { ghostName: ghost.name });
      setTimeout(async () => {
        try {
          await this.sendShioriEvent("OnBoot");
        } catch (_) {}
      }, 1000);
    } catch (error) {
      console.error("❌ SHIORI初期化エラー:", error);
    }
  }

  async sendShioriEvent(eventName) {
    if (!globalThis.__TAURI__) {
      this.app.showBalloon("こんにちは！(モック)");
      setTimeout(() => this.app.hideBalloon(), 3000);
      return;
    }

    try {
      const response = await globalThis.__TAURI__.invoke("send_shiori_event", {
        event: eventName,
      });
      if (response && response.trim()) {
        this.app.showBalloon(response);
      } else {
        this.app.showBalloon("こんにちは！");
      }
      setTimeout(() => this.app.hideBalloon(), 3000);
    } catch (error) {
      console.error("❌ SHIORIイベントエラー:", error);
      this.app.showBalloon("こんにちは！");
      setTimeout(() => this.app.hideBalloon(), 3000);
    }
  }

  updateGhostCharacter(ghostName) {
    const placeholder = document.querySelector(".character-placeholder");
    if (!placeholder) return;

    if (!ghostName) {
      placeholder.innerHTML = "";
      return;
    }

    if (ghostName === "mock_nanai") {
      placeholder.innerHTML = `<img src="assets/ghost/mock_nanai/shell/master/surface0.png" 
                                     alt="${ghostName}" 
                                     style="width: 100%; height: 100%; object-fit: contain;" 
                                     onerror="console.error('画像読み込みエラー');">`;
    } else {
      placeholder.innerHTML = `<img src="assets/ghost/${ghostName}/shell/master/surface0.png" 
                                     alt="${ghostName}" 
                                     style="width: 100%; height: 100%; object-fit: contain;" 
                                     onerror="this.parentNode.innerHTML='👻';">`;
    }
    placeholder.title = ghostName || "";
  }

  updateCurrentGhostDisplay() {
    const currentGhostEl = document.getElementById("current-ghost");
    if (currentGhostEl) {
      currentGhostEl.textContent = this.currentGhost ? this.currentGhost.name : "未選択";
    }
  }
}
