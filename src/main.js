import { GhostController } from "./js/ghost.js";
import { InteractionManager } from "./js/interaction.js";
import { ModalManager } from "./js/modal.js";
import { SakuraScriptPlayer } from "./js/sakura-script.js";
import { SurfaceManager } from "./js/surface.js";

export class NanaiAndroidMascotApp {
  constructor() {
    this.isInitialized = false;
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

    this.initUIEnvironment();
    this.modalManager = new ModalManager(this);
    this.loadSettings();
    this.setupEventListeners();
    this.applySettings();

    // ゴースト初期化
    if (this.settings.autoLoadGhost) {
      await this.ghostController.autoLoadGhost();
    } else {
      this.ghostController.selectGhost("mock_nanai");
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
    };
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
      this.toggleMenu();
    });

    this.elements.quickBubble?.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleMenu();
    });

    document.addEventListener("click", () => {
      this.hideMenu();
    });

    // バルーンクリックで文字送りスキップ
    this.elements.balloonDisplay?.addEventListener("click", () => {
      this.sakuraPlayer.skip();
    });

    document.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      this.toggleMenu();
    });

    // キーボードショートカット
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.modalManager?.hide();
        this.hideMenu();
      }
    });

    // iframe メニューからの postMessage 受信
    globalThis.addEventListener("message", (event) => {
      if (event.data?.type === "menu-action") {
        this.hideMenu();
        const action = event.data.action;

        // 特殊アクションのハンドリング
        if (action === "talk") {
          this.onGhostClick();
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

        if (action === "close") {
          this.showBalloon("さようなら…！");
          setTimeout(() => {
            if (globalThis.__TAURI__) {
              // Tauriウィンドウ閉じる
              globalThis.window.close();
            }
          }, 1000);
          return;
        }

        if (action === "close-menu") {
          return;
        }

        if (action === "minimize") {
          this.showBalloon("また呼んでね！");
          setTimeout(() => {
            if (this.elements.ghostDisplay) {
              this.elements.ghostDisplay.style.opacity = "0.2";
            }
          }, 1000);
          return;
        }

        // 個別ゴーストへの直接切り替え
        if (action === "switch-to-ghost" && event.data.payload) {
          this.ghostController.selectGhost(event.data.payload);
          return;
        }

        // シェル（着せ替え）の直接切り替え
        if (action === "switch-to-shell" && event.data.payload) {
          this.ghostController.selectShell(event.data.payload);
          return;
        }

        // ゴースト切り替え / 汎用モーダル
        const modalKey = action === "ghost-switch" ? "ghost" : action;
        const contentId = `${modalKey}-modal-content`;
        this.modalManager?.show(contentId);
      }
    });
  }

  onGhostClick(clientX, clientY, rect, scopeId = 0) {
    let partName = "";
    if (clientX !== undefined && clientY !== undefined && rect) {
      const result = this.surfaceManager.detectCollision(clientX, clientY, rect);
      partName = result.name;
    }

    console.log(`🖱️ ゴーストタップ: スコープ=${scopeId}, 部位=${partName || "なし"}`);
    if (globalThis.__TAURI__) {
      globalThis.__TAURI__.invoke("on_mouse_click").catch(() => {});
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

  toggleMenu() {
    if (!this.elements.menuContainer) return;
    const isVisible = this.elements.menuContainer.style.display !== "none";
    const nextState = isVisible ? "none" : "block";
    this.elements.menuContainer.style.display = nextState;

    if (nextState === "block") {
      this.syncMenuGhosts();
    }
  }

  syncMenuGhosts() {
    const iframe = document.getElementById("menu-iframe");
    if (iframe?.contentWindow) {
      // ゴースト一覧同期
      iframe.contentWindow.postMessage(
        {
          type: "sync-ghosts",
          ghosts: this.ghostController.ghosts || [{ name: "mock_nanai" }],
          currentGhost: this.ghostController.currentGhost,
        },
        "*"
      );
      // シェル一覧同期
      iframe.contentWindow.postMessage(
        {
          type: "sync-shells",
          shells: this.ghostController.shells || ["master"],
          currentShell: this.ghostController.currentShell || "master",
        },
        "*"
      );
    }
  }

  hideMenu() {
    if (this.elements.menuContainer) {
      this.elements.menuContainer.style.display = "none";
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

    setInterval(async () => {
      secondCounter++;

      if (this.ghostController.currentGhost) {
        if (globalThis.__TAURI__) {
          try {
            await globalThis.__TAURI__.invoke("on_second_change");
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

  setBalloonTheme(themeId) {
    this.settings.balloonTheme = themeId;
    localStorage.setItem("mascot-nanai-settings", JSON.stringify(this.settings));
    this.applyBalloonTheme();
    this.showBalloon(`バルーンを「${themeId}」に変更しました。`);
    setTimeout(() => this.hideBalloon(), 1500);
  }

  applyBalloonTheme() {
    const theme = this.settings.balloonTheme || "default";
    const balloonEls = document.querySelectorAll(".balloon");
    balloonEls.forEach((el) => {
      el.classList.remove(
        "balloon-theme-classic",
        "balloon-theme-comic",
        "balloon-theme-dark"
      );
      if (theme !== "default") {
        el.classList.add(`balloon-theme-${theme}`);
      }
    });
  }
}

// アプリケーション起動
globalThis.addEventListener("DOMContentLoaded", () => {
  globalThis.mascotApp = new NanaiAndroidMascotApp();
});
