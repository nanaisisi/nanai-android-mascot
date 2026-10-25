import { emit, invoke, isTauriAvailable } from "./tauri-helper.js";

const BALLOON_THEMES = ["emily4", "ivory", "pixel", "comic", "dark"];
const THEME_LABELS = {
  emily4: "Emily/Phase4 クラシックバルーン",
  ivory: "アイボリー（象牙色レトロ）",
  pixel: "ドット絵・ピクセル風（レトロゲーム）",
  comic: "ポップコミック（太枠丸み）",
  dark: "サイバーダーク（夜間・ハイコントラスト）",
};
const SCALE_MAP = {
  "scale-50": { width: "100px", height: "200px" },
  "scale-75": { width: "150px", height: "300px" },
  "scale-100": { width: "200px", height: "400px" },
  "scale-125": { width: "250px", height: "500px" },
  "scale-150": { width: "300px", height: "600px" },
  "scale-200": { width: "400px", height: "800px" },
};

/** SHIORIイベントへ単純転送するアクション */
// ※ベースウェア側未実装: 外部ブラウザ起動・updates2.dau照合・RSSパーサー等は今後拡張
const SHIORI_ACTIONS = {
  recommend: ["OnChoiceSelect", ["recommendlink"]],
  portal: ["OnChoiceSelect", ["portal"]],
  update: ["OnUpdate"],
  headline: ["OnHeadline"],
};

export const actionMethods = {
  /**
   * メニューアクションを処理
   * @this {import('../../main.js').NanaiAndroidMascotApp}
   * @param {string} action
   * @param {any} [payload]
   */
  handleMenuAction(action, payload = null) {
    if (!action) return;
    const gc = this.ghostController;

    if (action === "talk") return this.onGhostClick();

    if (SHIORI_ACTIONS[action]) {
      gc.sendShioriEvent(...SHIORI_ACTIONS[action]);
      return;
    }

    if (action === "scan") return gc.scanGhosts();
    if (action === "install") return this.modalManager?.show("install-modal-content");
    if (action === "balloon" || action === "balloon-cycle") return this.cycleBalloonTheme();
    if (action.startsWith("balloon-theme-")) {
      const theme = action.replace("balloon-theme-", "");
      this.setBalloonTheme(theme);
      this.showBalloon(`バルーンスキンを「${THEME_LABELS[theme] || theme}」に変更しました`);
      setTimeout(() => this.hideBalloon(), 2000);
      return;
    }
    if (action.startsWith("scale-")) return this.applyShellScaleAction(action);
    if (action === "close" || action === "exit") return this.closeApp();
    if (action === "close-menu") return;
    if (action === "minimize") return this.minimizeApp();
    if (action === "switch-to-ghost" && payload) return gc.selectGhost(payload);
    if (action === "switch-to-shell" && payload) return gc.selectShell(payload);

    // ゴースト切り替え / 汎用モーダル
    const modalKey = action === "ghost-switch" ? "ghost" : action;
    this.modalManager?.show(`${modalKey}-modal-content`);
  },

  cycleBalloonTheme() {
    const idx = BALLOON_THEMES.indexOf(this.currentBalloonTheme);
    const next = BALLOON_THEMES[(idx + 1) % BALLOON_THEMES.length];
    this.setBalloonTheme(next);
    this.showBalloon(`バルーンスキンを「${THEME_LABELS[next] || next}」に変更しました`);
    setTimeout(() => this.hideBalloon(), 2000);
  },

  applyShellScaleAction(action) {
    const conf = SCALE_MAP[action] || SCALE_MAP["scale-100"];
    if (this.elements.ghostDisplay) {
      this.elements.ghostDisplay.style.width = conf.width;
      this.elements.ghostDisplay.style.height = conf.height;
    }
    this.showBalloon(`シェル倍率を ${action.replace("scale-", "")}% に変更しました`);
    setTimeout(() => this.hideBalloon(), 1500);
  },

  minimizeApp() {
    this.hideMenu();
    try {
      this.ghostController.sendShioriEvent("OnWindowStateMinimize");
    } catch (_e) {
      // エラー無視
    }
    if (isTauriAvailable()) {
      invoke("minimize_app").catch((err) => console.error("minimize_app failed:", err));
    }
  },

  setBalloonTheme(themeName) {
    this.currentBalloonTheme = themeName;
    document.documentElement.setAttribute("data-balloon-theme", themeName);
    document.body.className = `balloon-theme-${themeName}`;
    this.elements.balloonDisplay?.setAttribute("data-balloon-theme", themeName);
    if (isTauriAvailable()) {
      emit("sync-theme", themeName);
    }
  },

  switchToNextGhost() {
    const ghosts = this.ghostController.ghosts || [];
    if (ghosts.length <= 1) return;
    const currentName = this.ghostController.currentGhost?.name;
    const idx = ghosts.findIndex((g) => g.name === currentName);
    const next = ghosts[(idx + 1) % ghosts.length];
    if (next) this.ghostController.selectGhost(next.name);
  },
};
