import { GhostController } from "./js/ghost.js";
import { InteractionManager } from "./js/interaction.js";
import { ModalManager } from "./js/modal.js";
import { SakuraScriptPlayer } from "./js/sakura-script.js";

export class MascotNanaiApp {
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
    this.sakuraPlayer = new SakuraScriptPlayer(this);
    this.modalManager = null;

    this.elements = {};
    this.init();
  }

  async init() {
    console.log("=== Mascot Nanai 初期化開始 ===");

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
    console.log("✅ Mascot Nanai 初期化完了");
  }

  initUIEnvironment() {
    this.elements = {
      ghostDisplay: document.getElementById("ghost-display"),
      ghostCharacter: document.getElementById("ghost-character"),
      balloonDisplay: document.getElementById("balloon-display"),
      balloonText: document.getElementById("balloon-text"),
      menuContainer: document.getElementById("menu-iframe-container"),
      menuBtn: document.getElementById("menu-btn"),
      quickBubble: document.getElementById("quick-bubble"),
    };
  }

  setupEventListeners() {
    // ドラッグ & タップインタラクション
    this.interactionManager.setupDragging(this.elements.ghostDisplay, () => {
      this.onGhostClick();
    });

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
            "scale-50": "60px",
            "scale-75": "90px",
            "scale-100": "120px",
            "scale-125": "150px",
            "scale-150": "180px",
            "scale-200": "240px",
          };
          const newSize = scaleMap[action] || "120px";
          if (this.elements.ghostDisplay) {
            this.elements.ghostDisplay.style.width = newSize;
            this.elements.ghostDisplay.style.height = newSize;
          }
          this.showBalloon(`シェル倍率を変更しました`);
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

        if (action === "minimize") {
          this.showBalloon("また呼んでね！");
          setTimeout(() => {
            if (this.elements.ghostDisplay) {
              this.elements.ghostDisplay.style.opacity = "0.2";
            }
          }, 1000);
          return;
        }

        const contentId = `${action}-modal-content`;
        this.modalManager?.show(contentId);
      }
    });
  }

  onGhostClick() {
    console.log("🖱️ ゴーストをつつきました");
    if (globalThis.__TAURI__) {
      globalThis.__TAURI__.invoke("on_mouse_click").catch(() => {});
    }
    this.ghostController.sendShioriEvent("OnMouseClick");
  }

  toggleMenu() {
    if (!this.elements.menuContainer) return;
    const isVisible = this.elements.menuContainer.style.display !== "none";
    this.elements.menuContainer.style.display = isVisible ? "none" : "block";
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
    setInterval(async () => {
      if (this.ghostController.currentGhost && globalThis.__TAURI__) {
        try {
          await globalThis.__TAURI__.invoke("on_second_change");
        } catch (_error) {
          // SHIORI未ロードまたは非サポート時は無視
        }
      }
    }, 1000);
  }

  loadSettings() {
    try {
      const saved = localStorage.getItem("mascot-nanai-settings");
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

    const sizes = { small: "80px", medium: "120px", large: "160px" };
    const size = sizes[this.settings.ghostSize] || sizes.medium;
    if (this.elements.ghostDisplay) {
      this.elements.ghostDisplay.style.width = size;
      this.elements.ghostDisplay.style.height = size;
    }
  }
}

// アプリケーション起動
globalThis.addEventListener("DOMContentLoaded", () => {
  globalThis.mascotApp = new MascotNanaiApp();
});
