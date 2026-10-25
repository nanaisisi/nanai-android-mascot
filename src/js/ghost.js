import { ShioriProtocol } from "./shiori-protocol.js";
import { invoke, isTauriAvailable } from "./tauri-helper.js";
import { AppConfig } from "./config.js";

/**
 * Nanai Android Mascot - ゴースト & SHIORI 管理モジュール
 */

export class GhostController {
  constructor(app) {
    this.app = app;
    this.ghosts = [];
    this.currentGhost = null;
    this.shells = [AppConfig.paths.fallbackShellName];
    this.currentShell = AppConfig.paths.fallbackShellName;
  }


  async autoLoadGhost() {
    console.log("🔄 自動ゴースト読み込み開始...");
    try {
      const savedGhost = localStorage.getItem(AppConfig.storageKeys.lastGhost);
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
      this.updateGhostCharacter(AppConfig.paths.fallbackGhostName);
    }
  }

  async verifyGhostExists(ghostInfo) {
    if (!isTauriAvailable()) return false;
    try {
      const result = await invoke("scan_ghosts", {
        ghostPath: ghostInfo.path || AppConfig.paths.defaultGhostDir,
      });
      return result.ghosts?.some((g) => g.name === ghostInfo.name) || false;
    } catch (error) {
      console.error("ゴースト存在確認エラー:", error);
      return false;
    }
  }

  async scanGhosts() {
    if (!isTauriAvailable()) {
      return this.ghosts;
    }
    try {
      const result = await invoke("scan_ghosts", {
        ghostPath: AppConfig.paths.defaultGhostDir,
      });
      this.ghosts = result.ghosts || [];
      this.syncWithMenu();
      return this.ghosts;
    } catch (error) {
      console.error("❌ ゴーストスキャンエラー:", error);
      return this.ghosts;
    }
  }

  async scanAndLoadFirstGhost() {
    if (!isTauriAvailable()) {
      console.log(`Tauri環境ではありません - デフォルト${AppConfig.paths.fallbackGhostName}を使用`);
      this.selectGhost(AppConfig.paths.fallbackGhostName);
      return;
    }

    try {
      const result = await invoke("scan_ghosts", {
        ghostPath: AppConfig.paths.defaultGhostDir,
      });
      this.ghosts = result.ghosts || [];
      this.syncWithMenu();
      if (this.ghosts.length > 0) {
        const defaultGhost = this.ghosts.find((g) => g.name === AppConfig.paths.fallbackGhostName) || this.ghosts[0];
        this.selectGhost(defaultGhost.name);
      } else {
        this.selectGhost(AppConfig.paths.fallbackGhostName);
      }
    } catch (error) {
      console.error("❌ ゴーストスキャンエラー:", error);
      this.selectGhost(AppConfig.paths.fallbackGhostName);
    }
  }

  selectGhost(ghostName) {
    const ghost = this.ghosts.find((g) => g.name === ghostName) || {
      name: ghostName,
      path: `${AppConfig.paths.defaultGhostDir}/${ghostName}`,
    };

    this.currentGhost = ghost;
    this.updateCurrentGhostDisplay();
    this.updateGhostCharacter(ghostName);
    localStorage.setItem(AppConfig.storageKeys.lastGhost, JSON.stringify(ghost));

    this.initializeGhostSHIORI(ghost);
    this.currentShell = AppConfig.paths.fallbackShellName;
    this.app.surfaceManager.loadSurfacesTxt(ghost.path || `${AppConfig.paths.defaultGhostDir}/${ghostName}`);
    this.app.showBalloon(`ゴースト「${ghostName}」を選択しました。`);
    setTimeout(() => this.app.hideBalloon(), 2000);
  }

  selectShell(shellName) {
    this.currentShell = shellName;
    const ghostName = this.currentGhost?.name || AppConfig.paths.fallbackGhostName;
    const ghostPath = this.currentGhost?.path || `${AppConfig.paths.defaultGhostDir}/${ghostName}`;
    const fallbackShell = AppConfig.paths.fallbackShellName;
    console.log(`👗 シェル切り替え: ${shellName}`);

    // サーフィス画像の更新
    const img = document.querySelector("#sakura-placeholder img");
    if (img) {
      img.onerror = () => {
        img.onerror = () => {
          img.onerror = null;
          img.src = `${ghostPath}/shell/${fallbackShell}/surface0.svg`;
        };
        img.src = `${ghostPath}/shell/${fallbackShell}/surface0.png`;
      };
      img.src = `${ghostPath}/shell/${shellName}/surface0.png`;
    }

    // surfaces.txt の再読み込み
    this.app.surfaceManager.loadSurfacesTxt(`${ghostPath}/shell/${shellName}`);

    // SHIORIへの通知
    this.sendShioriEvent("OnShellChanged", [shellName]);
    this.app.showBalloon(`シェルを「${shellName}」に変更しました。`);
    setTimeout(() => this.app.hideBalloon(), 1500);
  }


  async initializeGhostSHIORI(ghost) {
    if (!isTauriAvailable()) return;
    try {
      console.log(`🎭 SHIORI初期化開始: ${ghost.name}`);
      await invoke("load_ghost", { ghostName: ghost.name });
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
    if (!isTauriAvailable()) {
      console.log(`[Web/Mock] SHIORIイベントスキップ (Tauri未検出): ${eventName}`);
      return;
    }

    try {
      // SHIORI/3.0 標準リクエストの構築
      const requestText = ShioriProtocol.buildRequest(eventName, args);
      console.log(`📤 送信 SHIORI/3.0 リクエスト:\n${requestText}`);

      let response = "";
      try {
        response = await invoke("send_shiori_request", {
          request: requestText,
        });
      } catch (_e) {
        response = await invoke("send_shiori_event", {
          event: eventName,
        });
      }

      // SHIORI/3.0 レスポンスのパース (200 OK 且つスクリプトが存在する場合のみ再生)
      if (response && response.trim()) {
        const parsed = ShioriProtocol.parseResponse(response);
        const script = parsed.value || (parsed.status === 200 ? response : "");
        if (script && script.trim()) {
          this.app.playSakuraScript(script);
        }
      }
    } catch (error) {
      console.warn(`SHIORIイベント送信失敗 (${eventName}):`, error);
    }
  }

  triggerRandomTalk() {
    // SHIORI の OnRandomTalk / OnSecondChange に委譲
    this.sendShioriEvent("OnRandomTalk");
  }

  updateSurface(surfaceId, scopeId = 0) {
    const ghostName = this.currentGhost?.name || AppConfig.paths.fallbackGhostName;
    const ghostPath = this.currentGhost?.path || `${AppConfig.paths.defaultGhostDir}/${ghostName}`;
    const shell = this.currentShell || AppConfig.paths.fallbackShellName;
    const selector = scopeId === 1 ? "#kero-placeholder img" : "#sakura-placeholder img";
    const placeholder = scopeId === 1 ? document.getElementById("kero-placeholder") : document.getElementById("sakura-placeholder");
    const container = scopeId === 1 ? document.getElementById("kero-display") : document.getElementById("ghost-display");

    if (scopeId === 0) {
      this.app.surfaceManager.setSurfaceId(surfaceId);
    }

    if (scopeId === 1 && container && container.style.display === "none") {
      container.style.display = "flex";
      // keroをsakuraの少し左下に配置
      const sakuraRect = this.app.elements.ghostDisplay?.getBoundingClientRect();
      if (sakuraRect) {
        container.style.left = `${Math.max(80, sakuraRect.left - 100)}px`;
        container.style.top = `${sakuraRect.top + 60}px`;
      }
    }

    const fallbackSurface = scopeId === 1 ? 10 : 0;
    const img = document.querySelector(selector);
    if (!img && placeholder) {
      placeholder.innerHTML = `<img src="${ghostPath}/shell/${shell}/surface${surfaceId}.png" 
                                     alt="scope${scopeId}" 
                                     style="width: 100%; height: 100%; object-fit: contain;"
                                     onerror="this.onerror=null; this.src='${ghostPath}/shell/${shell}/surface${fallbackSurface}.svg';">`;
      return;
    }

    if (img) {
      img.onerror = () => {
        img.onerror = () => {
          img.onerror = null;
          img.src = `${ghostPath}/shell/${shell}/surface${fallbackSurface}.svg`;
        };
        img.src = `${ghostPath}/shell/${shell}/surface${fallbackSurface}.png`;
      };
      img.src = `${ghostPath}/shell/${shell}/surface${surfaceId}.png`;
    }
  }

  updateGhostCharacter(ghostName) {
    const sakuraPlaceholder = document.getElementById("sakura-placeholder") || document.querySelector(".character-placeholder");
    if (!sakuraPlaceholder) return;

    if (!ghostName) {
      sakuraPlaceholder.innerHTML = "";
      return;
    }

    const ghostPath = this.currentGhost?.path || `${AppConfig.paths.defaultGhostDir}/${ghostName}`;
    const shell = this.currentShell || AppConfig.paths.fallbackShellName;
    const imgPath = `${ghostPath}/shell/${shell}/surface0.png`;
    const svgPath = `${ghostPath}/shell/${shell}/surface0.svg`;
    sakuraPlaceholder.innerHTML = `<img src="${imgPath}" 
                                   alt="${ghostName}" 
                                   style="width: 100%; height: 100%; object-fit: contain; pointer-events: auto;" 
                                   onerror="console.error('❌ 画像読み込み失敗: ' + this.src); this.onerror=null; this.src='${svgPath}';">`;
    sakuraPlaceholder.title = ghostName || "";
  }

  updateCurrentGhostDisplay() {
    const currentGhostEl = document.getElementById("current-ghost");
    if (currentGhostEl) {
      currentGhostEl.textContent = this.currentGhost ? this.currentGhost.name : "未選択";
    }
  }
}
