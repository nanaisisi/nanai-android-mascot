import { AppConfig } from "../core/config.js";
import { convertFileSrc, emit, invoke, isTauriAvailable } from "../core/tauri-helper.js";

const byId = (id) => document.getElementById(id);

/** サーフェス/キャラクター表示メソッド (GhostController に mixin) */
export const ghostSurfaceMethods = {
  /**
   * サーフェス表示を更新
   * @this {import('../ghost/ghost.js').GhostController}
   * @param {number|string} surfaceId
   * @param {number} [scopeId]
   */
  updateSurface(surfaceId, scopeId = 0) {
    const ghostName = this.currentGhost?.name || AppConfig.paths.fallbackGhostName;
    const ghostPath = this.currentGhost?.path || `${AppConfig.paths.defaultGhostDir}/${ghostName}`;
    const shell = this.currentShell || AppConfig.paths.fallbackShellName;
    const isSubchar = scopeId >= 1;
    const selector = isSubchar ? "#kero-placeholder img" : "#sakura-placeholder img";
    const placeholder = byId(isSubchar ? "kero-placeholder" : "sakura-placeholder");
    const container = byId(isSubchar ? "kero-display" : "ghost-display");
    const slot = byId(isSubchar ? "kero-slot" : "ghost-container");

    // \s[-1]: キャラクターサーフェス消去指示
    if (surfaceId === -1 || surfaceId === "-1") {
      if (slot) slot.style.display = "none";
      if (container) container.style.visibility = "hidden";
      if (isTauriAvailable()) {
        invoke("hide_subchar_window", { scopeId }).catch(() => {});
      }
      return;
    }

    if (isSubchar) {
      if (isTauriAvailable()) {
        if (slot) slot.style.display = "none";
        if (container) container.style.display = "none";
        invoke("show_subchar_window", { scopeId }).catch(() => {});
      } else {
        if (slot && slot.style.display === "none") slot.style.display = "flex";
        if (container && container.style.display === "none") container.style.display = "flex";
      }
    } else {
      // メインキャラクター (スコープ0) は常にメインウィンドウで表示
      if (slot && slot.style.display === "none") slot.style.display = "flex";
      if (container) {
        container.style.display = "flex";
        container.style.visibility = "visible";
      }
      this.app.surfaceManager.setSurfaceId(surfaceId);
    }

    const fallbackSurface = isSubchar ? 10 : 0;
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

      if (isTauriAvailable()) {
        emit(`update-subchar-image-${scopeId}`, { src: transparentSrc });
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
      const load = (id) =>
        invoke("load_surface_image", { ghostPath, shellName: shell, surfaceId: String(id) });
      load(surfaceId)
        .then((dataUrl) => applyImageSrc(dataUrl))
        .catch((err) => {
          console.warn("load_surface_image 失敗、フォールバック:", err);
          load(fallbackSurface)
            .then((fallbackUrl) => applyImageSrc(fallbackUrl))
            .catch(() => {
              if (img) img.style.display = "none";
              if (isSubchar && slot) slot.style.display = "none";
            });
        });
      return;
    }

    const imgUrl = convertFileSrc(`${ghostPath}/shell/${shell}/surface${surfaceId}.png`);
    const fallbackSvgUrl = convertFileSrc(`${ghostPath}/shell/${shell}/surface${fallbackSurface}.svg`);
    applyImageSrc(imgUrl, fallbackSvgUrl);
  },

  updateGhostCharacter(ghostName) {
    const sakuraPlaceholder =
      byId("sakura-placeholder") || document.querySelector(".character-placeholder");
    const keroPlaceholder = byId("kero-placeholder");
    const keroSlot = byId("kero-slot");
    if (!sakuraPlaceholder) return;

    if (!ghostName) {
      sakuraPlaceholder.innerHTML = "";
      if (keroPlaceholder) keroPlaceholder.innerHTML = "";
      if (keroSlot) keroSlot.style.display = "none";
      return;
    }
    sakuraPlaceholder.title = ghostName;
    // メインキャラの初期化時にサブキャラ枠がメイン画面背後に残らないよう初期非表示
    if (keroSlot) keroSlot.style.display = "none";
    if (keroPlaceholder) keroPlaceholder.innerHTML = "";

    // 0: メインキャラクター (sakura) の初期サーフェス \s0 のみ表示
    this.updateSurface(0, 0);

    // ゴースト側に kero.name 等のサブキャラ設定が存在する場合のみ、またはスクリプトからの明示呼び出し時にサブウィンドウで表示
    const hasKero = Boolean(this.currentGhost?.kero_name);
    if (hasKero) {
      this.updateSurface(10, 1);
    } else if (isTauriAvailable()) {
      invoke("hide_subchar_window", { scopeId: 1 }).catch(() => {});
    }
  },

  updateCurrentGhostDisplay() {
    const el = byId("current-ghost");
    if (el) {
      el.textContent = this.currentGhost ? this.currentGhost.name : "未選択";
    }
  },
};
