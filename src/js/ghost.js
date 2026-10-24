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
    this.app.surfaceManager.loadSurfacesTxt(ghost.path || `assets/ghost/${ghostName}`);
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
        } catch (_error) {
          // OnBoot送信失敗時はスキップ
        }
      }, 1000);
    } catch (error) {
      console.error("❌ SHIORI初期化エラー:", error);
    }
  }

  async sendShioriEvent(eventName, args = []) {
    if (!globalThis.__TAURI__) {
      // モック対話（さくらスクリプトテスト用）
      if (eventName === "OnChoiceSelect") {
        this.app.playSakuraScript(`\\0\\s0選択肢「${args[1] || args[0]}」が選ばれたよ！\\w5\\nありがとう♪\\e`);
      } else if (eventName === "OnMouseClick") {
        const part = args[1];
        if (part === "head") {
          this.app.playSakuraScript("\\0\\s0あたまをなでてくれたの？\\w5\\nえへへ…♪\\e");
        } else if (part === "bust") {
          this.app.playSakuraScript("\\0\\s10ちょ、ちょっと…！\\w5\\nどこ触ってるの…！\\e");
        } else if (part === "skirt") {
          this.app.playSakuraScript("\\0\\s10きゃっ！\\w5\\nめくっちゃダメだよ！\\e");
        } else {
          this.app.playSakuraScript("\\0\\s0こんにちは！\\w5\\n\\q[話しかける,Talk]\\n\\q[なでる,Stroke]\\e");
        }
      } else if (eventName === "OnMouseMove") {
        const part = args[1];
        if (part === "head") {
          this.app.playSakuraScript("\\0\\s0ん…なでなで、きもちいい…♪\\e");
        } else if (part === "bust") {
          this.app.playSakuraScript("\\0\\s10触りすぎだよっ、もう…！\\e");
        } else {
          this.app.playSakuraScript("\\0\\s0くすぐったいよ〜！\\e");
        }
      } else {
        this.app.playSakuraScript("\\0\\s0こんにちは！\\w5\\n\\q[話しかける,Talk]\\n\\q[なでる,Stroke]\\e");
      }
      return;
    }

    try {
      const response = await globalThis.__TAURI__.invoke("send_shiori_event", {
        event: eventName,
      });
      if (response && response.trim()) {
        this.app.playSakuraScript(response);
      } else {
        this.app.playSakuraScript("\\0\\s0……\\e");
      }
    } catch (_error) {
      this.app.playSakuraScript("\\0\\s0エラーが発生したよ。\\e");
    }
  }

  updateSurface(surfaceId) {
    this.app.surfaceManager.setSurfaceId(surfaceId);
    const ghostName = this.currentGhost?.name || "mock_nanai";
    const img = document.querySelector(".character-placeholder img");
    if (img) {
      img.src = `assets/ghost/${ghostName}/shell/master/surface${surfaceId}.png`;
      img.onerror = () => {
        img.src = `assets/ghost/${ghostName}/shell/master/surface0.png`;
      };
    }
  }

  updateGhostCharacter(ghostName) {
    const placeholder = document.querySelector(".character-placeholder");
    if (!placeholder) return;

    if (!ghostName) {
      placeholder.innerHTML = "";
      return;
    }

    placeholder.innerHTML = `<img src="assets/ghost/${ghostName}/shell/master/surface0.png" 
                                   alt="${ghostName}" 
                                   style="width: 100%; height: 100%; object-fit: contain;" 
                                   onerror="console.error('画像読み込みエラー'); this.style.display='none';">`;
    placeholder.title = ghostName || "";
  }

  updateCurrentGhostDisplay() {
    const currentGhostEl = document.getElementById("current-ghost");
    if (currentGhostEl) {
      currentGhostEl.textContent = this.currentGhost ? this.currentGhost.name : "未選択";
    }
  }
}
