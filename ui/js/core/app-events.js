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
      el.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleMenu(e.screenX, e.screenY, scopeId);
      });
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

    // サブキャラクターウィンドウ初期ロード時の画像同期要求を受信
    listen("request-subchar-image", (event) => {
      const scopeId = event.payload?.scopeId;
      if (typeof scopeId === "number") {
        const cachedSrc = this.ghostController?.currentSurfaces?.get(scopeId);
        if (cachedSrc) {
          import("./tauri-helper.js").then(({ emit }) => {
            emit(`update-subchar-image-${scopeId}`, { src: cachedSrc });
          });
        }
      }
    });

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
    const col = this.getCollisionInfo(clientX, clientY, rect);
    console.log(`🖱️ ゴーストタップ: スコープ=${scopeId}, 部位=${col.name || "なし"} (X:${col.canvasX}, Y:${col.canvasY})`);
    if (isTauriAvailable()) {
      invoke("on_mouse_click").catch(() => {});
    }

    // SHIORI/3.0 標準準拠引数
    // Reference0: X座標, Reference1: Y座標, Reference2: ホイール, Reference3: スコープ, Reference4: 部位名, Reference5: ボタン(0:左)
    const args = [col.canvasX, col.canvasY, 0, scopeId, col.name || "", 0];

    // まず OnMouseDoubleClick (つつき) を送信 (多くのゴーストがつつきトークを定義)
    this.ghostController.sendShioriEvent("OnMouseDoubleClick", args).then((res) => {
      // つつき反応が無かった場合は OnMouseClick もフォールバック送信
      if (!res?.script) {
        this.ghostController.sendShioriEvent("OnMouseClick", args);
      }
    });
  },

  onGhostStroke(clientX, clientY, rect, scopeId = 0) {
    const col = this.getCollisionInfo(clientX, clientY, rect);
    console.log(`🖐️ ゴースト撫で（Stroke）: スコープ=${scopeId}, 部位=${col.name || "なし"}`);
    // Reference0: X座標, Reference1: Y座標, Reference2: ホイール/移動, Reference3: スコープ, Reference4: 部位名
    this.ghostController.sendShioriEvent("OnMouseMove", [col.canvasX, col.canvasY, 0, scopeId, col.name || ""]);
  },

  getCollisionInfo(clientX, clientY, rect) {
    if (clientX !== undefined && clientY !== undefined && rect && this.surfaceManager) {
      return this.surfaceManager.detectCollision(clientX, clientY, rect);
    }
    return { name: "", canvasX: 0, canvasY: 0 };
  },

  detectPart(clientX, clientY, rect) {
    return this.getCollisionInfo(clientX, clientY, rect).name;
  },
};
