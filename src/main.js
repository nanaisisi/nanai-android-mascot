import { GhostController } from "./js/ghost.js";
import { InteractionManager } from "./js/interaction.js";
import { ModalManager } from "./js/modal.js";
import { SakuraScriptPlayer } from "./js/sakura-script.js";
import { SurfaceManager } from "./js/surface.js";
import { emit, invoke, isTauriAvailable, listen } from "./js/tauri-helper.js";
import { AppConfig, loadAppConfig } from "./js/config.js";

export class NanaiAndroidMascotApp {
  constructor() {
    this.isInitialized = false;
    this.currentBalloonTheme = "classic";
    this.settings = {
      autoLoadGhost: true,
      enableNotifications: true,
      darkMode: false,
      alwaysOnTop: true,
      ghostSize: "medium",
      debugLevel: "info",
    };

    this.ghostController = new GhostController(this);
    this.interactionManager = new InteractionManager(this);
    this.surfaceManager = new SurfaceManager(this);
    this.sakuraPlayer = new SakuraScriptPlayer(this);
    this.modalManager = null;

    this.elements = {};
    this.init();
  }

  async init() {
    console.log("=== Nanai Android Mascot 初期化開始 ===");

    await loadAppConfig();
    this.initUIEnvironment();

    this.modalManager = new ModalManager(this);
    this.loadSettings();
    this.setupEventListeners();
    this.applySettings();

    // ゴースト初期化
    if (this.settings.autoLoadGhost) {
      await this.ghostController.autoLoadGhost();
    } else {
      this.ghostController.selectGhost(AppConfig.paths.fallbackGhostName);
    }

    this.startSecondTimer();
    this.isInitialized = true;
    console.log("✅ Nanai Android Mascot 初期化完了");
  }

  initUIEnvironment() {
    this.elements = {
      ghostDisplay: document.getElementById("ghost-display"),
      ghostCharacter: document.getElementById("ghost-character"),
      keroDisplay: document.getElementById("kero-display"),
      keroCharacter: document.getElementById("kero-character"),
      balloonDisplay: document.getElementById("balloon-display"),
      balloonText: document.getElementById("balloon-text"),
      keroBalloonDisplay: document.getElementById("kero-balloon-display"),
      keroBalloonText: document.getElementById("kero-balloon-text"),
      menuContainer: document.getElementById("menu-iframe-container"),
      menuBtn: document.getElementById("menu-btn"),
      quickBubble: document.getElementById("quick-bubble"),
      quickActionsPanel: document.getElementById("quick-actions-panel"),
    };
  }

  /**
   * アプリケーションを安全に終了
   */
  async closeApp() {
    try {
      this.hideMenu();
      this.modalManager?.hide();
      // SHIORI OnCloseイベント通知
      try {
        await this.ghostController.sendShioriEvent("OnClose");
      } catch (_e) {
        // エラー無視
      }

      this.showBalloon("さようなら…！");
      setTimeout(async () => {
        if (isTauriAvailable()) {
          try {
            await invoke("exit_app");
          } catch (_e) {
            globalThis.window.close();
          }
        } else {
          globalThis.window.close();
        }
      }, 1000);
    } catch (_err) {
      if (isTauriAvailable()) {
        invoke("exit_app").catch(() => globalThis.window.close());
      } else {
        globalThis.window.close();
      }
    }
  }

  setupEventListeners() {
    // ドラッグ & タップ & 撫でインタラクション（当たり判定連動: sakura）
    this.interactionManager.setupDragging(
      this.elements.ghostDisplay,
      (clientX, clientY, rect) => {
        this.onGhostClick(clientX, clientY, rect, 0);
      },
      (clientX, clientY, rect) => {
        this.onGhostStroke(clientX, clientY, rect, 0);
      }
    );

    // ドラッグ & タップ & 撫でインタラクション（kero）
    if (this.elements.keroDisplay) {
      this.interactionManager.setupDragging(
        this.elements.keroDisplay,
        (clientX, clientY, rect) => {
          this.onGhostClick(clientX, clientY, rect, 1);
        },
        (clientX, clientY, rect) => {
          this.onGhostStroke(clientX, clientY, rect, 1);
        }
      );
    }


    // メニュー表示切り替え
    this.elements.menuBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      const rect = this.elements.menuBtn.getBoundingClientRect();
      const sX = globalThis.screenX ?? 0;
      const sY = globalThis.screenY ?? 0;
      this.toggleMenu(e.screenX || (sX + rect.right), e.screenY || (sY + rect.bottom));
    });

    // クイックアクションパネル表示切り替え
    this.elements.quickBubble?.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleQuickActionsPanel();
    });

    document.getElementById("qa-talk-btn")?.addEventListener("click", (e) => {
      e.stopPropagation();
      this.hideQuickActionsPanel();
      this.onGhostClick();
    });

    document.getElementById("qa-ghost-btn")?.addEventListener("click", (e) => {
      e.stopPropagation();
      this.hideQuickActionsPanel();
      this.switchToNextGhost();
    });

    document.getElementById("qa-balloon-btn")?.addEventListener("click", (e) => {
      e.stopPropagation();
      this.hideQuickActionsPanel();
      this.handleMenuAction("balloon");
    });

    document.getElementById("qa-minimize-btn")?.addEventListener("click", (e) => {
      e.stopPropagation();
      this.hideQuickActionsPanel();
      this.handleMenuAction("minimize");
    });

    document.addEventListener("click", () => {
      this.hideMenu();
      this.hideQuickActionsPanel();
    });

    // バルーンクリックで文字送りスキップ
    this.elements.balloonDisplay?.addEventListener("click", () => {
      this.sakuraPlayer.skip();
    });

    document.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      this.toggleMenu(e.screenX, e.screenY);
    });

    // キーボードショートカット
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.modalManager?.hide();
        this.hideMenu();
      } else if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === "w" || e.key.toLowerCase() === "q")) {
        e.preventDefault();
        this.closeApp();
      }
    });

    // 独立メニューウィンドウ / ネイティブメニューからのイベント受信
    listen("menu-action", (event) => {
      const data = event.payload;
      if (data) {
        this.handleMenuAction(data.action, data.payload);
      }
    });

    listen("native-menu-action", (event) => {
      const data = event.payload;
      if (data) {
        this.handleMenuAction(data.action, data.payload);
      }
    });

    // iframe メニューからの postMessage 受信
    globalThis.addEventListener("message", (event) => {
      if (event.data?.type === "menu-action") {
        const action = event.data.action;

        if (action === "request-sync") {
          this.syncMenuGhosts();
          return;
        }

        this.hideMenu();
        this.handleMenuAction(action, event.data.payload);
      }
    });
  }

  handleMenuAction(action, payload = null) {
    if (!action) return;

    // --- 1. ゴースト側対話アクション ---
    if (action === "talk") {
      this.onGhostClick();
      return;
    }

    // [SHIORI連携] おすすめサイト (OnChoiceSelect / \![open,recommendlink])
    // ※ベースウェア側未実装: 外部ブラウザ自動起動・ブックマーク同期は今後のフェーズで拡張
    if (action === "recommend") {
      this.ghostController.sendShioriEvent("OnChoiceSelect", ["recommendlink"]);
      return;
    }

    // [SHIORI連携] ポータルサイト (OnChoiceSelect / \![open,portal])
    // ※ベースウェア側未実装: descript.txt内のportalurl自動オープンは今後のフェーズで拡張
    if (action === "portal") {
      this.ghostController.sendShioriEvent("OnChoiceSelect", ["portal"]);
      return;
    }

    // --- 2. ツール・更新・メンテナンス系 ---
    if (action === "update") {
      // [SHIORI連携] OnUpdate イベント送出
      // ※ベースウェア側未実装: updates2.dau MD5ハッシュ照合・自動ダウンロードエンジン
      this.ghostController.sendShioriEvent("OnUpdate");
      return;
    }

    if (action === "headline") {
      // [SHIORI連携] OnHeadline イベント送出
      // ※ベースウェア側未実装: 外部RSS/Atomフィードパーサー
      this.ghostController.sendShioriEvent("OnHeadline");
      return;
    }

    if (action === "scan") {
      this.ghostController.scanGhosts();
      return;
    }

    if (action === "install") {
      this.modalManager?.openModal("install");
      return;
    }

    if (action === "balloon") {
      const themes = ["classic", "pixel", "comic", "dark"];
      const currentIndex = themes.indexOf(this.currentBalloonTheme);
      const nextTheme = themes[(currentIndex + 1) % themes.length];
      this.setBalloonTheme(nextTheme);

      const themeLabels = {
        classic: "クラシック伺か（象牙色レトロ）",
        pixel: "ドット絵・ピクセル風（レトロゲーム）",
        comic: "ポップコミック（太枠丸み）",
        dark: "サイバーダーク（夜間・ハイコントラスト）",
      };
      this.showBalloon(`バルーンスキンを「${themeLabels[nextTheme] || nextTheme}」に変更しました`);
      setTimeout(() => this.hideBalloon(), 2000);
      return;
    }

    if (action.startsWith("scale-")) {
      const scaleMap = {
        "scale-50": { width: "100px", height: "200px" },
        "scale-75": { width: "150px", height: "300px" },
        "scale-100": { width: "200px", height: "400px" },
        "scale-125": { width: "250px", height: "500px" },
        "scale-150": { width: "300px", height: "600px" },
        "scale-200": { width: "400px", height: "800px" },
      };
      const scaleConf = scaleMap[action] || { width: "200px", height: "400px" };
      if (this.elements.ghostDisplay) {
        this.elements.ghostDisplay.style.width = scaleConf.width;
        this.elements.ghostDisplay.style.height = scaleConf.height;
      }
      const percent = action.replace("scale-", "");
      this.showBalloon(`シェル倍率を ${percent}% に変更しました`);
      setTimeout(() => this.hideBalloon(), 1500);
      return;
    }

    if (action === "close" || action === "exit") {
      this.closeApp();
      return;
    }

    if (action === "close-menu") {
      return;
    }

    if (action === "minimize") {
      this.hideMenu();
      try {
        this.ghostController.sendShioriEvent("OnWindowStateMinimize");
      } catch (_e) {
        // エラー無視
      }
      if (isTauriAvailable()) {
        invoke("minimize_app").catch((err) => console.error("minimize_app failed:", err));
      }
      return;
    }

    // 個別ゴーストへの直接切り替え
    if (action === "switch-to-ghost" && payload) {
      this.ghostController.selectGhost(payload);
      return;
    }

    // シェル（着せ替え）の直接切り替え
    if (action === "switch-to-shell" && payload) {
      this.ghostController.selectShell(payload);
      return;
    }

    // ゴースト切り替え / 汎用モーダル
    const modalKey = action === "ghost-switch" ? "ghost" : action;
    const contentId = `${modalKey}-modal-content`;
    this.modalManager?.show(contentId);
  }

  setBalloonTheme(themeName) {
    this.currentBalloonTheme = themeName;
    document.documentElement.setAttribute("data-balloon-theme", themeName);
    document.body.className = `balloon-theme-${themeName}`;
    if (this.elements.balloonDisplay) {
      this.elements.balloonDisplay.setAttribute("data-balloon-theme", themeName);
    }
    // メニューウィンドウへもテーマ同期
    if (isTauriAvailable()) {
      emit("sync-theme", themeName);
    }
  }

  onGhostClick(clientX, clientY, rect, scopeId = 0) {
    let partName = "";
    if (clientX !== undefined && clientY !== undefined && rect) {
      const result = this.surfaceManager.detectCollision(clientX, clientY, rect);
      partName = result.name;
    }

    console.log(`🖱️ ゴーストタップ: スコープ=${scopeId}, 部位=${partName || "なし"}`);
    if (isTauriAvailable()) {
      invoke("on_mouse_click").catch(() => {});
    }
    // SHIORIイベント送信 (イベント名, [選択肢ID/引数, 部位名, スコープID])
    this.ghostController.sendShioriEvent("OnMouseClick", ["", partName, scopeId]);
  }

  onGhostStroke(clientX, clientY, rect, scopeId = 0) {
    let partName = "";
    if (clientX !== undefined && clientY !== undefined && rect) {
      const result = this.surfaceManager.detectCollision(clientX, clientY, rect);
      partName = result.name;
    }

    console.log(`🖐️ ゴースト撫で（Stroke）: スコープ=${scopeId}, 部位=${partName || "なし"}`);
    // SHIORIイベント送信 (OnMouseMove: 撫で)
    this.ghostController.sendShioriEvent("OnMouseMove", ["", partName, scopeId]);
  }

  toggleMenu(screenX = null, screenY = null) {
    if (isTauriAvailable()) {
      const sX = globalThis.screenX ?? 0;
      const sY = globalThis.screenY ?? 0;
      const posX = screenX !== null ? screenX : (sX + 200);
      const posY = screenY !== null ? screenY : (sY + 100);

      // 独立したバルーンスキン連動メニューウィンドウを表示 (枠外にはみ出して表示可能)
      invoke("show_menu_window", {
        x: posX,
        y: posY,
      }).then(() => {
        this.syncMenuGhosts();
      }).catch((err) => {
        console.warn("show_menu_window failed, fallback to show_context_menu:", err);
        const ghostNames = (this.ghostController.ghosts || []).map((g) => g.name);
        const currentGhostName = this.ghostController.currentGhost?.name || null;
        const shellNames = this.ghostController.shells || ["master"];
        const currentShellName = this.ghostController.currentShell || "master";
        invoke("show_context_menu", {
          ghosts: ghostNames,
          currentGhost: currentGhostName,
          shells: shellNames,
          currentShell: currentShellName,
        }).catch(() => this.toggleHtmlMenu());
      });
      return;
    }
    this.toggleHtmlMenu();
  }

  toggleHtmlMenu() {
    if (!this.elements.menuContainer) return;
    const isVisible = this.elements.menuContainer.style.display !== "none";
    const nextState = isVisible ? "none" : "block";
    this.elements.menuContainer.style.display = nextState;

    if (nextState === "block") {
      this.syncMenuGhosts();
    }
  }

  syncMenuGhosts() {
    const shellNames = this.ghostController.shells || ["master"];
    const currentShellName = this.ghostController.currentShell || "master";

    // 独立メニューウィンドウへの状態同期
    if (isTauriAvailable()) {
      emit("sync-ghosts", {
        ghosts: this.ghostController.ghosts || [{ name: AppConfig.paths.fallbackGhostName }],
        currentGhost: this.ghostController.currentGhost,
        shells: shellNames,
        currentShell: currentShellName,
      });
      emit("sync-theme", this.currentBalloonTheme);
    }

    // iframe メニューへの同期 (フォールバック)
    const iframe = document.getElementById("menu-iframe");
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(
        {
          type: "sync-ghosts",
          ghosts: this.ghostController.ghosts || [{ name: AppConfig.paths.fallbackGhostName }],
          currentGhost: this.ghostController.currentGhost,
        },
        "*"
      );
      iframe.contentWindow.postMessage(
        {
          type: "sync-shells",
          shells: shellNames,
          currentShell: currentShellName,
        },
        "*"
      );
      iframe.contentWindow.postMessage(
        {
          type: "sync-theme",
          theme: this.currentBalloonTheme,
        },
        "*"
      );
    }
  }

  hideMenu() {
    if (this.elements.menuContainer) {
      this.elements.menuContainer.style.display = "none";
    }
    this.hideQuickActionsPanel();
  }

  toggleQuickActionsPanel() {
    if (!this.elements.quickActionsPanel) return;
    const isVisible = this.elements.quickActionsPanel.style.display !== "none";
    this.elements.quickActionsPanel.style.display = isVisible ? "none" : "flex";
  }

  hideQuickActionsPanel() {
    if (this.elements.quickActionsPanel) {
      this.elements.quickActionsPanel.style.display = "none";
    }
  }

  switchToNextGhost() {
    const ghosts = this.ghostController.ghosts || [];
    if (ghosts.length <= 1) return;
    const currentName = this.ghostController.currentGhost?.name;
    const currentIndex = ghosts.findIndex((g) => g.name === currentName);
    const nextIndex = (currentIndex + 1) % ghosts.length;
    const nextGhost = ghosts[nextIndex];
    if (nextGhost) {
      this.ghostController.selectGhost(nextGhost.name);
    }
  }

  showBalloon(text) {
    if (this.elements.balloonText && this.elements.balloonDisplay) {
      this.elements.balloonText.textContent = text;
      this.elements.balloonDisplay.style.display = "block";
    }
  }

  playSakuraScript(script) {
    return this.sakuraPlayer.play(script);
  }

  hideBalloon() {
    if (this.elements.balloonDisplay) {
      this.elements.balloonDisplay.style.display = "none";
    }
  }

  startSecondTimer() {
    let secondCounter = 0;
    const talkInterval = 60 + Math.floor(Math.random() * 30); // 60〜90秒ごとにランダムトーク

    // ウィンドウ表示・復帰時のOnWindowStateRestoreハンドリング
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        this.ghostController.sendShioriEvent("OnWindowStateRestore");
      }
    });

    setInterval(async () => {
      secondCounter++;

      if (this.ghostController.currentGhost) {
        // 60秒ごとのOnMinuteChange通知
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
          // ブラウザ/モック環境でのランダムトーク
          secondCounter = 0;
          if (!this.sakuraPlayer.isPlaying) {
            this.ghostController.sendShioriEvent("OnSecondChange");
          }
        }
      }
    }, 1000);
  }

  loadSettings() {
    try {
      const saved = localStorage.getItem("nanai-android-mascot-settings");
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      }
    } catch (_error) {
      // 設定未保存またはパース失敗時はデフォルト維持
    }
  }

  applySettings() {
    if (this.settings.darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }

    // シェル倍率 (パーセンテージ指定: 50%〜200%)
    const scalePercent = parseInt(this.settings.shellScale, 10) || 100;
    const baseW = 200;
    const baseH = 400;
    if (this.elements.ghostDisplay) {
      this.elements.ghostDisplay.style.width = `${Math.round((baseW * scalePercent) / 100)}px`;
      this.elements.ghostDisplay.style.height = `${Math.round((baseH * scalePercent) / 100)}px`;
    }

    // バルーン倍率
    const balloonPercent = parseInt(this.settings.balloonScale, 10) || 100;
    if (this.elements.balloonDisplay) {
      this.elements.balloonDisplay.style.transform = `translateX(-50%) scale(${balloonPercent / 100})`;
      this.elements.balloonDisplay.style.transformOrigin = "bottom center";
    }

    // バルーンテーマ適用
    this.applyBalloonTheme();
  }

  applyBalloonTheme() {
    const theme = this.settings.balloonTheme || this.currentBalloonTheme || "classic";
    this.setBalloonTheme(theme);
  }
}

// アプリケーション起動
globalThis.addEventListener("DOMContentLoaded", () => {
  globalThis.mascotApp = new NanaiAndroidMascotApp();
});
