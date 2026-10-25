import { invoke, isTauriAvailable, listen } from "./tauri-helper.js";

export const eventMethods = {
  setupEventListeners() {
    this.setupGhostInteractions();
    this.setupUiButtons();
    this.setupGlobalListeners();
    this.setupExternalMenuListeners();
  },

  setupGhostInteractions() {
    const bind = (el, scopeId) => {
      if (!el) return;
      this.interactionManager.setupDragging(
        el,
        (x, y, rect) => this.onGhostClick(x, y, rect, scopeId),
        (x, y, rect) => this.onGhostStroke(x, y, rect, scopeId)
      );
    };
    bind(this.elements.ghostDisplay, 0);
    bind(this.elements.keroDisplay, 1);
  },

  setupUiButtons() {
    this.elements.menuBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      const rect = this.elements.menuBtn.getBoundingClientRect();
      const sX = globalThis.screenX ?? 0;
      const sY = globalThis.screenY ?? 0;
      this.toggleMenu(e.screenX || sX + rect.right, e.screenY || sY + rect.bottom);
    });

    this.elements.quickBubble?.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleQuickActionsPanel();
    });

    const quick = {
      "qa-talk-btn": () => this.onGhostClick(),
      "qa-ghost-btn": () => this.switchToNextGhost(),
      "qa-balloon-btn": () => this.handleMenuAction("balloon"),
      "qa-minimize-btn": () => this.handleMenuAction("minimize"),
    };
    for (const [id, fn] of Object.entries(quick)) {
      document.getElementById(id)?.addEventListener("click", (e) => {
        e.stopPropagation();
        this.hideQuickActionsPanel();
        fn();
      });
    }

    this.elements.balloonDisplay?.addEventListener("click", () => this.sakuraPlayer.skip());
  },

  setupGlobalListeners() {
    document.addEventListener("click", () => {
      this.hideMenu();
      this.hideQuickActionsPanel();
    });

    document.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      this.toggleMenu(e.screenX, e.screenY);
    });

    document.addEventListener("keydown", (e) => {
      const key = e.key.toLowerCase();
      if (e.key === "Escape") {
        this.modalManager?.hide();
        this.hideMenu();
      } else if ((e.ctrlKey || e.metaKey) && (key === "w" || key === "q")) {
        e.preventDefault();
        this.closeApp();
      }
    });
  },

  setupExternalMenuListeners() {
    const forward = (event) => {
      const data = event.payload;
      if (!data) return;
      if (data.action === "request-sync") {
        this.syncMenuGhosts();
        return;
      }
      this.handleMenuAction(data.action, data.payload);
    };
    listen("menu-action", forward);
    listen("native-menu-action", forward);

    // iframe メニューからの postMessage 受信
    globalThis.addEventListener("message", (event) => {
      if (event.data?.type !== "menu-action") return;
      const action = event.data.action;
      if (action === "request-sync") {
        this.syncMenuGhosts();
        return;
      }
      this.hideMenu();
      this.handleMenuAction(action, event.data.payload);
    });
  },

  onGhostClick(clientX, clientY, rect, scopeId = 0) {
    const partName = this.detectPart(clientX, clientY, rect);
    console.log(`🖱️ ゴーストタップ: スコープ=${scopeId}, 部位=${partName || "なし"}`);
    if (isTauriAvailable()) {
      invoke("on_mouse_click").catch(() => {});
    }
    this.ghostController.sendShioriEvent("OnMouseClick", ["", partName, scopeId]);
  },

  onGhostStroke(clientX, clientY, rect, scopeId = 0) {
    const partName = this.detectPart(clientX, clientY, rect);
    console.log(`🖐️ ゴースト撫で（Stroke）: スコープ=${scopeId}, 部位=${partName || "なし"}`);
    this.ghostController.sendShioriEvent("OnMouseMove", ["", partName, scopeId]);
  },

  detectPart(clientX, clientY, rect) {
    if (clientX !== undefined && clientY !== undefined && rect) {
      return this.surfaceManager.detectCollision(clientX, clientY, rect).name;
    }
    return "";
  },
};
