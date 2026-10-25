import { AppConfig } from "./config.js";
import { ShioriProtocol } from "./shiori-protocol.js";
import { convertFileSrc, invoke, isTauriAvailable } from "./tauri-helper.js";

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
      // 1. スキャンを実行して利用可能なゴースト一覧を取得
      await this.scanGhosts();

      // 2. config.local.toml 由来の state.last_ghost / state.last_ghosts を確認
      const configLastGhost = AppConfig.state?.last_ghost;
      const savedGhost = localStorage.getItem(AppConfig.storageKeys.lastGhost);
      const targetGhostName = configLastGhost || (savedGhost ? JSON.parse(savedGhost)?.name : null);

      if (targetGhostName) {
        const found = this.ghosts.find((g) => g.name === targetGhostName);
        if (found) {
          console.log(`🎯 前回選択されたゴーストをロード: ${targetGhostName}`);
          this.selectGhost(targetGhostName);
          return;
        }
      }

      await this.scanAndLoadFirstGhost();
    } catch (error) {
      console.error("❌ 自動ゴースト読み込みエラー:", error);
      this.selectGhost(AppConfig.paths.fallbackGhostName);
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
      const scanned = result.ghosts || [];

      // config.local.toml の last_ghosts 順にソート（直近ロードされたものが上位）
      const historyOrder = AppConfig.state?.last_ghosts || [];
      if (historyOrder.length > 0) {
        scanned.sort((a, b) => {
          const indexA = historyOrder.indexOf(a.name);
          const indexB = historyOrder.indexOf(b.name);
          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          return a.name.localeCompare(b.name);
        });
      }

      this.ghosts = scanned;
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
      if (this.ghosts.length === 0) {
        await this.scanGhosts();
      }
      if (this.ghosts.length > 0) {
        this.selectGhost(this.ghosts[0].name);
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

    // Rustバックエンド（config.local.toml）へ読み込み履歴を永続化
    if (isTauriAvailable()) {
      invoke("record_ghost_loaded", { ghostName }).catch((err) => {
        console.warn("⚠️ record_ghost_loaded failed:", err);
      });
    }

    this.initializeGhostSHIORI(ghost);
    this.currentShell = AppConfig.paths.fallbackShellName;
    this.app.surfaceManager.loadSurfacesTxt(ghost.path || `${AppConfig.paths.defaultGhostDir}/${ghostName}`);
  }


  selectShell(shellName) {
    this.currentShell = shellName;
    const ghostName = this.currentGhost?.name || AppConfig.paths.fallbackGhostName;
    const ghostPath = this.currentGhost?.path || `${AppConfig.paths.defaultGhostDir}/${ghostName}`;
    console.log(`👗 シェル切り替え: ${shellName}`);

    // サーフィス画像の更新
    this.updateSurface(0, 0);

    // surfaces.txt の再読み込み
    this.app.surfaceManager.loadSurfacesTxt(`${ghostPath}/shell/${shellName}`);

    // SHIORIへの通知
    this.sendShioriEvent("OnShellChanged", [shellName]);
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
      if (response?.trim()) {
        const parsed = ShioriProtocol.parseResponse(response);
        const script = parsed.value || (parsed.status === 200 ? response : "");
        if (script?.trim()) {
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

    const slot = scopeId === 1 ? document.getElementById("kero-slot") : document.getElementById("ghost-container");

    // \s[-1]: キャラクターサーフェス消去指示
    if (surfaceId === -1 || surfaceId === "-1") {
      if (scopeId === 1 && slot) {
        slot.style.display = "none";
      } else if (scopeId === 0 && container) {
        container.style.visibility = "hidden";
      }
      return;
    }

    if (scopeId === 0) {
      if (container) container.style.visibility = "visible";
      this.app.surfaceManager.setSurfaceId(surfaceId);
    }

    if (scopeId === 1) {
      if (slot && slot.style.display === "none") {
        slot.style.display = "flex";
      }
      if (container && container.style.display === "none") {
        container.style.display = "flex";
      }
    }

    const fallbackSurface = scopeId === 1 ? 10 : 0;
    const img = document.querySelector(selector);

    const applyImageSrc = async (src, fallbackSrc = null) => {
      // 伺かの伝統的な緑背景（#00FF00 / 左上色）を透過処理
      let transparentSrc = src;
      if (src && this.app?.surfaceManager?.processChromaKey) {
        try {
          transparentSrc = await this.app.surfaceManager.processChromaKey(src);
        } catch (_e) {
          transparentSrc = src;
        }
      }

      if (img) {
        img.style.display = "block";
        if (fallbackSrc) {
          img.onerror = () => {
            img.onerror = null;
            img.src = fallbackSrc;
          };
        } else {
          img.onerror = null;
        }
        img.src = transparentSrc;
      } else if (placeholder) {
        const errorAttr = fallbackSrc ? `onerror="this.onerror=null; this.src='${fallbackSrc}';"` : "";
        placeholder.innerHTML = `<img src="${transparentSrc}" 
                                       alt="scope${scopeId}" 
                                       ${errorAttr}
                                       style="width: 100%; height: 100%; object-fit: contain; pointer-events: auto;">`;
      }
    };

    if (isTauriAvailable()) {
      invoke("load_surface_image", {
        ghostPath,
        shellName: shell,
        surfaceId: String(surfaceId),
      })
        .then((dataUrl) => applyImageSrc(dataUrl))
        .catch((err) => {
          console.warn("load_surface_image 失敗、フォールバック:", err);
          invoke("load_surface_image", {
            ghostPath,
            shellName: shell,
            surfaceId: String(fallbackSurface),
          })
            .then((fallbackUrl) => applyImageSrc(fallbackUrl))
            .catch(() => {
              if (img) img.style.display = "none";
            });
        });
      return;
    }

    const imgUrl = convertFileSrc(`${ghostPath}/shell/${shell}/surface${surfaceId}.png`);
    const fallbackSvgUrl = convertFileSrc(`${ghostPath}/shell/${shell}/surface${fallbackSurface}.svg`);
    applyImageSrc(imgUrl, fallbackSvgUrl);
  }

  updateGhostCharacter(ghostName) {
    const sakuraPlaceholder = document.getElementById("sakura-placeholder") || document.querySelector(".character-placeholder");
    if (!sakuraPlaceholder) return;

    if (!ghostName) {
      sakuraPlaceholder.innerHTML = "";
      return;
    }
    sakuraPlaceholder.title = ghostName || "";
    this.updateSurface(0, 0);
  }

  updateCurrentGhostDisplay() {
    const currentGhostEl = document.getElementById("current-ghost");
    if (currentGhostEl) {
      currentGhostEl.textContent = this.currentGhost ? this.currentGhost.name : "未選択";
    }
  }
}
