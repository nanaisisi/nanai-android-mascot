import { AppConfig } from "../core/config.js";
import { emit, invoke, isTauriAvailable } from "../core/tauri-helper.js";

/** メニュー/クイックパネル関連メソッド (NanaiAndroidMascotApp に mixin) */
export const menuMethods = {
  /**
   * メニューの表示/非表示を切り替え
   * @this {import('../../main.js').NanaiAndroidMascotApp}
   * @param {number|null} [screenX]
   * @param {number|null} [screenY]
   * @param {number} [scope]
   */
  toggleMenu(screenX = null, screenY = null, scope = 0) {
    if (isTauriAvailable()) {
      const sX = globalThis.screenX ?? 0;
      const sY = globalThis.screenY ?? 0;
      const posX = screenX !== null ? screenX : sX + 200;
      const posY = screenY !== null ? screenY : sY + 100;

      // 独立したバルーンスキン連動メニューウィンドウを表示 (枠外にはみ出して表示可能)
      invoke("show_menu_window", { x: posX, y: posY, scope })
        .then(() => this.syncMenuGhosts(scope))
        .catch((err) => {
          console.warn("show_menu_window failed, fallback to show_context_menu:", err);
          const gc = this.ghostController;
          invoke("show_context_menu", {
            ghosts: (gc.ghosts || []).map((g) => g.name),
            currentGhost: gc.currentGhost?.name || null,
            shells: gc.shells || ["master"],
            currentShell: gc.currentShell || "master",
          }).catch(() => this.toggleHtmlMenu(scope));
        });
      return;
    }
    this.toggleHtmlMenu(scope);
  },

  toggleHtmlMenu(scope = 0) {
    if (!this.elements.menuContainer) return;
    const isVisible = this.elements.menuContainer.style.display !== "none";
    const nextState = isVisible ? "none" : "block";
    this.elements.menuContainer.style.display = nextState;
    if (nextState === "block") {
      this.syncMenuGhosts(scope);
    }
  },

  syncMenuGhosts(scope = 0) {
    const gc = this.ghostController;
    const shellNames = gc.shells || ["master"];
    const currentShellName = gc.currentShell || "master";
    const ghosts = gc.ghosts || [{ name: AppConfig.paths.fallbackGhostName }];
    const fullShells = gc.currentGhost?.shells || shellNames;

    // 独立メニューウィンドウへの状態同期
    if (isTauriAvailable()) {
      emit("sync-ghosts", {
        ghosts,
        currentGhost: gc.currentGhost?.name || gc.currentGhost,
        shells: fullShells,
        currentShell: currentShellName,
      });
      emit("sync-theme", this.currentBalloonTheme);
      emit("sync-menu-scope", scope);
    }

    // iframe メニューへの同期 (フォールバック)
    const win = document.getElementById("menu-iframe")?.contentWindow;
    if (win) {
      win.postMessage({ type: "sync-scope", scope }, "*");
      win.postMessage({ type: "sync-ghosts", ghosts, currentGhost: gc.currentGhost }, "*");
      win.postMessage({ type: "sync-shells", shells: shellNames, currentShell: currentShellName }, "*");
      win.postMessage({ type: "sync-theme", theme: this.currentBalloonTheme }, "*");
    }
  },

  hideMenu() {
    if (this.elements.menuContainer) {
      this.elements.menuContainer.style.display = "none";
    }
    this.hideQuickActionsPanel();
  },

  toggleQuickActionsPanel() {
    if (!this.elements.quickActionsPanel) return;
    const isVisible = this.elements.quickActionsPanel.style.display !== "none";
    this.elements.quickActionsPanel.style.display = isVisible ? "none" : "flex";
  },

  hideQuickActionsPanel() {
    if (this.elements.quickActionsPanel) {
      this.elements.quickActionsPanel.style.display = "none";
    }
  },
};
